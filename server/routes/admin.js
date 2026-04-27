const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, requireAdmin } = require('../middleware/auth');

// GET /api/admin/settings/public — no auth required
router.get('/settings/public', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json({
            siteName: settings.siteName,
            maintenanceMode: settings.maintenanceMode,
            allowRegistration: settings.allowRegistration
        });
    } catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
});

// GET /api/admin/settings
router.get('/settings', protect, requireAdmin, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json({
            siteName: settings.siteName,
            maxUploadSize: settings.maxUploadSize,
            maintenanceMode: settings.maintenanceMode,
            allowRegistration: settings.allowRegistration,
            autoApproveStudents: settings.autoApproveStudents
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
});

// POST /api/admin/settings
router.post('/settings', protect, requireAdmin, async (req, res) => {
    try {
        const { maintenanceMode, allowRegistration, siteName, maxUploadSize } = req.body;

        // Validation
        const errors = [];

        if (typeof siteName !== 'string' || siteName.trim().length === 0) {
            errors.push('siteName must be a non-empty string.');
        } else if (siteName.trim().length > 100) {
            errors.push('siteName must be 100 characters or fewer.');
        }

        const uploadSizeNum = Number(maxUploadSize);
        if (!Number.isFinite(uploadSizeNum) || uploadSizeNum < 1 || uploadSizeNum > 500) {
            errors.push('maxUploadSize must be a number between 1 and 500 (MB).');
        }

        if (typeof maintenanceMode !== 'boolean') {
            errors.push('maintenanceMode must be a boolean.');
        }

        if (typeof allowRegistration !== 'boolean') {
            errors.push('allowRegistration must be a boolean.');
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.siteName = siteName.trim();
        settings.maxUploadSize = uploadSizeNum;
        settings.maintenanceMode = maintenanceMode;
        settings.allowRegistration = allowRegistration;

        await settings.save();

        res.json({ message: 'Settings saved successfully', settings: {
            siteName: settings.siteName,
            maxUploadSize: settings.maxUploadSize,
            maintenanceMode: settings.maintenanceMode,
            allowRegistration: settings.allowRegistration,
            autoApproveStudents: settings.autoApproveStudents
        }});
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ message: 'Failed to save settings' });
    }
});

module.exports = router;

