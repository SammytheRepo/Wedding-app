# QUICK START GUIDE 🚀

## Choose Your Setup Method:

### ⚡ OPTION 1: Simple Local Storage (Easiest - 2 minutes)

Perfect if you just want to test or use on local network without cloud storage.

```bash
npm install
node simple-server.js
```

That's it! Open the URL shown in your terminal.

---

### ☁️ OPTION 2: Google Drive Storage (Recommended for Production)

Best for permanent storage and easy sharing after the wedding.

1. **Get Google Drive Credentials:**
   - Go to https://console.cloud.google.com/
   - Create a project and enable Google Drive API
   - Create a service account and download `credentials.json`
   - Place `credentials.json` in this folder

2. **Create Drive Folder:**
   - Create a folder in Google Drive
   - Share it with the service account email (from credentials.json)
   - Copy the folder ID from the URL

3. **Configure Server:**
   - Open `server.js`
   - Change `DRIVE_FOLDER_ID` to your folder ID

4. **Run:**
```bash
npm install
npm start
```

---

## What You'll Need:

### For Local Network (Wedding Venue with WiFi):
- A computer/laptop running the server
- WiFi router (guests must be on same network)
- Print QR code pointing to: `http://YOUR_LOCAL_IP:3000`

### For Internet Access (Anywhere):
- Cloud server (DigitalOcean, AWS, etc.) - ~$5-10/month
- OR use a service like ngrok to expose local server
- Domain name (optional but nice)

---

## Creating Your QR Code:

1. **Get your server URL:**
   - Local: The IP shown when you run the server
   - Cloud: Your domain or server IP

2. **Generate QR code:**
   - Visit: https://www.qr-code-generator.com/
   - Enter your URL
   - Download and print!

3. **Display at wedding:**
   - Place on tables, entrance, photo booth
   - Add text: "Share Your Photos!"

---

## Testing Before Wedding Day:

1. Start the server
2. Scan the QR code with your phone
3. Upload a test photo
4. Check it appears in the gallery
5. Try from a friend's phone

---

## Troubleshooting:

**Can't access from phone:**
- Make sure phone and computer are on SAME WiFi
- Check firewall isn't blocking port 3000
- Try IP address instead of "localhost"

**Files not uploading:**
- Check file size (max 50MB)
- Verify server is running
- Look at server console for errors

**Google Drive not working:**
- Verify credentials.json is in the folder
- Check folder permissions
- Make sure API is enabled

---

## Need Help?

Check the full README.md for detailed instructions!

Happy wedding! 💕
