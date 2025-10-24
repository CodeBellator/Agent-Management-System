const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const List = require('../models/List');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV, XLSX, and XLS files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Normalize column names (case insensitive)
        const normalizedData = {};
        Object.keys(data).forEach(key => {
          const normalizedKey = key.toLowerCase().trim();
          if (normalizedKey.includes('firstname') || normalizedKey.includes('first_name') || normalizedKey.includes('first name')) {
            normalizedData.firstName = data[key].trim();
          } else if (normalizedKey.includes('phone') || normalizedKey.includes('mobile') || normalizedKey.includes('number')) {
            normalizedData.phone = data[key].trim();
          } else if (normalizedKey.includes('notes') || normalizedKey.includes('note') || normalizedKey.includes('comments')) {
            normalizedData.notes = data[key].trim();
          }
        });
        
        if (normalizedData.firstName && normalizedData.phone) {
          results.push(normalizedData);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Function to parse Excel file
const parseExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    const results = [];
    jsonData.forEach(row => {
      const normalizedData = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().trim();
        if (normalizedKey.includes('firstname') || normalizedKey.includes('first_name') || normalizedKey.includes('first name')) {
          normalizedData.firstName = String(row[key]).trim();
        } else if (normalizedKey.includes('phone') || normalizedKey.includes('mobile') || normalizedKey.includes('number')) {
          normalizedData.phone = String(row[key]).trim();
        } else if (normalizedKey.includes('notes') || normalizedKey.includes('note') || normalizedKey.includes('comments')) {
          normalizedData.notes = String(row[key]).trim();
        }
      });
      
      if (normalizedData.firstName && normalizedData.phone) {
        results.push(normalizedData);
      }
    });
    
    return results;
  } catch (error) {
    throw error;
  }
};

// Function to distribute items among agents
const distributeItems = (items, agents) => {
  const distributions = [];
  const itemsPerAgent = Math.floor(items.length / agents.length);
  const remainingItems = items.length % agents.length;
  
  let currentIndex = 0;
  
  agents.forEach((agent, index) => {
    const itemCount = itemsPerAgent + (index < remainingItems ? 1 : 0);
    const agentItems = items.slice(currentIndex, currentIndex + itemCount);
    
    distributions.push({
      agent: agent._id,
      items: agentItems,
      itemCount: agentItems.length
    });
    
    currentIndex += itemCount;
  });
  
  return distributions;
};

// @route   POST /api/lists/upload
// @desc    Upload and distribute CSV/Excel file
// @access  Private (Admin only)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    let parsedData;
    
    // Parse file based on extension
    if (fileExt === '.csv') {
      parsedData = await parseCSV(filePath);
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      parsedData = parseExcel(filePath);
    } else {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Unsupported file format' });
    }

    // Validate parsed data
    if (!parsedData || parsedData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No valid data found in file. Please ensure the file has FirstName and Phone columns.' });
    }

    // Get all active agents
    const agents = await Agent.find({ isActive: true }).limit(5);
    if (agents.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No active agents found. Please create agents first.' });
    }

    // Distribute items among agents
    const distributions = distributeItems(parsedData, agents);

    // Create new list document
    const newList = new List({
      fileName: req.file.originalname,
      totalItems: parsedData.length,
      uploadedBy: req.user._id,
      distributions: distributions
    });

    await newList.save();

    // Populate agent details for response
    await newList.populate('distributions.agent', 'name email');
    await newList.populate('uploadedBy', 'email');

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(201).json({
      success: true,
      list: newList,
      message: `Successfully uploaded and distributed ${parsedData.length} items among ${agents.length} agents`
    });

  } catch (error) {
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload error:', error);
    
    if (error.message.includes('Only CSV, XLSX, and XLS files are allowed')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// @route   GET /api/lists
// @desc    Get all uploaded lists
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.find()
      .populate('distributions.agent', 'name email')
      .populate('uploadedBy', 'email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      lists
    });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lists/:id
// @desc    Get specific list by ID
// @access  Private (Admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id)
      .populate('distributions.agent', 'name email')
      .populate('uploadedBy', 'email');

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.json({
      success: true,
      list
    });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/lists/:id
// @desc    Delete list
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    await List.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'List deleted successfully'
    });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;