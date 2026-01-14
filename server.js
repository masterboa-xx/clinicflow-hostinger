const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Change to 0.0.0.0 to listen on all interfaces
const port = process.env.PORT || 3000;

// Simple logger to file
const logFile = path.join(__dirname, 'public', 'startup-log.txt');
function log(message) {
    const timestamp = new Date().toISOString();
    const msg = `[${timestamp}] ${message}\n`;
    console.log(msg);
    try {
        fs.appendFileSync(logFile, msg);
    } catch (e) {
        // Ignore logging errors
    }
}

log(`Starting server on port ${port}, env: ${process.env.NODE_ENV}`);

try {
    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
        createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);

                // Log request (optional, good for verifying traffic)
                // log(`Request: ${req.url}`);

                await handle(req, res, parsedUrl);
            } catch (err) {
                log(`Error occurred handling ${req.url}: ${err.message}\n${err.stack}`);
                res.statusCode = 500;
                res.end('internal server error');
            }
        })
            .once('error', (err) => {
                log(`Server creation error: ${err.message}\n${err.stack}`);
                process.exit(1);
            })
            .listen(port, () => {
                log(`> Ready on http://${hostname}:${port}`);
            });
    }).catch(err => {
        log(`Next.js prepare() error: ${err.message}\n${err.stack}`);
        process.exit(1);
    });
} catch (err) {
    log(`Top-level exception: ${err.message}\n${err.stack}`);
}
