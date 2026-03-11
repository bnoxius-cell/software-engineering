const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    artist: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    medium: {
      type: String,
      default: "Digital Art"
    },
    genre: {
      type: String,
      default: "General"
    },
    year: {
      type: Number,
      default: new Date().getFullYear()
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artwork", artworkSchema);
