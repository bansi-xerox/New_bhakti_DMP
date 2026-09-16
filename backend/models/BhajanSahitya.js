const mongoose = require('mongoose');

const bhajanSahityaSchema = new mongoose.Schema({
  sahitya_name: { type: String, required: true, trim: true },
  heading_name: { type: String, default: null, trim: true },
  bhajan_name: { type: String, required: true, trim: true },
  bhajan_kadi: { type: String, default: null, trim: true },
  bhajan_rag: { type: String, default: null, trim: true },
  bhajan: { type: String, required: true },
  bhajan_bhavarth: { type: String, default: null },
  page_no: { type: String, default: null },
  youtube_link: { type: String, default: null },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null } 
});

// Compound Unique Index: heading_name ન હોય તો પણ duplicate ચેક બરાબર ચાલે
bhajanSahityaSchema.index(
  { sahitya_name: 1, heading_name: 1, bhajan_name: 1 }, 
  { unique: true }
);

bhajanSahityaSchema.pre('save', function () {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
});

bhajanSahityaSchema.pre('findOneAndUpdate', function () {
  this.set({ updated_at: new Date() });
});

module.exports = mongoose.model('BhajanSahitya', bhajanSahityaSchema);