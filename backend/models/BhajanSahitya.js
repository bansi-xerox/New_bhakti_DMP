const mongoose = require('mongoose');

const bhajanSahityaSchema = new mongoose.Schema({
  sahitya_name: { type: String, required: true },
  heading_name: { type: String, default: null },
  bhajan_name: { type: String, required: true },
  bhajan_kadi: { type: String, default: null },
  bhajan_rag: { type: String, default: null },
  bhajan: { type: String, required: true },
  bhajan_bhavarth: { type: String, default: null },
  page_no: { type: String, default: null },
  youtube_link: { type: String, default: null },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null } 
});

// Create a compound unique index to prevent duplicate records with the same Sahitya, Heading, and Bhajan name
bhajanSahityaSchema.index({ sahitya_name: 1, heading_name: 1, bhajan_name: 1 }, { unique: true });

// Modern way: no 'next' needed. 
bhajanSahityaSchema.pre('save', function () {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
});

bhajanSahityaSchema.pre('findOneAndUpdate', function () {
  this.set({ updated_at: new Date() });
});

module.exports = mongoose.model('BhajanSahitya', bhajanSahityaSchema);