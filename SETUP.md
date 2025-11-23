# Setup Guide

Detailed instructions for setting up and running the ChatGPT MCP Stock Top Movers app.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Building](#building)
5. [Running Locally](#running-locally)
6. [Exposing via ngrok](#exposing-via-ngrok)
7. [ChatGPT Integration](#chatgpt-integration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Alpha Vantage API Key** (free tier available)
- **ngrok** for HTTPS tunneling ([Download](https://ngrok.com/download))

### Optional

- **ChatGPT Plus** account (for testing in ChatGPT)
- **Git** for cloning the repository

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/mulder3010/chatgpt-app-mcp.git
cd chatgpt-app-mcp
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `@modelcontextprotocol/sdk` - MCP SDK for server implementation
- `express` - Web server framework
- `zod` - Schema validation
- `dotenv` - Environment variable management
- TypeScript and related development tools

## Configuration

### Step 1: Get Alpha Vantage API Key

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Enter your email to get a free API key
3. Copy the API key (it will look like: `ABC123XYZ456`)

### Step 2: Create Environment File

```bash
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit `.env` and add your API key:

```env
ALPHA_VANTAGE_API_KEY=your_actual_api_key_here
PORT=3000
```

## Building

### Build Everything

```bash
npm run build
```

This runs two build steps:
1. **TypeScript Compilation** - Compiles `src/*.ts` to `dist/*.js`
2. **Widget Build** - Bundles the widget code from `web/src/` to `web/dist/`

### Build Steps Separately

```bash
# Build TypeScript only
npx tsc

# Build widget only
npm run build:widget
```

## Running Locally

### Production Mode

Run the compiled version:

```bash
npm start
```

You should see:
```
✅ MCP Server running on http://localhost:3000
✅ MCP endpoint: http://localhost:3000/mcp
🔑 Using Alpha Vantage API key: ABC123XY...
🌐 To expose via ngrok, run: ngrok http 3000
```

### Development Mode

For hot-reloading during development:

```bash
npm run dev
```

This uses `tsx watch` to automatically restart the server when you change TypeScript files.

### Verify Server is Running

Test the health endpoint:

```bash
curl http://localhost:3000
```

Expected response:
```json
{
  "status": "ok",
  "name": "TopMovers MCP Server",
  "version": "1.0.0",
  "endpoints": {
    "mcp": "/mcp",
    "health": "/"
  }
}
```

## Exposing via ngrok

### Step 1: Install ngrok

If you haven't already:

**macOS (Homebrew):**
```bash
brew install ngrok/ngrok/ngrok
```

**Linux/Windows:**
Download from [ngrok.com/download](https://ngrok.com/download)

### Step 2: Start ngrok

In a **separate terminal window**:

```bash
ngrok http 3000
```

You'll see output like:

```
Session Status                online
Account                       you@email.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abc123.ngrok.app -> http://localhost:3000
```

### Step 3: Copy the HTTPS URL

Copy the `https://` URL (e.g., `https://abc123.ngrok.app`)

**Important Notes:**
- Keep the ngrok terminal window open while testing
- Free ngrok URLs expire after 2 hours
- You'll need to update your ChatGPT connector if the URL changes

## ChatGPT Integration

### Prerequisites

- ChatGPT Plus or higher subscription
- Developer mode enabled (currently in beta)

### Step 1: Enable Developer Mode

1. Go to ChatGPT Settings
2. Navigate to **Developer** section
3. Enable **Developer Mode**

### Step 2: Create a Connector

1. In ChatGPT, go to **Settings** → **Connectors**
2. Click **Create new connector**
3. Fill in the details:
   - **Name**: Stock Top Movers
   - **Type**: MCP
   - **URL**: `https://your-ngrok-url.ngrok.app/mcp`
4. Click **Test connection**
5. If successful, click **Save**

### Step 3: Test the Integration

In ChatGPT, try queries like:
- "Show me today's top stock movers"
- "What are the top gainers in the market?"
- "Display the most actively traded stocks"

The widget should appear inline with the data rendered in tables.

## Testing

### Test with MCP Inspector

The MCP SDK provides an inspector tool for testing:

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/mcp
```

This opens a web interface where you can:
- List available tools
- Call the `topmovers` tool
- See the response including structured content and widget HTML

### Manual API Test

Test the Alpha Vantage API directly:

```bash
curl "https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=YOUR_API_KEY"
```

### Test Widget Locally

You can test the widget HTML by opening `web/dist/widget.js` in a browser (though it won't have access to the MCP SDK).

## Troubleshooting

### Common Issues

#### 1. "ALPHA_VANTAGE_API_KEY is required"

**Cause**: `.env` file missing or API key not set

**Fix**: 
```bash
cp .env.example .env
# Edit .env and add your API key
```

#### 2. "API rate limit exceeded"

**Cause**: Alpha Vantage free tier limits:
- 5 API calls per minute
- 100 API calls per day

**Fix**: 
- Wait a minute and try again
- Consider upgrading to a paid Alpha Vantage plan for production use

#### 3. "Widget not loading"

**Cause**: Widget build failed or files missing

**Fix**:
```bash
npm run build:widget
```

#### 4. "ngrok connection refused"

**Cause**: Server not running or wrong port

**Fix**:
- Ensure server is running: `npm start`
- Check port matches: `ngrok http 3000`

#### 5. "ChatGPT connector test failed"

**Possible causes**:
- ngrok URL expired (regenerate)
- Server not running
- Firewall blocking connection

**Fix**:
- Restart ngrok and update connector URL
- Ensure server is running
- Check ngrok logs for connection attempts

#### 6. "Module not found" errors

**Cause**: Dependencies not installed

**Fix**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Debugging Tips

1. **Check server logs**: The server logs all requests and errors
2. **Use MCP Inspector**: Better visibility into MCP communication
3. **Check ngrok dashboard**: Visit `http://localhost:4040` when ngrok is running
4. **Verify API key**: Test Alpha Vantage API directly with curl

### Getting Help

- **Alpha Vantage Support**: [alphavantage.co/support](https://www.alphavantage.co/support/)
- **MCP Documentation**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **OpenAI Apps SDK**: [developers.openai.com/apps-sdk](https://developers.openai.com/apps-sdk)
- **GitHub Issues**: [Report a bug](https://github.com/mulder3010/chatgpt-app-mcp/issues)

## Next Steps

- [Deploy to production](DEPLOYMENT.md) (coming soon)
- Customize the widget styling
- Add more MCP tools
- Implement caching to reduce API calls
