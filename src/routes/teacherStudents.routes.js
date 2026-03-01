const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');
const ctrl = require('../controllers/teacherStudents.controller');

router.use('/api/teacher', authGuard, roleGuard(['TEACHER']));

router.get('/api/teacher/students', ctrl.listStudents);
router.get('/api/teacher/students/:id/progress', ctrl.getStudentProgress);

module.exports = router;