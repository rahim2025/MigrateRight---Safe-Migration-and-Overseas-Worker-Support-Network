const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes on startup
    await createIndexes();
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const User = require('./User');
    const RecruitmentAgency = require('./RecruitmentAgency');
    
    console.log('Creating indexes for User model...');
    await User.createIndexes();
    
    console.log('Creating indexes for RecruitmentAgency model...');
    await RecruitmentAgency.createIndexes();
    
    console.log('All indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
  }
};

module.exports = connectDB;
