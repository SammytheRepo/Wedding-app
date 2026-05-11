const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const stream = require('stream');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads (temporary storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Google Drive configuration
// You need to create a service account and download the credentials
// Instructions: https://cloud.google.com/iam/docs/creating-managing-service-accounts
const KEYFILEPATH = path.join(__dirname, 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Your Google Drive folder ID where files will be uploaded
// Create a folder in Google Drive and get its ID from the URL
const DRIVE_FOLDER_ID = '1i1WxEGZPxDAF8uaz1h2FX08zDr8Z7JSC';

let drive;

// Initialize Google Drive API
async function initializeDrive() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEYFILEPATH,
            scopes: SCOPES,
        });

        const authClient = await auth.getClient();
        drive = google.drive({ version: 'v3', auth: authClient });
        console.log('✓ Google Drive API initialized successfully');
    } catch (error) {
        console.error('Error initializing Google Drive:', error);
        console.log('⚠ Running without Google Drive integration');
    }
}

// In-memory storage for metadata (replace with a database in production)
let gallery = [];

// Upload files to Google Drive
async function uploadToDrive(file, originalName) {
    const fileMetadata = {
        name: `${Date.now()}_${originalName}`,
        parents: [DRIVE_FOLDER_ID]
    };

    const media = {
        mimeType: file.mimetype,
        body: stream.Readable.from(file.buffer)
    };

    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink'
        });

        // Make the file publicly accessible
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        // Get the direct download link
        const fileUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
        
        return {
            id: response.data.id,
            url: fileUrl,
            webViewLink: response.data.webViewLink
        };
    } catch (error) {
        console.error('Error uploading to Drive:', error);
        throw error;
    }
}

// Upload endpoint
app.post('/api/upload', upload.array('files', 20), async (req, res) => {
    try {
        const { uploaderName } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadedFiles = [];

        for (const file of files) {
            let fileUrl, fileId;

            if (drive) {
                // Upload to Google Drive
                const driveFile = await uploadToDrive(file, file.originalname);
                fileUrl = driveFile.url;
                fileId = driveFile.id;
            } else {
                // Fallback: save to local filesystem
                const uploadsDir = path.join(__dirname, 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir);
                }
                
                const filename = `${Date.now()}_${file.originalname}`;
                const filepath = path.join(uploadsDir, filename);
                fs.writeFileSync(filepath, file.buffer);
                fileUrl = `/uploads/${filename}`;
                fileId = filename;
            }

            const galleryItem = {
                id: fileId,
                url: fileUrl,
                uploaderName: uploaderName || 'Guest',
                uploadedAt: new Date().toISOString(),
                type: file.mimetype
            };

            gallery.unshift(galleryItem); // Add to beginning
            uploadedFiles.push(galleryItem);
        }

        res.json({
            success: true,
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Gallery endpoint
app.get('/api/gallery', (req, res) => {
    res.json(gallery);
});

// Serve uploaded files (for local storage fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize and start server
async function start() {
    await initializeDrive();
    
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║   Wedding Photo Sharing App Server    ║
╚════════════════════════════════════════╝

✓ Server running on http://localhost:${PORT}
✓ Upload endpoint: http://localhost:${PORT}/api/upload
✓ Gallery endpoint: http://localhost:${PORT}/api/gallery

${drive ? '✓ Google Drive integration active' : '⚠ Using local storage (Google Drive not configured)'}

Setup instructions:
1. Create a Google Cloud project
2. Enable Google Drive API
3. Create a service account and download credentials.json
4. Place credentials.json in this directory
5. Create a folder in Google Drive and set DRIVE_FOLDER_ID
6. Generate QR code pointing to: http://your-server-address:${PORT}
        `);
    });
}

start();
