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
      enum: ["faculty", "student", "admin"],
      default: "student",
      required: true
    },

    permissions: {
      type: [String],
      default: undefined
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // this prevents multiple hashing 
  if (!this.isModified("password")) { 
    return
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.permissions) {
    if (this.role === "student" || this.role === "faculty") this.permissions = ["basic_access"];
    // else if (this.role === "faculty") this.permissions = ["course_access"];
    // Admin permissions will come from form
  }
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model("User", userSchema);