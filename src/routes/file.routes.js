const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');
const fileController = require('../controllers/file.controller');

router.post(
  '/api/files/signed-upload',
  authGuard,
  roleGuard(['TEACHER']),
  fileController.createSignedUpload
);

module.exports = router;