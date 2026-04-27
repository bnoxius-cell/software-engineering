# Admin Settings Security & Persistence Fix

## Steps
- [x] 1. Update `server/models/Settings.js` schema to include all fields
- [x] 2. Add `requireAdmin` middleware to `server/middleware/auth.js`
- [x] 3. Rewrite `server/routes/admin.js` with auth, DB persistence, and validation
- [x] 4. Update `server/routes/auth.js` to check `allowRegistration`
- [x] 5. Update `server/routes/artwork.js` to enforce `maxUploadSize`
- [x] 6. Add maintenance mode middleware to `server.js`
- [x] 7. Update `client/src/App.jsx` to fetch settings, apply `siteName`, handle `maintenanceMode`
- [x] 8. Fix `client/src/pages/Settings_Admin/AdminSettings.jsx` hardcoded URL + validation
- [x] 9. Update `client/src/pages/Register/Register.jsx` to respect `allowRegistration`
- [x] 10. Fix `client/src/pages/Upload/Upload.jsx` hardcoded URL
- [x] 11. Fix `client/src/components/Navbar.jsx` hardcoded URL
- [x] 12. Create `client/src/pages/Maintenance/Maintenance.jsx` page

