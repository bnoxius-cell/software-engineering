const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    artworks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Artwork",
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collection", collectionSchema);