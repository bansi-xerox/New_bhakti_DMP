const path = require('path');
const Gallery = require('../models/galleryModel');
const {
  sanitizeName, getNextSequenceNumber
} = require('../utils/fileHelper');
const cloudinary = require('../config/cloudinary');

// ==========================================
// NEW: Face-API Setup
// ==========================================
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load models when the server starts
const loadModels = async () => {
  try {
    const MODEL_URL = path.join(__dirname, '../face-models'); // Ensure this points to your downloaded models folder
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
    console.log('Face Recognition Models Loaded Successfully');
  } catch (error) {
    console.error('Failed to load Face-API models:', error);
  }
};
loadModels();

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (url, resourceType) => {
  if (!url) return;

  try {
    if (!url.includes('res.cloudinary.com')) {
      return;
    }

    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1) {
      return;
    }

    let publicIdParts = parts.slice(uploadIndex + 1);

    if (
      publicIdParts.length > 0 &&
      /^v\d+$/.test(publicIdParts[0])
    ) {
      publicIdParts.shift();
    }

    let publicId = publicIdParts.join('/');

    publicId = publicId.replace(/\.[^/.]+$/, '');

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
        type: 'upload'
      }
    );
  } catch (error) {
    console.error(
      'Cloudinary delete error:',
      error.message
    );
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    const {
      main_folder_name,
      sub_folder_name,
      media_type,
      event_date
    } = req.body;

    const files = req.files;

    if (
      !main_folder_name ||
      !sub_folder_name ||
      !media_type
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Main folder name, sub folder name, and media type are required.'
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Please upload at least one file.'
      });
    }

    const typeLower =
      media_type.toLowerCase();

    if (
      typeLower !== 'photos' &&
      typeLower !== 'videos'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Media type must be either "Photos" or "Videos".'
      });
    }

    const safeMain =
      sanitizeName(main_folder_name);

    const safeSub =
      sanitizeName(sub_folder_name);

    const typeFolder =
      typeLower === 'photos'
        ? 'photos'
        : 'videos';

    const photoExts =
      ['.jpg', '.jpeg', '.png'];

    const videoExts =
      ['.mp4'];

    for (const file of files) {
      const ext =
        path.extname(
          file.originalname
        ).toLowerCase();

      if (
        typeFolder === 'photos' &&
        !photoExts.includes(ext)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid format in ${file.originalname}. Photos must be .jpg, .jpeg, or .png.`
        });
      }

      if (
        typeFolder === 'videos' &&
        !videoExts.includes(ext)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid format in ${file.originalname}. Videos must be .mp4.`
        });
      }



    }

    let existingRecords;

    if (typeFolder === 'photos') {
      existingRecords =
        await Gallery.find({
          main_folder_name: safeMain,
          sub_folder_name: safeSub,
          photo_path: { $ne: null }
        }).select('photo_path');
    } else {
      existingRecords =
        await Gallery.find({
          main_folder_name: safeMain,
          sub_folder_name: safeSub,
          video_path: { $ne: null }
        }).select('video_path');
    }

    const existingPaths =
      existingRecords.map(record => {
        return typeFolder === 'photos'
          ? record.photo_path
          : record.video_path;
      });

    const savedRecords = [];

    for (const file of files) {
      const seqNumber =
        getNextSequenceNumber(
          existingPaths,
          safeMain,
          safeSub
        );

      const fileName =
        `${safeMain}-${safeSub}-${seqNumber}`;

      const resourceType =
        typeFolder === 'videos'
          ? 'video'
          : 'image';

      const result =
        await uploadToCloudinary(
          file.buffer,
          {
            folder:
              `bhakti-dmp/${safeMain}/${safeSub}/${typeFolder}`,
            public_id:
              fileName,
            resource_type:
              resourceType
          }
        );

      const cloudinaryUrl =
        result.secure_url;

      const newRecord =
        new Gallery({
          main_folder_name:
            safeMain,
          sub_folder_name:
            safeSub,
          photo_path:
            typeFolder === 'photos'
              ? cloudinaryUrl
              : null,
          video_path:
            typeFolder === 'videos'
              ? cloudinaryUrl
              : null,
          event_date:
            event_date
              ? new Date(event_date)
              : new Date()
        });

      const savedDoc =
        await newRecord.save();

      savedRecords.push({
        id: savedDoc._id,
        relativePath:
          cloudinaryUrl
      });

      existingPaths.push(
        cloudinaryUrl
      );
    }

    const count =
      savedRecords.length;

    const itemLabel =
      typeFolder === 'photos'
        ? count === 1
          ? 'photo'
          : 'photos'
        : count === 1
          ? 'video'
          : 'videos';

    return res.status(200).json({
      success: true,
      message:
        `${count} ${itemLabel} added successfully`,
      data:
        savedRecords
    });
  } catch (error) {
    console.error(
      'Cloudinary upload error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};

// Face Recognition Search Logic
exports.searchByFace = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please capture a selfie.' });
    }

    // 1. Selfie mathi face detect karo
    const img = await canvas.loadImage(req.file.buffer);
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (!detections) {
      return res.status(400).json({ success: false, message: 'Selfie ma koi chahero (face) malyo nathi. Fari try karo.' });
    }

    const queryDescriptor = detections.descriptor;

    // 2. Database mathi badha photos laavo jema face hoy
    const galleries = await Gallery.find({ 
      photo_path: { $ne: null }, 
      face_descriptors: { $not: { $size: 0 } } 
    });

    const matchedPhotos = [];
    const THRESHOLD = 0.55; // 0.55 thi 0.60 vacche rakhi shakay (ochho number = vadhu strict matching)

    // 3. Selfie na face ne badha photos sathe match karo
    for (const item of galleries) {
      let isMatch = false;
      for (const dbDesc of item.face_descriptors) {
        const dbDescriptorArray = new Float32Array(dbDesc);
        const distance = faceapi.euclideanDistance(queryDescriptor, dbDescriptorArray);
        
        if (distance <= THRESHOLD) {
          isMatch = true;
          break; // Ek var match thay jay etle aagal check karvani jarur nathi
        }
      }
      if (isMatch) {
        matchedPhotos.push(item);
      }
    }

    return res.status(200).json({ success: true, data: matchedPhotos });

  } catch (error) {
    console.error('Face search error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.uploadMedia = async (req, res) => {
  try {
    const {
      main_folder_name,
      sub_folder_name,
      media_type,
      event_date
    } = req.body;

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

    // 1. ફાઈલ ફોર્મેટ ચેક કરો
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

    // 2. ડેટાબેઝમાંથી જૂના રેકોર્ડ્સ લાવો
    let existingRecords;

    if (typeFolder === 'photos') {
      existingRecords = await Gallery.find({
        main_folder_name: safeMain,
        sub_folder_name: safeSub,
        photo_path: { $ne: null }
      }).select('photo_path');
    } else {
      existingRecords = await Gallery.find({
        main_folder_name: safeMain,
        sub_folder_name: safeSub,
        video_path: { $ne: null }
      }).select('video_path');
    }

    const existingPaths = existingRecords.map(record => {
      return typeFolder === 'photos' ? record.photo_path : record.video_path;
    });

    const savedRecords = [];

    // 3. દરેક ફાઈલ અપલોડ કરો અને ડેટાબેઝમાં સેવ કરો
    for (const file of files) {
      const seqNumber = getNextSequenceNumber(existingPaths, safeMain, safeSub);
      const fileName = `${safeMain}-${safeSub}-${seqNumber}`;
      const resourceType = typeFolder === 'videos' ? 'video' : 'image';

      // 3.1 Cloudinary માં અપલોડ
      const result = await uploadToCloudinary(file.buffer, {
        folder: `bhakti-dmp/${safeMain}/${safeSub}/${typeFolder}`,
        public_id: fileName,
        resource_type: resourceType
      });

      const cloudinaryUrl = result.secure_url;

      // 3.2 Face Descriptors Extract કરો (માત્ર ફોટો માટે જ)
      let descriptors = [];
      if (typeFolder === 'photos') {
        try {
          // કેનવાસ ઈમેજ લોડ કરીને તેમાંથી ફેસ સ્કેન કરશે
          const img = await canvas.loadImage(file.buffer);
          const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
          descriptors = detections.map(d => Array.from(d.descriptor));
        } catch (faceErr) {
          console.error(`Face extraction failed for ${fileName}:`, faceErr.message);
        }
      }

      // 3.3 ડેટાબેઝમાં રેકોર્ડ સેવ કરો
      const newRecord = new Gallery({
        main_folder_name: safeMain,
        sub_folder_name: safeSub,
        photo_path: typeFolder === 'photos' ? cloudinaryUrl : null,
        video_path: typeFolder === 'videos' ? cloudinaryUrl : null,
        event_date: event_date ? new Date(event_date) : new Date(),
        face_descriptors: descriptors // અહી ચહેરાનો ડેટા સેવ થશે
      });

      const savedDoc = await newRecord.save();

      savedRecords.push({
        id: savedDoc._id,
        relativePath: cloudinaryUrl
      });

      existingPaths.push(cloudinaryUrl);
    }

    const count = savedRecords.length;

    const itemLabel = typeFolder === 'photos'
      ? count === 1 ? 'photo' : 'photos'
      : count === 1 ? 'video' : 'videos';

    return res.status(200).json({
      success: true,
      message: `${count} ${itemLabel} added successfully`,
      data: savedRecords
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getGalleryItems = async (req, res) => {
  try {
    const {
      page,
      limit,
      search,
      main_folder_name,
      sub_folder_name,
      media_type
    } = req.query;

    const query = {};

    if (main_folder_name) {
      query.main_folder_name =
        main_folder_name;
    }

    if (sub_folder_name) {
      query.sub_folder_name =
        sub_folder_name;
    }

    if (media_type) {
      if (
        media_type.toLowerCase() ===
        'photos'
      ) {
        query.photo_path = {
          $ne: null
        };
      } else if (
        media_type.toLowerCase() ===
        'videos'
      ) {
        query.video_path = {
          $ne: null
        };
      }
    }

    if (
      search &&
      search.trim() !== ''
    ) {
      const searchRegex =
        new RegExp(
          search.trim(),
          'i'
        );

      query.$or = [
        {
          main_folder_name:
            searchRegex
        },
        {
          sub_folder_name:
            searchRegex
        },
        {
          photo_path:
            searchRegex
        },
        {
          video_path:
            searchRegex
        }
      ];
    }

    if (page && limit) {
      const pageNumber =
        parseInt(page, 10) || 1;

      const pageSize =
        parseInt(limit, 10) || 10;

      const skip =
        (pageNumber - 1) *
        pageSize;

      const totalItems =
        await Gallery.countDocuments(
          query
        );

      const items =
        await Gallery.find(query)
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(pageSize);

      const formattedItems =
        items.map(item => ({
          id: item._id,
          main_folder_name:
            item.main_folder_name,
          sub_folder_name:
            item.sub_folder_name,
          event_date:
            item.event_date,
          photo_path:
            item.photo_path,
          video_path:
            item.video_path,
          created_at:
            item.created_at
        }));

      const totalPages =
        Math.ceil(
          totalItems / pageSize
        );

      return res.status(200).json({
        success: true,
        data:
          formattedItems,
        pagination: {
          totalItems,
          totalPages,
          currentPage:
            pageNumber,
          pageSize,
          hasNextPage:
            pageNumber < totalPages,
          hasPrevPage:
            pageNumber > 1
        }
      });
    }

    const items =
      await Gallery.find(query)
        .sort({
          created_at: -1
        });

    const formattedItems =
      items.map(item => ({
        id: item._id,
        main_folder_name:
          item.main_folder_name,
        sub_folder_name:
          item.sub_folder_name,
        event_date:
          item.event_date,
        photo_path:
          item.photo_path,
        video_path:
          item.video_path,
        created_at:
          item.created_at
      }));

    return res.status(200).json({
      success: true,
      data:
        formattedItems,
      totalCount:
        formattedItems.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { ids } = req.body;

    if (
      !ids ||
      !Array.isArray(ids) ||
      ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide an array of IDs to delete.'
      });
    }

    const records =
      await Gallery.find({
        _id: {
          $in: ids
        }
      });

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          'No matching records found.'
      });
    }

    let deletedPhotosCount = 0;
    let deletedVideosCount = 0;

    for (const record of records) {
      if (record.photo_path) {
        await deleteFromCloudinary(
          record.photo_path,
          'image'
        );

        deletedPhotosCount++;
      }

      if (record.video_path) {
        await deleteFromCloudinary(
          record.video_path,
          'video'
        );

        deletedVideosCount++;
      }
    }

    await Gallery.deleteMany({
      _id: {
        $in: ids
      }
    });

    const total =
      deletedPhotosCount +
      deletedVideosCount;

    let mediaTypeLabel;

    if (
      deletedPhotosCount > 0 &&
      deletedVideosCount === 0
    ) {
      mediaTypeLabel =
        total === 1
          ? 'photo'
          : 'photos';
    } else if (
      deletedVideosCount > 0 &&
      deletedPhotosCount === 0
    ) {
      mediaTypeLabel =
        total === 1
          ? 'video'
          : 'videos';
    } else {
      mediaTypeLabel =
        'media';
    }

    return res.status(200).json({
      success: true,
      message:
        `${total} ${mediaTypeLabel} deleted successfully`
    });
  } catch (error) {
    console.error(
      'Delete media error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const { id } =
      req.params;

    const item =
      await Gallery.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          'File not found.'
      });
    }

    const mainFolder =
      req.body.main_folder_name ||
      req.body.new_main_folder_name;

    const subFolder =
      req.body.sub_folder_name ||
      req.body.new_sub_folder_name;

    if (
      !mainFolder ||
      !subFolder
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Main folder and sub folder are required.'
      });
    }

    const safeNewMain =
      sanitizeName(mainFolder);

    const safeNewSub =
      sanitizeName(subFolder);

    const isPhoto =
      Boolean(item.photo_path);

    const typeFolder =
      isPhoto
        ? 'photos'
        : 'videos';

    const resourceType =
      isPhoto
        ? 'image'
        : 'video';

    const oldUrl =
      isPhoto
        ? item.photo_path
        : item.video_path;

    if (
      req.body.event_date !== undefined
    ) {
      item.event_date =
        req.body.event_date
          ? new Date(req.body.event_date)
          : new Date();
    }

    if (
      req.files &&
      req.files.length > 0
    ) {
      const uploadedFile =
        req.files[0];

      let existingRecords;

      if (isPhoto) {
        existingRecords =
          await Gallery.find({
            main_folder_name:
              safeNewMain,
            sub_folder_name:
              safeNewSub,
            photo_path: {
              $ne: null
            }
          }).select('photo_path');
      } else {
        existingRecords =
          await Gallery.find({
            main_folder_name:
              safeNewMain,
            sub_folder_name:
              safeNewSub,
            video_path: {
              $ne: null
            }
          }).select('video_path');
      }

      const existingPaths =
        existingRecords.map(record =>
          isPhoto
            ? record.photo_path
            : record.video_path
        );

      const seqNumber =
        getNextSequenceNumber(
          existingPaths,
          safeNewMain,
          safeNewSub
        );

      const fileName =
        `${safeNewMain}-${safeNewSub}-${seqNumber}`;

      const result =
        await uploadToCloudinary(
          uploadedFile.buffer,
          {
            folder:
              `bhakti-dmp/${safeNewMain}/${safeNewSub}/${typeFolder}`,
            public_id:
              fileName,
            resource_type:
              resourceType
          }
        );

      const newUrl =
        result.secure_url;

      await deleteFromCloudinary(
        oldUrl,
        resourceType
      );

      item.main_folder_name =
        safeNewMain;

      item.sub_folder_name =
        safeNewSub;

      if (isPhoto) {
        item.photo_path =
          newUrl;
      } else {
        item.video_path =
          newUrl;
      }
    } else {
      if (
        oldUrl &&
        oldUrl.includes(
          'res.cloudinary.com'
        )
      ) {
        const parts =
          oldUrl.split('/');

        const uploadIndex =
          parts.indexOf('upload');

        if (uploadIndex !== -1) {
          let publicIdParts =
            parts.slice(
              uploadIndex + 1
            );

          if (
            publicIdParts.length > 0 &&
            /^v\d+$/.test(
              publicIdParts[0]
            )
          ) {
            publicIdParts.shift();
          }

          const oldPublicId =
            publicIdParts
              .join('/')
              .replace(
                /\.[^/.]+$/,
                ''
              );

          const fileName =
            oldPublicId
              .split('/')
              .pop();

          const match =
            fileName.match(
              /-(\d+)$/
            );

          const seqNumber =
            match
              ? parseInt(
                match[1],
                10
              )
              : 1;

          const newPublicId =
            `bhakti-dmp/${safeNewMain}/${safeNewSub}/${typeFolder}/${safeNewMain}-${safeNewSub}-${seqNumber}`;

          await cloudinary.uploader.rename(
            oldPublicId,
            newPublicId,
            {
              resource_type:
                resourceType
            }
          );

          const newUrl =
            cloudinary.url(
              newPublicId,
              {
                secure: true,
                resource_type:
                  resourceType
              }
            );

          if (isPhoto) {
            item.photo_path =
              newUrl;
          } else {
            item.video_path =
              newUrl;
          }
        }
      }

      item.main_folder_name =
        safeNewMain;

      item.sub_folder_name =
        safeNewSub;
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message:
        'File updated successfully.',
      data:
        item
    });
  } catch (error) {
    console.error(
      'Update media error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};

exports.searchMedia = async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 10
    } = req.query;

    if (
      !q ||
      q.trim() === ''
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Search query parameter (q) is required.'
      });
    }

    const searchRegex =
      new RegExp(
        q.trim(),
        'i'
      );

    const query = {
      $or: [
        {
          main_folder_name:
            searchRegex
        },
        {
          sub_folder_name:
            searchRegex
        },
        {
          photo_path:
            searchRegex
        },
        {
          video_path:
            searchRegex
        }
      ]
    };

    const pageNumber =
      parseInt(page, 10);

    const pageSize =
      parseInt(limit, 10);

    const skip =
      (pageNumber - 1) *
      pageSize;

    const totalItems =
      await Gallery.countDocuments(
        query
      );

    const items =
      await Gallery.find(query)
        .sort({
          created_at: -1
        })
        .skip(skip)
        .limit(pageSize);

    const formattedItems =
      items.map(item => ({
        id: item._id,
        main_folder_name:
          item.main_folder_name,
        sub_folder_name:
          item.sub_folder_name,
        photo_path:
          item.photo_path,
        video_path:
          item.video_path,
        created_at:
          item.created_at
      }));

    return res.status(200).json({
      success: true,
      data:
        formattedItems,
      pagination: {
        totalItems,
        totalPages:
          Math.ceil(
            totalItems / pageSize
          ),
        currentPage:
          pageNumber,
        pageSize
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};