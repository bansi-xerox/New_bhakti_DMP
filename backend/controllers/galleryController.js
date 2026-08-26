





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

    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // --- FIX: Calculate starting sequence number safely for batch uploads ---
    let maxSeq = 0;
    const existingFiles = fs.readdirSync(targetDir);
    existingFiles.forEach(file => {
      const parts = file.split('-');
      if (parts.length >= 3) {
        const lastPart = parts[parts.length - 1].split('.')[0];
        const num = parseInt(lastPart, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });

    const savedRecords = [];

    for (const file of files) {
      maxSeq++; // Increment safely for each file in the batch
      const seqNumber = maxSeq;

      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `${safeMain}-${safeSub}-${seqNumber}${ext}`;
      const fullFilePath = path.join(targetDir, fileName);

      fs.writeFileSync(fullFilePath, file.buffer);

      const relativePath = `${safeMain}/${safeSub}/${typeFolder}/${fileName}`;
      const photoPath = typeFolder === 'photos' ? relativePath : null;
      const videoPath = typeFolder === 'videos' ? relativePath : null;

      const newRecord = new Gallery({
        main_folder_name: safeMain,
        sub_folder_name: safeSub,
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
    const { page, limit, search, main_folder_name, sub_folder_name, media_type } = req.query;
    const query = {};

    if (main_folder_name) {
      query.main_folder_name = main_folder_name;
    }
    if (sub_folder_name) {
      query.sub_folder_name = sub_folder_name;
    }

    if (media_type) {
      if (media_type.toLowerCase() === 'photos') {
        query.photo_path = { $ne: null };
      } else if (media_type.toLowerCase() === 'videos') {
        query.video_path = { $ne: null };
      }
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { main_folder_name: searchRegex },
        { sub_folder_name: searchRegex },
        { photo_path: searchRegex },
        { video_path: searchRegex }
      ];
    }

    if (page && limit) {
      const pageNumber = parseInt(page, 10) || 1;
      const pageSize = parseInt(limit, 10) || 10;
      const skip = (pageNumber - 1) * pageSize;

      const totalItems = await Gallery.countDocuments(query);
      const items = await Gallery.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize);

      const formattedItems = items.map((item) => ({
        id: item._id,
        main_folder_name: item.main_folder_name,
        sub_folder_name: item.sub_folder_name,
        photo_path: item.photo_path,
        video_path: item.video_path,
        created_at: item.created_at
      }));

      const totalPages = Math.ceil(totalItems / pageSize);

      return res.status(200).json({
        success: true,
        data: formattedItems,
        pagination: {
          totalItems,
          totalPages,
          currentPage: pageNumber,
          pageSize,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      });
    }

    const items = await Gallery.find(query).sort({ created_at: -1 });

    const formattedItems = items.map((item) => ({
      id: item._id,
      main_folder_name: item.main_folder_name,
      sub_folder_name: item.sub_folder_name,
      photo_path: item.photo_path,
      video_path: item.video_path,
      created_at: item.created_at
    }));

    return res.status(200).json({
      success: true,
      data: formattedItems,
      totalCount: formattedItems.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'માહિતી મોકલવામાં ભૂલ. કૃપા કરીને ફરી પ્રયાસ કરો.'
      });
    }

    const mainFolder = req.body.main_folder_name || req.body.new_main_folder_name;
    const subFolder = req.body.sub_folder_name || req.body.new_sub_folder_name;

    if (!mainFolder || !subFolder) {
      return res.status(400).json({
        success: false,
        message: 'મુખ્ય ફોલ્ડર અને સબ ફોલ્ડરનું નામ જરૂરી છે.'
      });
    }

    const item = await Gallery.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'ફાઇલ મળી નથી.' });
    }

    const safeNewMain = sanitizeName(mainFolder);
    const safeNewSub = sanitizeName(subFolder);

    const isPhoto = Boolean(item.photo_path);
    const typeFolder = isPhoto ? 'photos' : 'videos';
    const oldRelPath = isPhoto ? item.photo_path : item.video_path;
    const oldFullPath = path.join(__dirname, '..', 'uploads', oldRelPath);

    const newBaseDir = path.join(__dirname, '..', 'uploads', safeNewMain, safeNewSub);
    const newTargetDir = path.join(newBaseDir, typeFolder);

    if (!fs.existsSync(newBaseDir)) {
      return res.status(400).json({
        success: false,
        message: `ફોલ્ડર "${mainFolder} / ${subFolder}" અસ્તિત્વમાં નથી. તમે ફાઇલને ફક્ત હયાત ફોલ્ડરમાં જ ખસેડી શકો છો.`
      });
    }

    if (!fs.existsSync(newTargetDir)) {
      fs.mkdirSync(newTargetDir, { recursive: true });
    }

    const ext = path.extname(oldRelPath);
    const seqNumber = getNextSequenceNumber(newTargetDir, safeNewMain, safeNewSub);
    const newFileName = `${safeNewMain}-${safeNewSub}-${seqNumber}${ext}`;
    const newFullPath = path.join(newTargetDir, newFileName);
    const newRelPath = `${safeNewMain}/${safeNewSub}/${typeFolder}/${newFileName}`;

    if (req.files && req.files.length > 0) {
      const uploadedFile = req.files[0];
      const newExt = path.extname(uploadedFile.originalname).toLowerCase();
      const updatedFileName = `${safeNewMain}-${safeNewSub}-${seqNumber}${newExt}`;
      const updatedFullPath = path.join(newTargetDir, updatedFileName);
      const updatedRelPath = `${safeNewMain}/${safeNewSub}/${typeFolder}/${updatedFileName}`;

      if (fs.existsSync(oldFullPath)) {
        fs.unlinkSync(oldFullPath);
      }

      fs.writeFileSync(updatedFullPath, uploadedFile.buffer);

      item.main_folder_name = safeNewMain;
      item.sub_folder_name = safeNewSub;
      if (isPhoto) {
        item.photo_path = updatedRelPath;
      } else {
        item.video_path = updatedRelPath;
      }
    } else {
      if (fs.existsSync(oldFullPath)) {
        fs.renameSync(oldFullPath, newFullPath);
      }

      // FIX: Always save sanitized safe names to prevent duplicate folder listings
      item.main_folder_name = safeNewMain;
      item.sub_folder_name = safeNewSub;
      if (isPhoto) {
        item.photo_path = newRelPath;
      } else {
        item.video_path = newRelPath;
      }
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: 'ફાઇલ સફળતાપૂર્વક ખસેડવામાં આવી!',
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

exports.searchMedia = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter (q) is required.'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const query = {
      $or: [
        { main_folder_name: searchRegex },
        { sub_folder_name: searchRegex },
        { photo_path: searchRegex },
        { video_path: searchRegex }
      ]
    };

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    const totalItems = await Gallery.countDocuments(query);
    const items = await Gallery.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(pageSize);

    const formattedItems = items.map((item) => ({
      id: item._id,
      main_folder_name: item.main_folder_name,
      sub_folder_name: item.sub_folder_name,
      photo_path: item.photo_path,
      video_path: item.video_path,
      created_at: item.created_at
    }));

    return res.status(200).json({
      success: true,
      data: formattedItems,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: pageNumber,
        pageSize
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};