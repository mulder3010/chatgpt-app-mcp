# Quick Start Guide

Get the ChatGPT MCP Stock Top Movers app running in 5 minutes.

## 🚀 One-Command Setup

```bash
# Clone, install, and setup
git clone https://github.com/mulder3010/chatgpt-app-mcp.git
cd chatgpt-app-mcp
npm install
cp .env.example .env
```

## 🔑 Get API Key

1. Visit: https://www.alphavantage.co/support/#api-key
2. Enter your email
3. Copy the API key
4. Edit `.env` and paste your key:
   ```
   ALPHA_VANTAGE_API_KEY=your_key_here
   ```

## 🛠️ Build & Run

```bash
# Build the project
npm run build

# Start the server
npm start
```

You should see:
```
✅ MCP Server running on http://localhost:3000
✅ MCP endpoint: http://localhost:3000/mcp
```

## 🌐 Expose with ngrok

In a **new terminal window**:

```bash
ngrok http 3000
```

Copy the `https://` URL (e.g., `https://abc123.ngrok.app`)

## 🤖 Connect to ChatGPT

1. Open ChatGPT Settings → Developer Mode (enable if needed)
2. Go to Connectors → Create new connector
3. Fill in:
   - **Name**: Stock Top Movers
   - **Type**: MCP
   - **URL**: `https://your-ngrok-url.ngrok.app/mcp`
4. Click **Test connection**
5. Click **Save**

## ✨ Try It

In ChatGPT, ask:
> "Show me today's top stock movers"

You should see an interactive widget with tables for:
- Top Gainers 📈
- Top Losers 📉  
- Most Active 🔥

## 🐛 Troubleshooting

**Server won't start?**
```bash
# Check if API key is set
cat .env

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
npm start
```

**Widget not loading?**
```bash
# Rebuild widget
npm run build:widget
```

**ChatGPT connection failed?**
- Make sure ngrok is still running
- Check ngrok URL hasn't expired (2 hour limit on free tier)
- Verify server is running on port 3000

## 📖 Next Steps

- Read the [full setup guide](SETUP.md) for detailed instructions
- Check out [ARCHITECTURE.md](ARCHITECTURE.md) to understand how it works
- See [CONTRIBUTING.md](CONTRIBUTING.md) to add features

## 💬 Support

Run into issues? [Open an issue](https://github.com/mulder3010/chatgpt-app-mcp/issues) on GitHub.
