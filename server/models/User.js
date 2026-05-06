const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); 

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["Faculty", "Student", "Admin"],
      default: "Student",
      required: true
    },

    permissions: {
      type: [String],
      default: undefined
    },
    avatar: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: ""
    },
    socials: {
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      website: { type: String, default: "" }
    },
    savedArtworks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Artwork",
      default: []
    },
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    },
    likedArtworks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Artwork",
      default: []
    },
    autoApproveUploads: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'pending'
    },
    privacy: {
      hideFollowers: { type: Boolean, default: false },
      hideFollowing: { type: Boolean, default: false }
    },
    notifications: {
      artworkAdded: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function() {
  try {
    // Hash password if modified
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // Set default permissions based on role
    if (!this.permissions) {
      if (this.role === "Student" || this.role === "Faculty") {
        this.permissions = ["basic_access"];
      }
      // Admin permissions set explicitly
    }
  } catch (error) {
    throw error;
  }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
