const  rateLimit  = require("express-rate-limit")
const {logEvents}= require('./logger')

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5, 
    message: {
        error: 'Too many login attempts from this IP, please try again after a minute',
        retryAfter: (req, res, options) => Math.ceil((options.windowMs - (Date.now() - options.lastValidRequest)) / 1000)
    },
    handler: (req, res, next, options) => {
        logEvents(`Too Many Requests: ${options.message.error}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log');
        res.status(options.statusCode).json(options.message);
    },
    standardHeaders: true, 
    legacyHeaders: false 
});

module.exports = loginLimiter

