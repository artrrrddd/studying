const ApiError = require('../exceptions/api-error');

module.exports = function (err, req, res, next) {
    console.error('Error middleware:', err?.message || err);
    if (res.headersSent) return next(err);
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message, errors: err.errors });
    }
    return res.status(500).json({
        message: 'Непредвиденная ошибка',
        error: process.env.NODE_ENV !== 'production' ? (err?.message || String(err)) : undefined
    });
};


