// SIMPLE SERVER - LOCAL STORAGE ONLY
// Use this if you don't want to set up Google Drive

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// In-memory storage for metadata
let gallery = [];
const metadataFile = path.join(__dirname, 'gallery-metadata.json');

// Load existing metadata if available
if (fs.existsSync(metadataFile)) {
    try {
        const data = fs.readFileSync(metadataFile, 'utf8');
        gallery = JSON.parse(data);
        console.log(`✓ Loaded ${gallery.length} existing photos/videos`);
    } catch (error) {
        console.log('Starting with empty gallery');
    }
}

// Save metadata to file
function saveMetadata() {
    fs.writeFileSync(metadataFile, JSON.stringify(gallery, null, 2));
}

// Upload endpoint
app.post('/api/upload', upload.array('files', 20), (req, res) => {
    try {
        const { uploaderName } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadedFiles = [];

        files.forEach(file => {
            const galleryItem = {
                id: file.filename,
                url: `/uploads/${file.filename}`,
                uploaderName: uploaderName || 'Guest',
                uploadedAt: new Date().toISOString(),
                type: file.mimetype
            };

            gallery.unshift(galleryItem);
            uploadedFiles.push(galleryItem);
        });

        saveMetadata();

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

// Delete endpoint (optional - for admin use)
app.delete('/api/delete/:id', (req, res) => {
    const { id } = req.params;
    const index = gallery.findIndex(item => item.id === id);
    
    if (index !== -1) {
        const item = gallery[index];
        const filepath = path.join(__dirname, 'uploads', id);
        
        // Delete file
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        
        // Remove from gallery
        gallery.splice(index, 1);
        saveMetadata();
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get network IP address
function getLocalIP() {
    const nets = require('os').networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// Start server
app.listen(PORT, () => {
    const localIP = getLocalIP();
    
    console.log(`
╔═══════════════════════════════════════════════════════╗
║        Wedding Photo Sharing App - SIMPLE MODE       ║
╚═══════════════════════════════════════════════════════╝

✓ Server running successfully!

📱 On this device:          http://localhost:${PORT}
🌐 On local network:        http://${localIP}:${PORT}

📁 Files saved to:          ${uploadsDir}
📊 Current gallery items:   ${gallery.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO USE:

1. Make sure your phone and this computer are on the SAME WiFi
2. Create a QR code pointing to: http://${localIP}:${PORT}
3. Print the QR code and place it at your wedding venue
4. Guests scan, upload, and share memories!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIP: Keep this window open during your wedding event!

    `);
});
