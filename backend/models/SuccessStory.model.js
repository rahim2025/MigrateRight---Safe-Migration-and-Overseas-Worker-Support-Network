const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Story title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Story content is required'],
    trim: true
  },
  workerName: {
    type: String,
    trim: true
  },
  destinationCountry: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
successStorySchema.index({ agencyId: 1, createdAt: -1 });
successStorySchema.index({ isPublished: 1 });

const SuccessStory = mongoose.model('SuccessStory', successStorySchema);

module.exports = SuccessStory;
