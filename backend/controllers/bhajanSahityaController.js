const BhajanSahitya = require('../models/BhajanSahitya');

// 1. Create a new Bhajan Record
exports.createBhajan = async (req, res) => {
  try {
    const { sahitya_name, heading_name, bhajan_name } = req.body;

    const cleanHeading = (heading_name && heading_name.trim()) ? heading_name.trim() : null;

    // Check if duplicate entry already exists
    const existingBhajan = await BhajanSahitya.findOne({
      sahitya_name: sahitya_name?.trim(),
      heading_name: cleanHeading,
      bhajan_name: bhajan_name?.trim()
    });

    if (existingBhajan) {
      return res.status(400).json({
        success: false,
        message: 'આ ભજન (સાહિત્ય અને નામ સાથે) પહેલેથી જ અસ્તિત્વમાં છે!'
      });
    }

    const newBhajan = await BhajanSahitya.create({
      ...req.body,
      heading_name: cleanHeading
    });

    res.status(201).json({ success: true, message: 'Bhajan added successfully', data: newBhajan });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'આ સાહિત્ય અને ભજન નામ સાથેનો રેકોર્ડ પહેલેથી અસ્તિત્વમાં છે!'
      });
    }
    res.status(500).json({ success: false, message: 'Error adding record', error: error.message });
  }
};

// 2. Get All Bhajans
exports.getAllBhajans = async (req, res) => {
  try {
    const bhajans = await BhajanSahitya.find()
      .select('sahitya_name heading_name bhajan_name bhajan_kadi bhajan_rag page_no youtube_link')
      .sort({ _id: -1 });
    res.status(200).json({ success: true, data: bhajans });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching records',
      error: error.message
    });
  }
};

// 3. Search Bhajans (Restricted to specified 5 fields only)
exports.searchBhajans = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search keyword (q) is required.'
      });
    }

    // 1. Remove all spaces and common punctuation from the user's search string
    const cleanQuery = q.replace(/[\s.,:;_'"+=\-!@#$%^&*()]+/g, '');


    // 2. Insert a regex wildcard between every single character
    const flexibleRegexPattern = cleanQuery.split('').join('[\\s.,:;_\'"\\-]*');

    // Create the case-insensitive regex
    const regex = new RegExp(flexibleRegexPattern, 'i');

    // Strict search criteria limited only to the 5 requested fields
    const query = {
      $or: [
        { sahitya_name: regex },
        { heading_name: regex },
        { bhajan_name: regex },
        { bhajan_kadi: regex },
        { bhajan_rag: regex }
      ]
    };

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const totalItems = await BhajanSahitya.countDocuments(query);
    const bhajans = await BhajanSahitya.find(query)
      .select('sahitya_name heading_name bhajan_name bhajan_kadi bhajan_rag page_no youtube_link')
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

// 4. Get Bhajan by ID
exports.getBhajanById = async (req, res) => {
  try {
    const bhajan = await BhajanSahitya.findById(req.params.id);
    if (!bhajan) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, data: bhajan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching record', error: error.message });
  }
};

// 5. Update Bhajan Record
exports.updateBhajan = async (req, res) => {
  try {
    const { sahitya_name, heading_name, bhajan_name } = req.body;

    const cleanHeading = (heading_name && heading_name.trim()) ? heading_name.trim() : null;

    const existingBhajan = await BhajanSahitya.findOne({
      _id: { $ne: req.params.id },
      sahitya_name: sahitya_name?.trim(),
      heading_name: cleanHeading,
      bhajan_name: bhajan_name?.trim()
    });

    if (existingBhajan) {
      return res.status(400).json({
        success: false,
        message: 'આ નામનું ભજન અન્ય રેકોર્ડમાં પહેલેથી જ ઉપલબ્ધ છે!'
      });
    }

    const updatedBhajan = await BhajanSahitya.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        heading_name: cleanHeading
      },
      { new: true, runValidators: true }
    );

    if (!updatedBhajan) return res.status(404).json({ success: false, message: 'Record not found' });

    res.status(200).json({ success: true, message: 'Bhajan updated successfully', data: updatedBhajan });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'આ સાહિત્ય અને ભજન નામ સાથેનો રેકોર્ડ પહેલેથી અસ્તિત્વમાં છે!'
      });
    }
    res.status(500).json({ success: false, message: 'Error updating record', error: error.message });
  }
};

// 6. Delete Bhajan
exports.deleteBhajan = async (req, res) => {
  try {
    const deletedBhajan = await BhajanSahitya.findByIdAndDelete(req.params.id);
    if (!deletedBhajan) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, message: 'Bhajan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting record', error: error.message });
  }
};