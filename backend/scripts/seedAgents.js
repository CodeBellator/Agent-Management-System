const mongoose = require('mongoose');
const Agent = require('../models/Agent');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const seedAgents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if agents already exist
    const existingAgents = await Agent.find();
    
    if (existingAgents.length > 0) {
      console.log(`${existingAgents.length} agents already exist`);
      process.exit(0);
    }

    // Create sample agents
    const sampleAgents = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        mobileNumber: '1234567890',
        countryCode: '+1',
        password: 'password123',
        isActive: true
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        mobileNumber: '2345678901',
        countryCode: '+1',
        password: 'password123',
        isActive: true
      },
      {
        name: 'Mike Davis',
        email: 'mike.davis@example.com',
        mobileNumber: '3456789012',
        countryCode: '+1',
        password: 'password123',
        isActive: true
      },
      {
        name: 'Emily Wilson',
        email: 'emily.wilson@example.com',
        mobileNumber: '4567890123',
        countryCode: '+1',
        password: 'password123',
        isActive: true
      },
      {
        name: 'David Brown',
        email: 'david.brown@example.com',
        mobileNumber: '5678901234',
        countryCode: '+1',
        password: 'password123',
        isActive: true
      }
    ];

    // Insert agents
    await Agent.insertMany(sampleAgents);
    
    console.log('Sample agents created successfully!');
    console.log(`Created ${sampleAgents.length} agents:`);
    sampleAgents.forEach(agent => {
      console.log(`- ${agent.name} (${agent.email})`);
    });

  } catch (error) {
    console.error('Error seeding agents:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAgents();