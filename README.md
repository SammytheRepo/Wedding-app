# Wedding Photo Sharing App - Setup Guide

A beautiful, minimalist web application for wedding guests to share photos and videos via QR code. All media is stored in Google Drive for easy access and organization.

## Features

✨ **Elegant Design**: Minimalist wedding aesthetic with rose gold accents
📸 **Photo & Video Upload**: Support for all image and video formats (up to 50MB)
📱 **Mobile Optimized**: Perfect for guests scanning QR codes on their phones
☁️ **Google Drive Storage**: All files automatically uploaded to your Google Drive
🖼️ **Live Gallery**: Real-time gallery updates showing all shared memories
💝 **Guest Names**: Optional name field to know who shared what

---

## Quick Start Guide

### Option 1: Google Drive Storage (Recommended)

#### Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

#### Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `wedding-photo-app`
   - Click "Create and Continue"
4. Grant the role: "Editor" (optional)
5. Click "Done"

#### Step 3: Download Credentials

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the file and rename it to `credentials.json`
6. Place `credentials.json` in the same directory as `server.js`

#### Step 4: Create Google Drive Folder

1. Open [Google Drive](https://drive.google.com)
2. Create a new folder (e.g., "Wedding Photos")
3. Right-click the folder and click "Share"
4. Share it with the service account email from `credentials.json` (looks like: `wedding-photo-app@project-name.iam.gserviceaccount.com`)
5. Give it "Editor" permissions
6. Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the `FOLDER_ID_HERE` part

#### Step 5: Configure Server

1. Open `server.js`
2. Find the line: `const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID_HERE';`
3. Replace `YOUR_FOLDER_ID_HERE` with your folder ID from Step 4

#### Step 6: Install and Run

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The server will run on `http://localhost:3000`

---

### Option 2: Local Storage (Simple Setup)

If you don't want to use Google Drive, the app will automatically save files locally:

1. Just run the server:
```bash
npm install
npm start
```

2. Files will be saved to an `uploads/` folder in the project directory
3. Perfect for testing or if you plan to manually transfer files later

---

## Deploying to a Server

### Option A: Deploy on Your Own Computer

1. Make sure your computer has Node.js installed
2. Get your computer's local IP address:
   - Windows: Run `ipconfig` in Command Prompt
   - Mac/Linux: Run `ifconfig` or `ip addr`
   - Look for something like `192.168.1.X`

3. Allow connections through firewall:
   - Windows: Allow Node.js through Windows Firewall
   - Mac: System Preferences > Security & Privacy > Firewall

4. Start the server:
```bash
npm start
```

5. Guests can access at: `http://YOUR_LOCAL_IP:3000`
   - Example: `http://192.168.1.105:3000`

**Note**: This only works on the same WiFi network!

### Option B: Deploy on a Cloud Server (Recommended for Production)

#### Using DigitalOcean, AWS, or similar:

1. Create a server (Ubuntu 20.04 or later)
2. SSH into your server
3. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. Upload your project files (use FileZilla, SCP, or Git)
5. Install dependencies and run:
```bash
cd wedding-photo-app
npm install
npm start
```

6. Use PM2 to keep the server running:
```bash
sudo npm install -g pm2
pm2 start server.js --name wedding-app
pm2 startup
pm2 save
```

7. Set up a domain name (optional but recommended)
8. Configure firewall to allow port 3000

#### Using Heroku (Free Tier Available):

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`
3. Create app: `heroku create wedding-photo-app`
4. Add credentials as environment variable:
```bash
heroku config:set GOOGLE_CREDENTIALS="$(cat credentials.json)"
```
5. Deploy:
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

---

## Creating the QR Code

Once your server is running:

1. Get your server URL:
   - Local network: `http://YOUR_LOCAL_IP:3000`
   - Cloud server: `http://your-domain.com` or `http://server-ip:3000`

2. Generate QR code using any of these free tools:
   - [QR Code Generator](https://www.qr-code-generator.com/)
   - [QRCode Monkey](https://www.qrcode-monkey.com/)
   - Google "QR code generator"

3. Enter your server URL
4. Download the QR code image
5. Print it and display at your wedding venue!

**Pro Tips**:
- Print multiple QR codes for different tables
- Add text like "Share Your Photos!" above the QR code
- Include the URL below the QR code as a backup
- Test the QR code before the wedding day

---

## File Structure

```
wedding-photo-app/
├── server.js              # Backend server
├── package.json           # Dependencies
├── credentials.json       # Google Drive credentials (not included)
├── wedding-app.html       # Frontend application
├── public/                # Static files folder
│   └── index.html        # Copy wedding-app.html here
└── uploads/              # Local storage folder (auto-created)
```

---

## Customization

### Change Wedding Couple Names

Edit `wedding-app.html`:
```html
<h1>Wedding Memories</h1>
<!-- Change to: -->
<h1>Sarah & John's Wedding</h1>
```

### Change Color Scheme

Edit the CSS variables in `wedding-app.html`:
```css
:root {
    --rose-gold: #B76E79;    /* Main accent color */
    --deep-rose: #8B5A5F;    /* Secondary color */
    --champagne: #F4EAE0;    /* Background tint */
}
```

### Adjust File Size Limit

In `server.js`:
```javascript
limits: {
    fileSize: 50 * 1024 * 1024 // Change to desired MB * 1024 * 1024
}
```

---

## Troubleshooting

### "Google Drive API not initialized"
- Check that `credentials.json` exists in the project folder
- Verify the service account has access to the folder
- Make sure Google Drive API is enabled in Google Cloud Console

### "Upload failed"
- Check file size (must be under 50MB)
- Verify internet connection
- Check server console for error messages

### "Cannot connect to server"
- Verify server is running (`npm start`)
- Check firewall settings
- Confirm you're using the correct IP address
- Make sure you're on the same WiFi network (for local deployment)

### Files not appearing in gallery
- Check the `gallery` array in server console
- Verify Google Drive folder permissions
- Clear browser cache and refresh

### QR code not working
- Test the URL in a browser first
- Make sure the server is accessible from other devices
- Try regenerating the QR code

---

## Production Best Practices

1. **Use HTTPS**: Set up SSL certificate for secure connections
2. **Database**: Replace in-memory storage with MongoDB/PostgreSQL
3. **Authentication**: Add admin panel with password protection
4. **Rate Limiting**: Prevent spam uploads
5. **Image Optimization**: Compress images before storage
6. **Backup**: Regularly backup your Google Drive folder
7. **Monitoring**: Use PM2 or similar for process monitoring

---

## Alternative Storage Options

### Using Amazon S3 instead of Google Drive

Replace the Google Drive code in `server.js` with AWS S3 SDK:

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

// Upload function
async function uploadToS3(file, originalName) {
    const params = {
        Bucket: 'your-bucket-name',
        Key: `${Date.now()}_${originalName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };
    
    const result = await s3.upload(params).promise();
    return result.Location;
}
```

---

## Support

For issues or questions:
- Check the troubleshooting section
- Review server console logs
- Verify all setup steps were completed

---

## License

MIT License - Feel free to modify and use for your wedding!

---

## Credits

Built with love for your special day! 💕

Enjoy collecting beautiful memories from your guests!
