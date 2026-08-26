const BhajanSahitya = require('../models/BhajanSahitya');

// 1. Create a new Bhajan Record
exports.createBhajan = async (req, res) => {
  try {
    const newBhajan = await BhajanSahitya.create(req.body);
    res.status(201).json({ success: true, message: 'Bhajan added successfully', data: newBhajan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding record', error: error.message });
  }
};

exports.getAllBhajans = async (req, res) => {
  try {
    // Add 'youtube_link' to the select string
    const bhajans = await BhajanSahitya.find()
      .select('sahitya_name heading_name bhajan_name bhajan_kadi bhajan_rag page_no youtube_link'); 
    res.status(200).json({ success: true, data: bhajans });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching records',
      error: error.message
    });
  }
};

// Dedicated Search Endpoint for Bhajan Sahitya
exports.searchBhajans = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search keyword (q) is required.'
      });
    }

    const regex = new RegExp(q.trim(), 'i');
    const query = {
      $or: [
        { bhajan_name: regex },
        { sahitya_name: regex },
        { heading_name: regex },
        { bhajan_rag: regex },
        { bhajan_kadi: regex }
      ]
    };

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const totalItems = await BhajanSahitya.countDocuments(query);
    const bhajans = await BhajanSahitya.find(query)
      .select('sahitya_name heading_name bhajan_name bhajan_kadi bhajan_rag page_no')
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalPages = Math.ceil(totalItems / pageSize);

    return res.status(200).json({
      success: true,
      data: bhajans,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Search error',
      error: error.message
    });
  }
};
exports.getBhajanById = async (req, res) => {
  try {
    // Mongoose uses .findById() instead of .findByPk()
    const bhajan = await BhajanSahitya.findById(req.params.id);
    
    if (!bhajan) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, data: bhajan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching record', error: error.message });
  }
};

// 4. Update a Bhajan Record
exports.updateBhajan = async (req, res) => {
  try {
    // Mongoose uses .findByIdAndUpdate()
    // { new: true } ensures it returns the newly updated document, not the old one
    const updatedBhajan = await BhajanSahitya.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedBhajan) return res.status(404).json({ success: false, message: 'Record not found' });
    
    res.status(200).json({ success: true, message: 'Bhajan updated successfully', data: updatedBhajan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating record', error: error.message });
  }
};

// 5. Delete a Bhajan Record
exports.deleteBhajan = async (req, res) => {
  try {
    // Mongoose uses .findByIdAndDelete()
    const deletedBhajan = await BhajanSahitya.findByIdAndDelete(req.params.id);
    
    if (!deletedBhajan) return res.status(404).json({ success: false, message: 'Record not found' });

    res.status(200).json({ success: true, message: 'Bhajan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting record', error: error.message });
  }
};