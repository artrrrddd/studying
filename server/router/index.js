const Router = require('express').Router;
const UserController = require('../controllers/user-controller');
const CardController = require('../controllers/card-controller');
const LessonController = require('../controllers/lesson-controller');
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

router.get('/lessons', authMiddleware, LessonController.getAll);
router.get('/my/lessons', authMiddleware, LessonController.getAll);
router.get('/lessons/:id', authMiddleware, LessonController.getById);

router.patch(
  '/lessons/:id',
  authMiddleware,
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('cards').optional().isArray(),
  LessonController.update
);

router.delete('/lessons/:id', authMiddleware, LessonController.delete);

module.exports = router;


