require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const stream = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1); // Trust first proxy (Render, Railway, etc.)
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax'
    }
}));

// Setup Multer for file upload in memory
const upload = multer({ storage: multer.memoryStorage() });

const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];

// Helper to get OAuth2 client configured for current host / environment
function getOAuthClient(req) {
    let redirectUri;
    if (process.env.REDIRECT_URI) {
        redirectUri = process.env.REDIRECT_URI;
    } else if (process.env.RENDER_EXTERNAL_URL) {
        redirectUri = `${process.env.RENDER_EXTERNAL_URL}/auth/google/callback`;
    } else {
        const protocol = (req && (req.headers['x-forwarded-proto'] || req.protocol)) || 'http';
        const host = (req && req.get('host')) || `localhost:${PORT}`;
        redirectUri = `${protocol}://${host}/auth/google/callback`;
    }
    
    return new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        redirectUri
    );
}

// Authentication Routes
app.get('/auth/google', (req, res) => {
    const client = getOAuthClient(req);
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
    res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
    const { code, error } = req.query;
    if (error) {
        console.error('Google OAuth error:', error);
        return res.redirect(`/?auth_error=${encodeURIComponent(error)}`);
    }
    try {
        const client = getOAuthClient(req);
        const { tokens } = await client.getToken(code);
        req.session.tokens = tokens;
        
        try {
            client.setCredentials(tokens);
            const oauth2 = google.oauth2({ version: 'v2', auth: client });
            const userInfo = await oauth2.userinfo.get();
            if (userInfo.data && userInfo.data.email) {
                req.session.userEmail = userInfo.data.email;
            }
        } catch (e) {
            console.log('User info retrieval skipped:', e.message);
        }
        
        res.redirect('/');
    } catch (err) {
        console.error('Error fetching tokens:', err);
        res.redirect(`/?auth_error=${encodeURIComponent(err.message || 'auth_failed')}`);
    }
});

// API Routes for Frontend
app.get('/api/auth/status', (req, res) => {
    if (req.session.tokens) {
        res.json({ 
            authenticated: true,
            email: req.session.userEmail || 'oranghilang377@gmail.com'
        });
    } else {
        res.json({ authenticated: false });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Helper function to get or create 'Photo Storage Pro' folder
async function getOrCreateFolder(drive) {
    const folderName = 'Photo Storage Pro';
    try {
        const response = await drive.files.list({
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
        });
        
        if (response.data.files.length > 0) {
            return response.data.files[0].id;
        } else {
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder'
            };
            const folder = await drive.files.create({
                resource: fileMetadata,
                fields: 'id'
            });
            return folder.data.id;
        }
    } catch (error) {
        console.error('Error creating folder:', error);
        throw error;
    }
}

// Drive Upload Route
app.post('/api/drive/upload', upload.single('file'), async (req, res) => {
    if (!req.session.tokens) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const client = getOAuthClient(req);
        client.setCredentials(req.session.tokens);
        const drive = google.drive({ version: 'v3', auth: client });
        
        const folderId = await getOrCreateFolder(drive);
        
        const fileMetadata = {
            name: req.file.originalname,
            parents: [folderId]
        };

        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        const media = {
            mimeType: req.file.mimetype,
            body: bufferStream
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });

        res.json({ success: true, fileId: file.data.id });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
