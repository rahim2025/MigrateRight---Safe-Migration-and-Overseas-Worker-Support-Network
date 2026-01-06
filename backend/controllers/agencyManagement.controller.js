const AgencyDetails = require('../models/AgencyDetails.model');
const SuccessStory = require('../models/SuccessStory.model');
const FeeStructure = require('../models/FeeStructure.model');
const TrainingRecord = require('../models/TrainingRecord.model');
const InterestedWorker = require('../models/InterestedWorker.model');
const User = require('../models/User');
const logger = require('../utils/logger');

// ==================== Agency Registration ====================
exports.registerAgencyDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check if user role is agency
    if (req.user.role !== 'agency') {
      return res.status(403).json({
        success: false,
        message: 'Only agency accounts can create agency details'
      });
    }

    // Check if agency details already exist
    const existingAgency = await AgencyDetails.findOne({ userId });
    if (existingAgency) {
      return res.status(400).json({
        success: false,
        message: 'Agency details already exist for this user'
      });
    }

    const agencyDetails = await AgencyDetails.create({
      userId,
      ...req.body
    });

    logger.info(`Agency details created for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Agency details created successfully',
      data: agencyDetails
    });
  } catch (error) {
    logger.error('Error creating agency details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create agency details',
      error: error.message
    });
  }
};

// Get agency details
exports.getAgencyDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    const agencyDetails = await AgencyDetails.findOne({ userId });
    
    if (!agencyDetails) {
      return res.status(404).json({
        success: false,
        message: 'Agency details not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agencyDetails
    });
  } catch (error) {
    logger.error('Error fetching agency details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency details',
      error: error.message
    });
  }
};

// Update agency details
exports.updateAgencyDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    const agencyDetails = await AgencyDetails.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!agencyDetails) {
      return res.status(404).json({
        success: false,
        message: 'Agency details not found'
      });
    }

    logger.info(`Agency details updated for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Agency details updated successfully',
      data: agencyDetails
    });
  } catch (error) {
    logger.error('Error updating agency details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update agency details',
      error: error.message
    });
  }
};

// ==================== Success Stories ====================
exports.createSuccessStory = async (req, res) => {
  try {
    const agencyId = req.user._id;

    const successStory = await SuccessStory.create({
      agencyId,
      ...req.body
    });

    logger.info(`Success story created by agency ${agencyId}`);

    res.status(201).json({
      success: true,
      message: 'Success story created successfully',
      data: successStory
    });
  } catch (error) {
    logger.error('Error creating success story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create success story',
      error: error.message
    });
  }
};

exports.getSuccessStories = async (req, res) => {
  try {
    const agencyId = req.params.agencyId || req.user._id;

    const successStories = await SuccessStory.find({ 
      agencyId,
      isPublished: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: successStories.length,
      data: successStories
    });
  } catch (error) {
    logger.error('Error fetching success stories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch success stories',
      error: error.message
    });
  }
};

exports.getSuccessStoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const successStory = await SuccessStory.findById(id);

    if (!successStory) {
      return res.status(404).json({
        success: false,
        message: 'Success story not found'
      });
    }

    res.status(200).json({
      success: true,
      data: successStory
    });
  } catch (error) {
    logger.error('Error fetching success story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch success story',
      error: error.message
    });
  }
};

exports.updateSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;
    const agencyId = req.user._id;

    const successStory = await SuccessStory.findOneAndUpdate(
      { _id: id, agencyId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!successStory) {
      return res.status(404).json({
        success: false,
        message: 'Success story not found or unauthorized'
      });
    }

    logger.info(`Success story ${id} updated by agency ${agencyId}`);

    res.status(200).json({
      success: true,
      message: 'Success story updated successfully',
      data: successStory
    });
  } catch (error) {
    logger.error('Error updating success story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update success story',
      error: error.message
    });
  }
};

