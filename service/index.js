const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(compression({ level: 6 }));

const port = process.argv.length > 2 ? process.argv[2] : 7000;

// Security Middlewares
app.set('trust proxy', 'loopback');
app.disable('x-powered-by');

app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');

    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    'https://cdn.jsdelivr.net',
                    'https://unpkg.com',
                    `'nonce-${res.locals.nonce}'`
                ],
                styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https:'],
                fontSrc: ["'self'", 'https:', 'data:'],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },
    })(req, res, next);
});

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true,
});

app.use(limiter);

const corsOptions = {
    origin: 'https://ammonkunzler.com/',
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

express.static.mime.define({
    'text/javascript': ['js', 'mjs'],
    'text/css': ['css']
});

// Middleware
app.use(express.json());

app.use('/for-lizy', express.static('dist', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Update the catch-all route
app.get('/sandbox-headstart/*', (_req, res) => {
    res.sendFile('index.html', { root: 'dist' });
});

app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'text/javascript');
        }
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));


// Start the server
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Default route handler
app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});