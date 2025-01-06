const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const Item = require('../models/Item'); // Assuming you have an Item model

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload Excel file and parse data
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Parse the Excel file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Insert data into MongoDB
        const result = await Item.insertMany(data);
        res.status(200).json({ message: 'Data uploaded successfully', data: result });
    } catch (error) {
        console.error('Error uploading Excel file:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
