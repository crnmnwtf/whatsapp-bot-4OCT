# 📱 WhatsApp Bot Dashboard

A complete, ready-to-run WhatsApp automation solution that uses Puppeteer for WhatsApp Web control, real-time communication via Socket.io, and a modern React dashboard.

## ⚠️ Important Notice

This solution uses Puppeteer to control a Chromium instance and access WhatsApp Web. This method **bypasses** the official WhatsApp Business API and may violate WhatsApp's Terms of Service. Use strictly for personal, development, and prototyping purposes only.

## ✨ Features

- 🤖 **WhatsApp Automation** - Control WhatsApp Web via Puppeteer
- 📱 **Real-time Dashboard** - Modern React interface with shadcn/ui components
- 🔄 **Live Communication** - Socket.io for real-time message handling
- 💾 **Message Persistence** - SQLite database with Prisma ORM
- 📸 **Screenshot Monitoring** - View bot status in real-time
- 📱 **PWA Support** - Install as mobile app on your device
- 🌐 **Mobile Deep Links** - Open messages directly in WhatsApp mobile app

## 🛠 Technology Stack

### Core Framework
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Modern styling
- **🧩 shadcn/ui** - High-quality UI components

### WhatsApp Automation
- **🎭 Puppeteer** - Browser automation for WhatsApp Web
- **🔄 Socket.io** - Real-time bidirectional communication
- **🗄️ Prisma + SQLite** - Lightweight database persistence

### Progressive Web App
- **📱 PWA Manifest** - Installable mobile app
- **🔧 Service Worker** - Offline support and caching
- **🎯 Mobile-First** - Responsive design for all devices

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd whatsapp-bot-dashboard

# Install dependencies
npm install

# Set up environment
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` file with your settings:

```env
# Database
DATABASE_URL=file:./db/data.db

# WhatsApp Bot Configuration
PUPPETEER_HEADLESS=false
PUPPETEER_USER_DATA=./session_data

# Server Configuration
NODE_ENV=development
PORT=3000
```

### 3. Database Setup

```bash
# Push database schema
npm run db:push
```

### 4. Start the Application

```bash
# Start development server
npm run dev
```

The server will:
1. Launch the Next.js application on http://localhost:3000
2. Initialize Puppeteer and open WhatsApp Web
3. Show QR code for first-time setup (scan with your phone)

### 5. First-Time Setup

1. Open http://localhost:3000 in your browser
2. Look for the Chromium window that opened automatically
3. Scan the QR code with your phone's WhatsApp
4. Wait for WhatsApp Web to load
5. The dashboard will show "Bot Ready" status

## 📱 Usage

### Sending Messages

1. Enter a phone number (with country code, e.g., 60123456789)
2. Type your message
3. Click "Send Message" or use the "Open WhatsApp" button

### Monitoring

- **Message Logs**: View all incoming/outgoing messages in real-time
- **Screenshot**: Take a screenshot of the current WhatsApp Web view
- **Status**: Check if the bot is properly initialized

### Mobile Features

- Install the dashboard as a PWA on your mobile device
- Use deep links to open messages directly in WhatsApp mobile app
- Responsive design works perfectly on all screen sizes

## 🏗 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── messages/      # Message history API
│   │   │   └── bot/           # Bot status API
│   │   ├── layout.tsx         # Root layout with PWA support
│   │   └── page.tsx           # Main dashboard
│   ├── components/ui/         # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   │   └── use-socket.ts      # Socket.io client hook
│   └── lib/                   # Core functionality
│       ├── whatsapp.ts        # Puppeteer WhatsApp automation
│       ├── socket.ts          # Socket.io server setup
│       └── db.ts              # Prisma database client
├── public/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
├── prisma/
│   └── schema.prisma          # Database schema
└── session_data/              # Puppeteer user data (gitignored)
```

## 🔧 Configuration Options

### Puppeteer Settings

- `PUPPETEER_HEADLESS`: Set to `true` for production (no browser window)
- `PUPPETEER_USER_DATA`: Directory for WhatsApp session persistence

### Development vs Production

**Development (Recommended for setup):**
```env
PUPPETEER_HEADLESS=false
```
- Shows browser window for QR scanning
- Easier debugging and monitoring

**Production:**
```env
PUPPETEER_HEADLESS=true
```
- Runs completely headless
- Better for server deployment

## 📊 API Endpoints

### GET /api/messages
Retrieve message history with pagination:
```bash
GET /api/messages?limit=50&offset=0
```

### GET /api/bot/status
Check bot initialization status:
```bash
GET /api/bot/status
```

## 🔌 Socket.io Events

### Client → Server

- `send_message`: Send a WhatsApp message
- `get_screenshot`: Request current view screenshot
- `get_status`: Check bot status

### Server → Client

- `message_sent`: Message sent successfully
- `incoming_message`: New message received
- `screenshot`: Screenshot data
- `status`: Bot status update
- `error_*`: Various error events

## 🚨 Troubleshooting

### Bot Not Initializing

1. Check that Chromium launches properly
2. Verify WhatsApp Web loads in the browser window
3. Ensure QR code is scanned correctly
4. Check console logs for error messages

### Connection Issues

1. Verify Socket.io connection in browser console
2. Check that port 3000 is not blocked
3. Ensure WebSocket connections are allowed

### WhatsApp Web Issues

1. Clear session data: Delete `session_data` folder
2. Restart the application
3. Scan QR code again
4. Check internet connection

## 📱 Mobile Installation

1. Open the dashboard in mobile browser
2. Look for "Add to Home Screen" option
3. Install as PWA for native app experience
4. Use deep links for WhatsApp integration

## 🔒 Security Considerations

- This tool is for development/prototyping only
- Never use for production messaging
- Respect WhatsApp's Terms of Service
- Keep your session data secure
- Use in a trusted environment only

## 🚀 Production Deployment

For production use, consider:

1. **Docker Setup**: Run in isolated container
2. **Reverse Proxy**: Nginx with SSL/TLS
3. **Process Manager**: PM2 or similar
4. **Monitoring**: Health checks and logging
5. **Official API**: Switch to WhatsApp Business API

## 📝 Development Notes

- Session data persists in `session_data/` directory
- Messages are stored in SQLite database
- Real-time updates via Socket.io
- PWA works offline with cached resources
- Mobile deep links use `whatsapp://` scheme

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and development purposes. Use responsibly and in accordance with WhatsApp's Terms of Service.

---

**⚠️ Disclaimer**: This tool is provided for educational and development purposes only. Users are responsible for complying with WhatsApp's Terms of Service and applicable laws.
