const fs = require('fs');
const path = require('path');
const Gallery = require('../models/galleryModel');
const { sanitizeName, getNextSequenceNumber } = require('../utils/fileHelper');

exports.uploadMedia = async (req, res) => {
  try {
    const { main_folder_name, sub_folder_name, media_type } = req.body;
    const files = req.files;

    if (!main_folder_name || !sub_folder_name || !media_type) {
      return res.status(400).json({
        success: false,
        message: 'Main folder name, sub folder name, and media type are required.'
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file.'
      });
    }

    const typeLower = media_type.toLowerCase();
    if (typeLower !== 'photos' && typeLower !== 'videos') {
      return res.status(400).json({
        success: false,
        message: 'Media type must be either "Photos" or "Videos".'
      });
    }

    const safeMain = sanitizeName(main_folder_name);
    const safeSub = sanitizeName(sub_folder_name);
    const typeFolder = typeLower === 'photos' ? 'photos' : 'videos';

    const photoExts = ['.jpg', '.jpeg', '.png'];
    const videoExts = ['.mp4'];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (typeFolder === 'photos' && !photoExts.includes(ext)) {
        return res.status(400).json({
          success: false,
          message: `Invalid format in ${file.originalname}. Photos must be .jpg, .jpeg, or .png.`
        });
      }
      if (typeFolder === 'videos' && !videoExts.includes(ext)) {
        return res.status(400).json({
          success: false,
          message: `Invalid format in ${file.originalname}. Videos must be .mp4.`
        });
      }
    }

    const targetDir = path.join(__dirname, '..', 'uploads', safeMain, safeSub, typeFolder);
    const savedRecords = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const seqNumber = getNextSequenceNumber(targetDir, safeMain, safeSub);

      const fileName = `${safeMain}-${safeSub}-${seqNumber}${ext}`;
      const fullFilePath = path.join(targetDir, fileName);

      fs.writeFileSync(fullFilePath, file.buffer);

      const relativePath = `${safeMain}/${safeSub}/${typeFolder}/${fileName}`;
      const photoPath = typeFolder === 'photos' ? relativePath : null;
      const videoPath = typeFolder === 'videos' ? relativePath : null;

      const newRecord = new Gallery({
        main_folder_name,
        sub_folder_name,
        photo_path: photoPath,
        video_path: videoPath
      });

      const savedDoc = await newRecord.save();
      savedRecords.push({ id: savedDoc._id, relativePath });
    }

    const count = savedRecords.length;
    const itemLabel = typeFolder === 'photos'
      ? (count === 1 ? 'photo' : 'photos')
      : (count === 1 ? 'video' : 'videos');

    return res.status(200).json({
      success: true,
      message: `${count} ${itemLabel} added successfully`,
      data: savedRecords
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGalleryItems = async (req, res) => {
  try {
    const items = await Gallery.find().sort({ created_at: -1 });

    const formattedItems = items.map((item) => ({
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

// 4. Update Media / Move Folder
// 4. Update Media / Move Folder
exports.updateMedia = async (req, res) => {
  try {
    const { id } = req.params;

    // FIX: Safely check if req.body exists to prevent "Cannot read properties of undefined"
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'માહિતી મોકલવામાં ભૂલ. કૃપા કરીને ફરી પ્રયાસ કરો. (Data sending error.)'
      });
    }

    const mainFolder = req.body.main_folder_name || req.body.new_main_folder_name;
    const subFolder = req.body.sub_folder_name || req.body.new_sub_folder_name;

    if (!mainFolder || !subFolder) {
      return res.status(400).json({
        success: false,
        message: 'મુખ્ય ફોલ્ડર અને સબ ફોલ્ડરનું નામ જરૂરી છે. (Folder names are required.)'
      });
    }

    const item = await Gallery.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'ફાઇલ મળી નથી. (Media item not found.)' });
    }

    const safeNewMain = sanitizeName(mainFolder);
    const safeNewSub = sanitizeName(subFolder);

    const isPhoto = Boolean(item.photo_path);
    const typeFolder = isPhoto ? 'photos' : 'videos';
    const oldRelPath = isPhoto ? item.photo_path : item.video_path;
    const oldFullPath = path.join(__dirname, '..', 'uploads', oldRelPath);

    // Calculate the base directory to check if it exists
    const newBaseDir = path.join(__dirname, '..', 'uploads', safeNewMain, safeNewSub);
    const newTargetDir = path.join(newBaseDir, typeFolder);

    // --- RULE: Only allow moving to EXISTING folders ---
    const fs = require('fs');
    if (!fs.existsSync(newBaseDir)) {
      return res.status(400).json({
        success: false,
        message: `ફોલ્ડર "${mainFolder} / ${subFolder}" અસ્તિત્વમાં નથી. તમે ફાઇલને ફક્ત હયાત ફોલ્ડરમાં જ ખસેડી શકો છો.` // Gujarati Alert
      });
    }

    // If the "photos" or "videos" sub-folder inside it doesn't exist yet, create it
    if (!fs.existsSync(newTargetDir)) {
      fs.mkdirSync(newTargetDir, { recursive: true });
    }

    const ext = path.extname(oldRelPath);
    const seqNumber = getNextSequenceNumber(newTargetDir, safeNewMain, safeNewSub);
    const newFileName = `${safeNewMain}-${safeNewSub}-${seqNumber}${ext}`;
    const newFullPath = path.join(newTargetDir, newFileName);
    const newRelPath = `${safeNewMain}/${safeNewSub}/${typeFolder}/${newFileName}`;

    // Move physical file on server
    if (fs.existsSync(oldFullPath)) {
      fs.renameSync(oldFullPath, newFullPath);
    }

    // Update MongoDB
    item.main_folder_name = mainFolder;
    item.sub_folder_name = subFolder;
    if (isPhoto) {
      item.photo_path = newRelPath;
    } else {
      item.video_path = newRelPath;
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: 'ફાઇલ સફળતાપૂર્વક ખસેડવામાં આવી! (Media moved successfully!)',
      data: item
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of IDs to delete.'
      });
    }

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

    await Gallery.deleteMany({ _id: { $in: ids } });

    const isPhoto = deletedPhotosCount > 0;
    const count = isPhoto ? deletedPhotosCount : deletedVideosCount;
    const mediaTypeLabel = isPhoto
      ? (count === 1 ? 'photo' : 'photos')
      : (count === 1 ? 'video' : 'videos');

    return res.status(200).json({
      success: true,
      message: `${count} ${mediaTypeLabel} deleted successfully`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};