const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },

  artistName: {
    type: String,
    required: true
  },

  genre: {
    type: String,
    required: true
  },

  image: {
    type: String, // path to uploaded file
    required: true
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Artwork", artworkSchema);