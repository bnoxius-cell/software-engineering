const express = require('express');
const router = express.Router();

// In a production app, you would store this in MongoDB
let globalSettings = {
    maintenanceMode: false,
    allowRegistration: true,
    siteName: 'Artisan',
    maxUploadSize: 10
};

// GET /api/admin/settings
router.get('/settings', (req, res) => {
    res.json(globalSettings);
});

// POST /api/admin/settings
router.post('/settings', (req, res) => {
    const { maintenanceMode, allowRegistration, siteName, maxUploadSize } = req.body;
    globalSettings = {
        maintenanceMode,
        allowRegistration,
        siteName,
        maxUploadSize: Number(maxUploadSize)
    };
    res.json({ message: 'Settings saved successfully', settings: globalSettings });
});

module.exports = router;