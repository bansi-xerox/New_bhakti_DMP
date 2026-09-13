const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  main_folder_name: {
    type: String,
    required: true
  },
  sub_folder_name: {
    type: String,
    required: true
  },
  event_date: {
    type: Date,
    default: null
  },
  photo_path: {
    type: String,
    default: null
  },
  video_path: {
    type: String,
    default: null
  }
}, {
  // Automatically handles the created_at timestamp requirement
  timestamps: { createdAt: 'created_at', updatedAt: false } 
});

module.exports = mongoose.model('Gallery', gallerySchema);