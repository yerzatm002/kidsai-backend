const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

router.get('/api/teacher/ping', authGuard, roleGuard(['TEACHER']), (req, res) => {
  res.json({ ok: true, message: 'teacher endpoint доступен', user: req.user });
});

module.exports = router;