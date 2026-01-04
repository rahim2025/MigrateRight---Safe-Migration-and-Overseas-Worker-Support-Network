import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import * as countryGuideService from '../../services/countryGuideService';
import './CountryGuideDetail.css';

const CountryGuideDetail = () => {
  const { country } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadGuide();
  }, [country, language]);

  const loadGuide = async () => {
    try {
      setLoading(true);
      const response = await countryGuideService.getGuideByCountry(country, language);
      setGuide(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading country guide:', err);
      setError(err.message || 'Failed to load country guide');
    } finally {
      setLoading(false);
    }
  };

  const formatJobType = (jobType) => {
    return jobType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatSalary = (min, max, currency, period) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / ${period}`;
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="country-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t?.loading || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="country-detail-container">
        <div className="error-container">
          <h2>⚠️ {t?.error || 'Error'}</h2>
          <p>{error || t?.guideNotFound || 'Country guide not found'}</p>
          <button onClick={() => navigate('/country-guides')}>
            ← {t?.backToList || 'Back to Country List'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="country-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate('/country-guides')}>
          ← {t?.back || 'Back'}
        </button>
        
        <div className="header-content">
          <div className="header-title">
            <span className="header-flag">{guide.flagEmoji}</span>
            <div>
              <h1>{guide.country}</h1>
              <p className="header-region">{guide.region}</p>
            </div>
          </div>
          
          {!guide.isUpToDate?.() && (
            <div className="update-warning">
              ⚠️ {t?.infoMayBeOutdated || 'Information may be outdated. Please verify with official sources.'}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="section-nav">
        <button
          className={activeSection === 'overview' ? 'active' : ''}
          onClick={() => scrollToSection('overview')}
        >
          {t?.overview || 'Overview'}
        </button>
        <button
          className={activeSection === 'salary' ? 'active' : ''}
          onClick={() => scrollToSection('salary')}
        >
          {t?.salaryInfo || 'Salary Info'}
        </button>
        <button
          className={activeSection === 'culture' ? 'active' : ''}
          onClick={() => scrollToSection('culture')}
        >
          {t?.culture || 'Culture'}
        </button>
        <button
          className={activeSection === 'legal' ? 'active' : ''}
          onClick={() => scrollToSection('legal')}
        >
          {t?.legalRights || 'Legal Rights'}
        </button>
        <button
          className={activeSection === 'emergency' ? 'active' : ''}
          onClick={() => scrollToSection('emergency')}
        >
          {t?.emergency || 'Emergency'}
        </button>
        <button
          className={activeSection === 'living' ? 'active' : ''}
          onClick={() => scrollToSection('living')}
        >
          {t?.livingCosts || 'Living Costs'}
        </button>
      </nav>

      {/* Content */}
      <div className="detail-content">
        {/* Overview Section */}
        <section id="overview" className="content-section">
          <h2>{t?.overview || 'Overview'}</h2>
          <p className="overview-text">{guide.overview?.[language]}</p>
        </section>

        {/* Salary Information */}
        <section id="salary" className="content-section">
          <h2>{t?.salaryRanges || 'Salary Ranges by Job Type'}</h2>
          {guide.salaryRanges && guide.salaryRanges.length > 0 ? (
            <div className="salary-grid">
              {guide.salaryRanges.map((range, idx) => (
                <div key={idx} className="salary-card">
                  <h3>{range.title?.[language] || formatJobType(range.jobType)}</h3>
                  <p className="salary-amount">
                    {formatSalary(range.minSalary, range.maxSalary, range.currency, range.period)}
                  </p>
                  {range.notes?.[language] && (
                    <p className="salary-notes">{range.notes[language]}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>{t?.noSalaryData || 'No salary information available.'}</p>
          )}
        </section>

        {/* Culture Section */}
        <section id="culture" className="content-section">
          <h2>{t?.cultureAndCustoms || 'Culture & Customs'}</h2>
          
          {guide.culture?.language && (
            <div className="culture-subsection">
              <h3>{t?.languages || 'Languages'}</h3>
              <p>
                <strong>{t?.official || 'Official'}:</strong>{' '}
                {guide.culture.language.official?.join(', ')}
              </p>
              {guide.culture.language.commonlySpoken?.length > 0 && (
                <p>
                  <strong>{t?.commonlySpoken || 'Commonly Spoken'}:</strong>{' '}
                  {guide.culture.language.commonlySpoken.join(', ')}
                </p>
              )}
            </div>
          )}

          {guide.culture?.religion && (
            <div className="culture-subsection">
              <h3>{t?.religion || 'Religion'}</h3>
              <p><strong>{t?.primary || 'Primary'}:</strong> {guide.culture.religion.primary}</p>
              {guide.culture.religion.important?.[language] && (
                <p className="info-text">{guide.culture.religion.important[language]}</p>
              )}
            </div>
          )}

          {guide.culture?.customs && (
            <div className="culture-subsection">
              <h3>{t?.customsAndEtiquette || 'Customs & Etiquette'}</h3>
              
              {guide.culture.customs.dressCode?.[language] && (
                <div className="custom-item">
                  <h4>{t?.dressCode || 'Dress Code'}</h4>
                  <p>{guide.culture.customs.dressCode[language]}</p>
                </div>
              )}

              {guide.culture.customs.workCulture?.[language] && (
                <div className="custom-item">
                  <h4>{t?.workCulture || 'Work Culture'}</h4>
                  <p>{guide.culture.customs.workCulture[language]}</p>
                </div>
              )}

              {guide.culture.customs.publicBehavior?.[language] && (
                <div className="custom-item">
                  <h4>{t?.publicBehavior || 'Public Behavior'}</h4>
                  <p>{guide.culture.customs.publicBehavior[language]}</p>
                </div>
              )}
            </div>
          )}

          {guide.culture?.doAndDonts && (
            <div className="dos-donts-grid">
              {guide.culture.doAndDonts.dos?.length > 0 && (
                <div className="dos-section">
                  <h3>✅ {t?.dos || "Do's"}</h3>
                  <ul>
                    {guide.culture.doAndDonts.dos.map((item, idx) => (
                      <li key={idx}>{item[language]}</li>
                    ))}
                  </ul>
                </div>
              )}

              {guide.culture.doAndDonts.donts?.length > 0 && (
                <div className="donts-section">
                  <h3>❌ {t?.donts || "Don'ts"}</h3>
                  <ul>
                    {guide.culture.doAndDonts.donts.map((item, idx) => (
                      <li key={idx}>{item[language]}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Legal Rights Section */}
        <section id="legal" className="content-section">
          <h2>{t?.legalRightsAndProtections || 'Legal Rights & Protections'}</h2>
          
          {guide.legalRights?.laborLaws && (
            <div className="legal-subsection">
              <h3>{t?.laborLaws || 'Labor Laws'}</h3>
              
              <div className="legal-grid">
                {guide.legalRights.laborLaws.workingHours && (
                  <div className="legal-card">
                    <h4>{t?.workingHours || 'Working Hours'}</h4>
                    <p>
                      <strong>{t?.standard || 'Standard'}:</strong>{' '}
                      {guide.legalRights.laborLaws.workingHours.standard} {t?.hoursPerWeek || 'hours/week'}
                    </p>
                    {guide.legalRights.laborLaws.workingHours.maximum && (
                      <p>
                        <strong>{t?.maximum || 'Maximum'}:</strong>{' '}
                        {guide.legalRights.laborLaws.workingHours.maximum} {t?.hoursPerWeek || 'hours/week'}
                      </p>
                    )}
                    {guide.legalRights.laborLaws.workingHours.notes?.[language] && (
                      <p className="note">{guide.legalRights.laborLaws.workingHours.notes[language]}</p>
                    )}
                  </div>
                )}

                {guide.legalRights.laborLaws.weeklyRest && (
                  <div className="legal-card">
                    <h4>{t?.weeklyRest || 'Weekly Rest'}</h4>
                    <p>
                      <strong>{guide.legalRights.laborLaws.weeklyRest.days}</strong>{' '}
                      {t?.daysPerWeek || 'days per week'}
                    </p>
                    {guide.legalRights.laborLaws.weeklyRest.notes?.[language] && (
                      <p className="note">{guide.legalRights.laborLaws.weeklyRest.notes[language]}</p>
                    )}
                  </div>
                )}

                {guide.legalRights.laborLaws.paidLeave && (
                  <div className="legal-card">
                    <h4>{t?.paidLeave || 'Paid Leave'}</h4>
                    <p>
                      <strong>{t?.annual || 'Annual'}:</strong>{' '}
                      {guide.legalRights.laborLaws.paidLeave.annual} {t?.days || 'days'}
                    </p>
                    {guide.legalRights.laborLaws.paidLeave.sick && (
                      <p>
                        <strong>{t?.sick || 'Sick'}:</strong>{' '}
                        {guide.legalRights.laborLaws.paidLeave.sick} {t?.days || 'days'}
                      </p>
                    )}
                  </div>
                )}

                {guide.legalRights.laborLaws.overtimePay && (
                  <div className="legal-card">
                    <h4>{t?.overtimePay || 'Overtime Pay'}</h4>
                    <p><strong>{guide.legalRights.laborLaws.overtimePay.rate}</strong></p>
                    {guide.legalRights.laborLaws.overtimePay.notes?.[language] && (
                      <p className="note">{guide.legalRights.laborLaws.overtimePay.notes[language]}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {guide.legalRights?.workerProtections?.length > 0 && (
            <div className="legal-subsection">
              <h3>{t?.workerProtections || 'Worker Protections'}</h3>
              <div className="protections-list">
                {guide.legalRights.workerProtections.map((protection, idx) => (
                  <div key={idx} className="protection-item">
                    <h4>🛡️ {protection.right?.[language]}</h4>
                    <p>{protection.description?.[language]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Emergency Contacts Section */}
        <section id="emergency" className="content-section emergency-section">
          <h2>🆘 {t?.emergencyContacts || 'Emergency Contacts'}</h2>
          
          {guide.emergencyContacts?.bangladeshiEmbassy && (
            <div className="emergency-card highlight">
              <h3>🇧🇩 {guide.emergencyContacts.bangladeshiEmbassy.name?.[language] || t?.bangladeshiEmbassy || 'Bangladeshi Embassy'}</h3>
              
              {guide.emergencyContacts.bangladeshiEmbassy.phone?.length > 0 && (
                <p>
                  <strong>📞 {t?.phone || 'Phone'}:</strong>{' '}
                  {guide.emergencyContacts.bangladeshiEmbassy.phone.map((phone, idx) => (
                    <a key={idx} href={`tel:${phone}`} className="phone-link">
                      {phone}
                    </a>
                  ))}
                </p>
              )}

              {guide.emergencyContacts.bangladeshiEmbassy.emergencyHotline && (
                <p className="emergency-hotline">
                  <strong>🚨 {t?.emergencyHotline || 'Emergency Hotline'}:</strong>{' '}
                  <a href={`tel:${guide.emergencyContacts.bangladeshiEmbassy.emergencyHotline}`}>
                    {guide.emergencyContacts.bangladeshiEmbassy.emergencyHotline}
                  </a>
                </p>
              )}

              {guide.emergencyContacts.bangladeshiEmbassy.email && (
                <p>
                  <strong>✉️ {t?.email || 'Email'}:</strong>{' '}
                  <a href={`mailto:${guide.emergencyContacts.bangladeshiEmbassy.email}`}>
                    {guide.emergencyContacts.bangladeshiEmbassy.email}
                  </a>
                </p>
              )}

              {guide.emergencyContacts.bangladeshiEmbassy.address?.[language] && (
                <p>
                  <strong>📍 {t?.address || 'Address'}:</strong>{' '}
                  {guide.emergencyContacts.bangladeshiEmbassy.address[language]}
                </p>
              )}

              {guide.emergencyContacts.bangladeshiEmbassy.website && (
                <p>
                  <strong>🌐 {t?.website || 'Website'}:</strong>{' '}
                  <a href={guide.emergencyContacts.bangladeshiEmbassy.website} target="_blank" rel="noopener noreferrer">
                    {guide.emergencyContacts.bangladeshiEmbassy.website}
                  </a>
                </p>
              )}
            </div>
          )}

          {guide.emergencyContacts?.localEmergencyServices && (
            <div className="emergency-card">
              <h3>🚑 {t?.localEmergencyServices || 'Local Emergency Services'}</h3>
              <div className="emergency-numbers">
                {guide.emergencyContacts.localEmergencyServices.police && (
                  <p>
                    <strong>👮 {t?.police || 'Police'}:</strong>{' '}
                    <a href={`tel:${guide.emergencyContacts.localEmergencyServices.police}`}>
                      {guide.emergencyContacts.localEmergencyServices.police}
                    </a>
                  </p>
                )}
                {guide.emergencyContacts.localEmergencyServices.ambulance && (
                  <p>
                    <strong>🚑 {t?.ambulance || 'Ambulance'}:</strong>{' '}
                    <a href={`tel:${guide.emergencyContacts.localEmergencyServices.ambulance}`}>
                      {guide.emergencyContacts.localEmergencyServices.ambulance}
                    </a>
                  </p>
                )}
                {guide.emergencyContacts.localEmergencyServices.fire && (
                  <p>
                    <strong>🔥 {t?.fire || 'Fire'}:</strong>{' '}
                    <a href={`tel:${guide.emergencyContacts.localEmergencyServices.fire}`}>
                      {guide.emergencyContacts.localEmergencyServices.fire}
                    </a>
                  </p>
                )}
                {guide.emergencyContacts.localEmergencyServices.generalEmergency && (
                  <p>
                    <strong>🆘 {t?.generalEmergency || 'General Emergency'}:</strong>{' '}
                    <a href={`tel:${guide.emergencyContacts.localEmergencyServices.generalEmergency}`}>
                      {guide.emergencyContacts.localEmergencyServices.generalEmergency}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {guide.emergencyContacts?.helplines?.length > 0 && (
            <div className="emergency-card">
              <h3>📞 {t?.helplines || 'Helplines'}</h3>
              {guide.emergencyContacts.helplines.map((helpline, idx) => (
                <div key={idx} className="helpline-item">
                  <h4>{helpline.name?.[language]}</h4>
                  <p>
                    <strong>{t?.number || 'Number'}:</strong>{' '}
                    <a href={`tel:${helpline.number}`}>{helpline.number}</a>
                  </p>
                  {helpline.purpose?.[language] && <p>{helpline.purpose[language]}</p>}
                  {helpline.availability?.[language] && (
                    <p className="availability">{helpline.availability[language]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Living Costs Section */}
        <section id="living" className="content-section">
          <h2>💰 {t?.estimatedLivingCosts || 'Estimated Living Costs'}</h2>
          
          {guide.livingCosts && (
            <div className="living-costs-grid">
              {guide.livingCosts.accommodation && (
                <div className="cost-card">
                  <h3>🏠 {t?.accommodation || 'Accommodation'}</h3>
                  {guide.livingCosts.accommodation.providedByEmployer ? (
                    <p className="highlight">{t?.providedByEmployer || 'Usually provided by employer'}</p>
                  ) : (
                    <>
                      <p className="cost-amount">
                        {guide.livingCosts.currency}{' '}
                        {guide.livingCosts.accommodation.averageRent?.min?.toLocaleString()} -{' '}
                        {guide.livingCosts.accommodation.averageRent?.max?.toLocaleString()} / {t?.month || 'month'}
                      </p>
                      {guide.livingCosts.accommodation.averageRent?.notes?.[language] && (
                        <p className="note">{guide.livingCosts.accommodation.averageRent.notes[language]}</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {guide.livingCosts.food && (
                <div className="cost-card">
                  <h3>🍽️ {t?.food || 'Food'}</h3>
                  <p className="cost-amount">
                    {guide.livingCosts.currency}{' '}
                    {guide.livingCosts.food.monthlyEstimate?.min?.toLocaleString()} -{' '}
                    {guide.livingCosts.food.monthlyEstimate?.max?.toLocaleString()} / {t?.month || 'month'}
                  </p>
                  {guide.livingCosts.food.notes?.[language] && (
                    <p className="note">{guide.livingCosts.food.notes[language]}</p>
                  )}
                </div>
              )}

              {guide.livingCosts.transportation && (
                <div className="cost-card">
                  <h3>🚌 {t?.transportation || 'Transportation'}</h3>
                  <p className="cost-amount">
                    {guide.livingCosts.currency}{' '}
                    {guide.livingCosts.transportation.monthlyEstimate?.min?.toLocaleString()} -{' '}
                    {guide.livingCosts.transportation.monthlyEstimate?.max?.toLocaleString()} / {t?.month || 'month'}
                  </p>
                  {guide.livingCosts.transportation.notes?.[language] && (
                    <p className="note">{guide.livingCosts.transportation.notes[language]}</p>
                  )}
                </div>
              )}

              {guide.livingCosts.utilities && (
                <div className="cost-card">
                  <h3>⚡ {t?.utilities || 'Utilities'}</h3>
                  <p className="cost-amount">
                    {guide.livingCosts.currency}{' '}
                    {guide.livingCosts.utilities.monthlyEstimate?.min?.toLocaleString()} -{' '}
                    {guide.livingCosts.utilities.monthlyEstimate?.max?.toLocaleString()} / {t?.month || 'month'}
                  </p>
                  {guide.livingCosts.utilities.notes?.[language] && (
                    <p className="note">{guide.livingCosts.utilities.notes[language]}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Last Verified */}
        <div className="last-verified">
          <p>
            ℹ️ {t?.lastVerified || 'Last verified'}:{' '}
            {new Date(guide.lastVerifiedDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
          </p>
          <p className="disclaimer">
            {t?.verifyInfoDisclaimer ||
              'Always verify information with official government sources and the Bangladeshi embassy before making decisions.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CountryGuideDetail;
