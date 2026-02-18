const Router = require('express').Router;
const UserController = require('../controllers/user-controller');
const CardController = require('../controllers/card-controller');
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
router.get('/cards/:id', CardController.getById);
router.patch('/cards/:id',
    body('word').optional().trim(),
    body('translate').optional().trim(),
    body('lang').optional().trim(),
    CardController.update
);
router.delete('/cards/:id', CardController.delete);

module.exports = router;


