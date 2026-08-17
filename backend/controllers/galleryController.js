const fs = require('fs');
const path = require('path');
const Gallery = require('../models/galleryModel'); // Mongoose Model
const { sanitizeName, getNextSequenceNumber } = require('../utils/fileHelper');

// 1. Upload Media
exports.uploadMedia = async (req, res) => {
  try {
    const { sub_folder_name, media_type } = req.body;
    const files = req.files;

    const currentYear = new Date().getFullYear().toString();
    const main_folder_name = currentYear;

    if (!sub_folder_name || !media_type) {
      return res.status(400).json({ success: false, message: 'Sub folder name and media type are required.' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one file.' });
    }

    const safeMain = sanitizeName(main_folder_name);
    const safeSub = sanitizeName(sub_folder_name);
    const typeFolder = media_type.toLowerCase() === 'photos' ? 'photos' : 'videos';

    const targetDir = path.join(__dirname, '..', 'uploads', safeMain, safeSub, typeFolder);
    const savedRecords = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const seqNumber = getNextSequenceNumber(targetDir, safeMain, safeSub);

      const fileName = `${safeMain}-${safeSub}-${seqNumber}${ext}`;
      const fullFilePath = path.join(targetDir, fileName);

      // Save physical file
      fs.writeFileSync(fullFilePath, file.buffer);

      const relativePath = `${safeMain}/${safeSub}/${typeFolder}/${fileName}`;
      const photoPath = typeFolder === 'photos' ? relativePath : null;
      const videoPath = typeFolder === 'videos' ? relativePath : null;

      // Create new Mongoose document
      const newRecord = new Gallery({
        main_folder_name,
        sub_folder_name,
        photo_path: photoPath,
        video_path: videoPath
      });

      // Save to MongoDB
      const savedDoc = await newRecord.save();
      
      // Mongoose uses _id instead of id
      savedRecords.push({ id: savedDoc._id, relativePath });
    }

    const count = savedRecords.length;
    const itemLabel = count === 1 ? (typeFolder === 'photos' ? 'photo' : 'video') : typeFolder;

    return res.status(200).json({
      success: true,
      message: `${count} ${itemLabel} added successfully`,
      data: savedRecords
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Fetch Gallery Items
exports.getGalleryItems = async (req, res) => {
  try {
    // Mongoose .find() to get all, sorted by newest first
    const items = await Gallery.find().sort({ created_at: -1 });
    
    // Map Mongoose _id to id for frontend consistency
    const formattedItems = items.map(item => ({
      id: item._id,
      main_folder_name: item.main_folder_name,
      sub_folder_name: item.sub_folder_name,
      photo_path: item.photo_path,
      video_path: item.video_path,
      created_at: item.created_at
    }));

    return res.status(200).json({ success: true, data: formattedItems });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Delete Media
exports.deleteMedia = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of IDs to delete.' });
    }

    // Find records in MongoDB using $in operator
    const records = await Gallery.find({ _id: { $in: ids } });

    if (records.length === 0) {
      return res.status(404).json({ success: false, message: 'No matching records found.' });
    }

    let deletedPhotosCount = 0;
    let deletedVideosCount = 0;

    records.forEach((record) => {
      const relPath = record.photo_path || record.video_path;
      if (relPath) {
        const fullPath = path.join(__dirname, '..', 'uploads', relPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

      if (record.photo_path) deletedPhotosCount++;
      if (record.video_path) deletedVideosCount++;
    });

    // Delete records from MongoDB
    await Gallery.deleteMany({ _id: { $in: ids } });

    const isPhoto = deletedPhotosCount > 0;
    const count = isPhoto ? deletedPhotosCount : deletedVideosCount;
    const mediaTypeLabel = isPhoto
      ? count === 1 ? 'photo' : 'photos'
      : count === 1 ? 'video' : 'videos';

    return res.status(200).json({
      success: true,
      message: `${count} ${mediaTypeLabel} deleted successfully`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};