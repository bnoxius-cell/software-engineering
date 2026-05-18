const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: "Artisan",
    trim: true,
    maxlength: 100
  },
  maxUploadSize: {
    type: Number,
    default: 10,
    min: 1,
    max: 500
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  autoApproveStudents: {
    type: Boolean,
    default: false
  },
  // NEW: auto-approve for artwork uploads
  autoApproveArtworks: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);