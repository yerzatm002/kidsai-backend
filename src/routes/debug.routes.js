const router = require('express').Router();
const { createUserDebug, getUserDebug } = require('../controllers/debug.controller');

router.post('/debug/users', createUserDebug);
router.get('/debug/users/:id', getUserDebug);

module.exports = router;