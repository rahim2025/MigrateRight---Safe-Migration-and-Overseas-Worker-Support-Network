const VALID_SERVICE_TYPES = ['visa', 'work_permit', 'full_package'];
const VALID_WORKER_CATEGORIES = ['domestic', 'construction', 'healthcare', 'other'];

const baseFeesByService = {
  visa: { visaApplicationFee: 120, medicalTestsFee: 80, documentProcessingFee: 60, trainingFee: 0 },
  work_permit: { visaApplicationFee: 0, medicalTestsFee: 100, documentProcessingFee: 120, trainingFee: 50 },
  full_package: { visaApplicationFee: 150, medicalTestsFee: 120, documentProcessingFee: 150, trainingFee: 100 },
};

const adjustmentsByCountry = {
  default: 1,
  'saudi arabia': 1.05,
  'uae': 1.08,
  'qatar': 1.07,
  'singapore': 1.12,
  'malaysia': 0.95,
};

const multipliersByCategory = {
  domestic: 0.95,
  construction: 1.1,
  healthcare: 1.05,
  other: 1,
};

const computeLegalFeeBreakdown = ({ destinationCountry, serviceType, workerCategory }) => {
  const normalizedCountry = destinationCountry.trim().toLowerCase();
  const serviceKey = serviceType || 'full_package';
  const categoryKey = workerCategory || 'other';
  const base = baseFeesByService[serviceKey];
  const countryFactor = adjustmentsByCountry[normalizedCountry] ?? adjustmentsByCountry.default;
  const categoryFactor = multipliersByCategory[categoryKey];

  const visaApplicationFee = Math.round(base.visaApplicationFee * countryFactor * categoryFactor);
  const medicalTestsFee = Math.round(base.medicalTestsFee * countryFactor * categoryFactor);
  const documentProcessingFee = Math.round(base.documentProcessingFee * countryFactor * categoryFactor);
  const trainingFee = Math.round(base.trainingFee * countryFactor * categoryFactor);
  const totalLegalFee = visaApplicationFee + medicalTestsFee + documentProcessingFee + trainingFee;

  return {
    serviceKey,
    categoryKey,
    breakdown: {
      visaApplicationFee,
      medicalTestsFee,
      documentProcessingFee,
      trainingFee,
      totalLegalFee,
    },
  };
};

exports.calculateLegalFees = async (req, res, next) => {
  try {
    const { destinationCountry, serviceType, agencyId, workerCategory } = req.body || {};

    if (!destinationCountry || typeof destinationCountry !== 'string') {
      return res.status(400).json({ message: 'destinationCountry is required' });
    }
    if (serviceType && !VALID_SERVICE_TYPES.includes(serviceType)) {
      return res.status(400).json({ message: 'Invalid serviceType' });
    }
    if (workerCategory && !VALID_WORKER_CATEGORIES.includes(workerCategory)) {
      return res.status(400).json({ message: 'Invalid workerCategory' });
    }

    const legal = computeLegalFeeBreakdown({ destinationCountry, serviceType, workerCategory });

    return res.status(200).json({
      destinationCountry,
      agencyId: agencyId || null,
      workerCategory: legal.categoryKey,
      serviceType: legal.serviceKey,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      legalFeeBreakdown: legal.breakdown,
    });
  } catch (err) {
    return next(err);
  }
};

