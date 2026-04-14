const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['account_approved', 'artwork_approved', 'info_modified', 'account_created'], 
        required: true 
    },
    message: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed }, // Stores change logs
    isRead: { type: Boolean, default: false },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Notification", notificationSchema);