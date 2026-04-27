const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },
  // Changed to match React's 'medium' dropdown
  medium: { 
    type: String,
    required: true
  },
  // Added to support the new UI
  description: {
    type: String,
    default: ""
  },
  // Added to support the new UI
  tags: {
    type: String,
    default: ""
  },
  mediaType: {
    type: String,
    enum: ["image", "video"],
    default: "image"
  },
  image: {
    type: String, // path to uploaded file or Cloudinary URL
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: []
  },
  // We make this optional for now just so you can test the upload without auth blocking you
  artistName: {
    type: String,
    required: false,
    default: "Unknown Artist" 
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: { 
    type: String, 
    enum: ['pending', 'published', 'rejected', 'archived'], 
    default: 'pending' // <--- THIS IS THE MAGIC KEY
  },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      content: { type: String, required: true },
      likes: { type: Number, default: 0 },
      likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      createdAt: { type: Date, default: Date.now }
    }
  ]
},
{ timestamps: true }
);

module.exports = mongoose.model("Artwork", artworkSchema);