exports.deleteSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;
    const agencyId = req.user._id;

    const successStory = await SuccessStory.findOneAndDelete({
      _id: id,
      agencyId
    });

    if (!successStory) {
      return res.status(404).json({
        success: false,
        message: 'Success story not found or unauthorized'
      });
    }

    logger.info(`Success story ${id} deleted by agency ${agencyId}`);

    res.status(200).json({
      success: true,
      message: 'Success story deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting success story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete success story',
      error: error.message
    });
  }
};

// ==================== Fee Structure ====================
exports.createFeeStructure = async (req, res) => {
  try {
    const agencyId = req.user._id;

    const feeStructure = await FeeStructure.create({
      agencyId,
      ...req.body
    });

    logger.info(`Fee structure created by agency ${agencyId}`);

    res.status(201).json({
      success: true,
      message: 'Fee structure created successfully',
      data: feeStructure
    });
  } catch (error) {
    logger.error('Error creating fee structure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create fee structure',
      error: error.message
    });
  }
};

exports.getFeeStructures = async (req, res) => {
  try {
    const agencyId = req.params.agencyId || req.user._id;

    const feeStructures = await FeeStructure.find({ 
      agencyId,
      isActive: true 
    }).sort({ country: 1 });

    res.status(200).json({
      success: true,
      count: feeStructures.length,
      data: feeStructures
    });
  } catch (error) {
    logger.error('Error fetching fee structures:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee structures',
      error: error.message
    });
  }
};

exports.getFeeStructureById = async (req, res) => {
  try {
    const { id } = req.params;

    const feeStructure = await FeeStructure.findById(id);

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feeStructure
    });
  } catch (error) {
    logger.error('Error fetching fee structure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee structure',
      error: error.message
    });
  }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const agencyId = req.user._id;

    const feeStructure = await FeeStructure.findOneAndUpdate(
      { _id: id, agencyId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found or unauthorized'
      });
    }

    logger.info(`Fee structure ${id} updated by agency ${agencyId}`);

    res.status(200).json({
      success: true,
      message: 'Fee structure updated successfully',
      data: feeStructure
    });
  } catch (error) {
    logger.error('Error updating fee structure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update fee structure',
      error: error.message
    });
  }
};

exports.deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const agencyId = req.user._id;

    const feeStructure = await FeeStructure.findOneAndDelete({
      _id: id,
      agencyId
    });

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found or unauthorized'
      });
    }

    logger.info(`Fee structure ${id} deleted by agency ${agencyId}`);

    res.status(200).json({
      success: true,
      message: 'Fee structure deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting fee structure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete fee structure',
      error: error.message
    });
  }
};

// ==================== Training Records ====================
exports.createTrainingRecord = async (req, res) => {
  try {
    const agencyId = req.user._id;

    const trainingRecord = await TrainingRecord.create({
      agencyId,
      ...req.body
    });

    logger.info(`Training record created by agency ${agencyId}`);

    res.status(201).json({
      success: true,
      message: 'Training record created successfully',
      data: trainingRecord
    });
  } catch (error) {
    logger.error('Error creating training record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create training record',
      error: error.message
    });
  }
};

exports.getTrainingRecords = async (req, res) => {
  try {
    const agencyId = req.params.agencyId || req.user._id;

    const trainingRecords = await TrainingRecord.find({ 
      agencyId,
      isActive: true 
    }).sort({ scheduleDate: -1 });

    res.status(200).json({
      success: true,
      count: trainingRecords.length,
      data: trainingRecords
    });
  } catch (error) {
    logger.error('Error fetching training records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch training records',
      error: error.message
    });
  }
};

exports.getTrainingRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const trainingRecord = await TrainingRecord.findById(id);

    if (!trainingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Training record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: trainingRecord
    });
  } catch (error) {
    logger.error('Error fetching training record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch training record',
      error: error.message
    });
  }
};

exports.updateTrainingRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const agencyId = req.user._id;

    const trainingRecord = await TrainingRecord.findOneAndUpdate(
      { _id: id, agencyId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!trainingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Training record not found or unauthorized'
      });
    }

    logger.info(`Training record ${id} updated by agency ${agencyId}`);

    res.status(200).json({
      success: true,
      message: 'Training record updated successfully',
      data: trainingRecord
    });
  } catch (error) {
    logger.error('Error updating training record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update training record',
      error: error.message
    });
  }
};

