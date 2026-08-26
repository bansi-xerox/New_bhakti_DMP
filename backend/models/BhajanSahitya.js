const mongoose = require('mongoose');

const bhajanSahityaSchema = new mongoose.Schema({
  sahitya_name: { type: String, required: true },
  heading_name: { type: String, required: true },
  bhajan_name: { type: String, required: true },
  bhajan_kadi: { type: String, default: null },
  bhajan_rag: { type: String, default: null },
  bhajan: { type: String, required: true },
  bhajan_bhavarth: { type: String, default: null },
  page_no: { type: Number, default: null },
  youtube_link: { type: String, default: null },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null } 
});

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