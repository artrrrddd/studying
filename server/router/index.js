const Router = require('express').Router;
const UserController = require('../controllers/user-controller');
const CardController = require('../controllers/card-controller');
const LessonController = require('../controllers/lesson-controller');
const ExportController = require('../controllers/export-controller');
const CallController = require('../controllers/call-controller');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware');

/* ================== МАРШРУТЫ ДЛЯ AUTH ================== */

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    UserController.registration
);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.get('/activate/:link', UserController.activate);
router.get('/refresh', UserController.refresh);
router.get('/users', authMiddleware, UserController.getUsers);

/* ================== МАРШРУТЫ ДЛЯ КАРТОЧЕК ================== */

router.post('/cards',
    body('word').notEmpty().trim(),
    body('translate').notEmpty().trim(),
    body('lang').notEmpty().trim(),
    CardController.create
);
router.get('/cards', CardController.getAll);
router.get('/my/cards', authMiddleware, CardController.getMine);
router.get('/cards/:id', CardController.getById);
router.patch('/cards/:id',
    body('word').optional().trim(),
    body('translate').optional().trim(),
    body('lang').optional().trim(),
    CardController.update
);
router.delete('/cards/:id', CardController.delete);

/* ================== МАРШРУТЫ ДЛЯ УРОКОВ ================== */

router.post(
  '/lessons',
  authMiddleware,
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
  body('cards').optional().isArray(),
  LessonController.create
);

router.get('/lessons', LessonController.getAll);
router.get('/myLessons', authMiddleware, LessonController.getMine);
router.get('/lessons/:id', LessonController.getById);
router.get('/export/lessons/:id/image', ExportController.lessonImage);

router.patch(
  '/lessons/:id',
  authMiddleware,
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('cards').optional().isArray(),
  LessonController.update
);

router.delete('/lessons/:id', authMiddleware, LessonController.delete);

/* ================== CALL ROUTES ================== */

router.post('/calls', authMiddleware, CallController.create);
router.get('/calls', authMiddleware, CallController.getMine);
router.get('/calls/:id', authMiddleware, CallController.getById);
router.post('/calls/:id/join', authMiddleware, CallController.join);
router.post('/calls/:id/invites', authMiddleware, CallController.createInvite);
router.post('/calls/join-by-code', authMiddleware, CallController.joinByCode);
router.post('/calls/:id/end', authMiddleware, CallController.end);
router.patch(
  '/calls/:id/participants/:userId/permissions',
  authMiddleware,
  CallController.updateParticipantPermissions
);
router.delete(
  '/calls/:id/participants/:userId',
  authMiddleware,
  CallController.removeParticipant
);

module.exports = router;