exports.deleteTrainingRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const agencyId = req.user._id;

    const trainingRecord = await TrainingRecord.findOneAndDelete({
      _id: id,
      agencyId
    });

    if (!trainingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Training record not found or unauthorized'
      });
    }

    logger.info(`Training record ${id} deleted by agency ${agencyId}`);

    res.status(200).json({
      success: true,
      message: 'Training record deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting training record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete training record',
      error: error.message
    });
  }
};

// ==================== Interested Workers ====================
exports.expressInterest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { agencyId } = req.body;

    // Check if user role is user (not agency)
    if (req.user.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only users can express interest in agencies'
      });
    }

    // Check if agency exists
    const agency = await User.findOne({ _id: agencyId, role: 'agency' });
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Check if user already expressed interest
    const existingInterest = await InterestedWorker.findOne({ agencyId, userId });
    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: 'You have already expressed interest in this agency'
      });
    }

    const interestedWorker = await InterestedWorker.create({
      agencyId,
      userId
    });

    logger.info(`User ${userId} expressed interest in agency ${agencyId}`);

    res.status(201).json({
      success: true,
      message: 'Interest expressed successfully',
      data: interestedWorker
    });
  } catch (error) {
    logger.error('Error expressing interest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to express interest',
      error: error.message
    });
  }
};

exports.getInterestedWorkers = async (req, res) => {
  try {
    const agencyId = req.user._id;

    const interestedWorkers = await InterestedWorker.find({ agencyId })
      .populate('userId', 'fullName phoneNumber email location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interestedWorkers.length,
      data: interestedWorkers
    });
  } catch (error) {
    logger.error('Error fetching interested workers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interested workers',
      error: error.message
    });
  }
};

exports.updateInterestedWorkerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const agencyId = req.user._id;
    const { status, notes } = req.body;

    const interestedWorker = await InterestedWorker.findOneAndUpdate(
      { _id: id, agencyId },
      { status, notes },
      { new: true, runValidators: true }
    ).populate('userId', 'fullName phoneNumber email location');

    if (!interestedWorker) {
      return res.status(404).json({
        success: false,
        message: 'Interested worker record not found or unauthorized'
      });
    }

    logger.info(`Interested worker ${id} status updated by agency ${agencyId}`);

    res.status(200).json({
      success: true,
      message: 'Worker status updated successfully',
      data: interestedWorker
    });
  } catch (error) {
    logger.error('Error updating interested worker status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update worker status',
      error: error.message
    });
  }
};

// ==================== Public Agency Listing ====================
exports.getAllAgencies = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = {};
    
    // Search by company name if provided
    if (search) {
      query.companyName = { $regex: search, $options: 'i' };
    }

    const agencies = await AgencyDetails.find(query)
      .populate('userId', 'email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await AgencyDetails.countDocuments(query);

    res.status(200).json({
      success: true,
      count: agencies.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: agencies
    });
  } catch (error) {
    logger.error('Error fetching agencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agencies',
      error: error.message
    });
  }
};

exports.getAgencyProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Get agency details
    const agencyDetails = await AgencyDetails.findOne({ userId: id })
      .populate('userId', 'email');

    if (!agencyDetails) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Get success stories
    const successStories = await SuccessStory.find({ 
      agencyId: id, 
      isPublished: true 
    }).sort({ createdAt: -1 });

    // Get fee structures
    const feeStructures = await FeeStructure.find({ 
      agencyId: id, 
      isActive: true 
    }).sort({ country: 1 });

    // Get training records
    const trainingRecords = await TrainingRecord.find({ 
      agencyId: id, 
      isActive: true 
    }).sort({ scheduleDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        agencyDetails,
        successStories,
        feeStructures,
        trainingRecords
      }
    });
  } catch (error) {
    logger.error('Error fetching agency profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agency profile',
      error: error.message
    });
  }
};

module.exports = exports;