exports.compareLegalFees = async (req, res, next) => {
  try {
    const { destinationCountry, serviceType, workerCategory, actualFees = {}, agencyId, hiddenCharges, upfrontPaymentPercentage, debtBondageTerms } = req.body || {};

    if (!destinationCountry || typeof destinationCountry !== 'string') {
      return res.status(400).json({ message: 'destinationCountry is required' });
    }
    if (serviceType && !VALID_SERVICE_TYPES.includes(serviceType)) {
      return res.status(400).json({ message: 'Invalid serviceType' });
    }
    if (workerCategory && !VALID_WORKER_CATEGORIES.includes(workerCategory)) {
      return res.status(400).json({ message: 'Invalid workerCategory' });
    }
    if (actualFees && typeof actualFees !== 'object') {
      return res.status(400).json({ message: 'actualFees must be an object' });
    }

    const legal = computeLegalFeeBreakdown({ destinationCountry, serviceType, workerCategory });
    const feeTypes = ['visaApplicationFee', 'medicalTestsFee', 'documentProcessingFee', 'trainingFee'];

    let overallStatus = 'fair';
    let totalDifference = 0;
    const warnings = [];

    const itemizedComparison = feeTypes.map((feeType) => {
      const legalAmount = legal.breakdown[feeType] || 0;
      const actualAmountRaw = actualFees?.[feeType];
      const actualAmount = Number.isFinite(Number(actualAmountRaw)) && Number(actualAmountRaw) >= 0 ? Number(actualAmountRaw) : 0;
      const differenceAmount = actualAmount - legalAmount;
      const differencePercentage = legalAmount ? (differenceAmount / legalAmount) * 100 : 0;

      let status = 'fair';
      if (differencePercentage > 15) status = 'overcharged';
      else if (differencePercentage > 5) status = 'moderate';

      if (status === 'overcharged') overallStatus = 'overcharged';
      else if (status === 'moderate' && overallStatus === 'fair') overallStatus = 'moderate';

      // exploitation warnings
      if (differencePercentage > 20) {
        warnings.push({
          warningType: 'fee_overcharge_high',
          severity: 'high',
          message: `${feeType} exceeds legal fee by more than 20%`,
          recommendation: 'Request detailed breakdown or report to authorities',
          affectedFeeCategory: feeType,
        });
      } else if (differencePercentage >= 15) {
        warnings.push({
          warningType: 'fee_overcharge_medium',
          severity: 'medium',
          message: `${feeType} exceeds legal fee by 15-20%`,
          recommendation: 'Negotiate or seek clarification from agency',
          affectedFeeCategory: feeType,
        });
      }

      totalDifference += differenceAmount;

      return {
        feeType,
        legalAmount,
        actualAmount,
        difference: {
          amount: Number(differenceAmount.toFixed(2)),
          percentage: Number(differencePercentage.toFixed(2)),
        },
        status,
      };
    });

    const hasHiddenCharges = Array.isArray(hiddenCharges) ? hiddenCharges.length > 0 : Boolean(hiddenCharges);
    if (hasHiddenCharges) {
      warnings.push({
        warningType: 'hidden_charges',
        severity: 'high',
        message: 'Hidden or unexplained charges detected',
        recommendation: 'Demand itemized invoice and refuse unexplained fees',
        affectedFeeCategory: 'misc',
      });
    }

    const upfrontPct = Number(upfrontPaymentPercentage);
    if (Number.isFinite(upfrontPct) && upfrontPct > 50) {
      warnings.push({
        warningType: 'upfront_payment_high',
        severity: 'medium',
        message: 'Upfront payment demand exceeds 50%',
        recommendation: 'Request staged payments tied to milestones',
        affectedFeeCategory: 'upfront_payment',
      });
    }

    if (debtBondageTerms) {
      warnings.push({
        warningType: 'debt_bondage_terms',
        severity: 'critical',
        message: 'Contract contains debt bondage terms',
        recommendation: 'Do not sign and report to regulators immediately',
        affectedFeeCategory: 'contract_terms',
      });
      overallStatus = 'overcharged';
    }

    return res.status(200).json({
      destinationCountry,
      agencyId: agencyId || null,
      workerCategory: legal.categoryKey,
      serviceType: legal.serviceKey,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      itemizedComparison,
      totalDifference: Number(totalDifference.toFixed(2)),
      overallStatus,
      warnings,
    });
  } catch (err) {
    return next(err);
  }
};
