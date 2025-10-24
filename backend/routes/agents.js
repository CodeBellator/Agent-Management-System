const express = require('express');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/agents
// @desc    Create new agent
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, mobileNumber, countryCode, password } = req.body;

    // Validation
    if (!name || !email || !mobileNumber || !countryCode || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }

    // Create new agent
    const agent = new Agent({
      name,
      email,
      mobileNumber,
      countryCode,
      password
    });

    await agent.save();

    // Return agent without password
    const agentResponse = {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      mobileNumber: agent.mobileNumber,
      countryCode: agent.countryCode,
      isActive: agent.isActive,
      createdAt: agent.createdAt
    };

    res.status(201).json({
      success: true,
      agent: agentResponse
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      agents
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/agents/:id
// @desc    Get agent by ID
// @access  Private (Admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/agents/:id
// @desc    Update agent
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, mobileNumber, countryCode, isActive } = req.body;

    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== agent.email) {
      const existingAgent = await Agent.findOne({ email });
      if (existingAgent) {
        return res.status(400).json({ message: 'Agent with this email already exists' });
      }
    }

    // Update fields
    if (name) agent.name = name;
    if (email) agent.email = email;
    if (mobileNumber) agent.mobileNumber = mobileNumber;
    if (countryCode) agent.countryCode = countryCode;
    if (typeof isActive === 'boolean') agent.isActive = isActive;

    await agent.save();

    // Return updated agent without password
    const agentResponse = {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      mobileNumber: agent.mobileNumber,
      countryCode: agent.countryCode,
      isActive: agent.isActive,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    };

    res.json({
      success: true,
      agent: agentResponse
    });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/agents/:id
// @desc    Delete agent
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    await Agent.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;