# ChatGPT App with MCP - Stock Top Movers

A minimal TypeScript ChatGPT App using the Model Context Protocol (MCP) SDK to display top gainers and losers from Alpha Vantage.

## Features

- 🔧 **MCP Server** - Exposes a `topmovers` tool that fetches stock market movers
- 📊 **Interactive Widget** - Renders responsive tables for top gainers, losers, and most active stocks
- 🚀 **Express Backend** - Simple HTTP server for MCP integration
- 🔐 **Alpha Vantage Integration** - Real-time stock market data
- 🌐 **ngrok Ready** - Easy local development with HTTPS tunneling

## Prerequisites

- Node.js 18+ and npm
- [Alpha Vantage API Key](https://www.alphavantage.co/support/#api-key) (free)
- [ngrok](https://ngrok.com/) for local HTTPS tunnel

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/mulder3010/chatgpt-app-mcp.git
cd chatgpt-app-mcp
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your Alpha Vantage API key
```

### 3. Build the Project

```bash
npm run build
```

### 4. Run the Server

```bash
npm start
```

The MCP server will start on `http://localhost:3000`

### 5. Expose with ngrok (for ChatGPT integration)

In a separate terminal:

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.app`)

## Development

For hot-reloading during development:

```bash
npm run dev
```

## Project Structure

```
chatgpt-app-mcp/
├── src/
│   ├── server.ts           # Main MCP server & Express app
│   └── types.ts            # TypeScript type definitions
├── web/
│   ├── src/
│   │   └── widget.tsx      # React widget component
│   └── dist/               # Compiled widget assets
├── build-widget.js         # Widget build script
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. **MCP Server**: Implements the Model Context Protocol, registering:
   - A `topmovers` tool that calls Alpha Vantage's `TOP_GAINERS_LOSERS` endpoint
   - An HTML resource template that renders the widget UI

2. **Widget**: On load, calls `window.openai.callTool("topmovers", {limit})` to fetch data and renders three responsive tables:
   - Top Gainers
   - Top Losers  
   - Most Active

3. **Express Server**: Serves the MCP endpoint at `/mcp` via HTTP/SSE transport

## Using with ChatGPT

1. Enable Developer Mode in ChatGPT (Settings → Developer → Enable Developer Mode)
2. Create a new connector:
   - Type: MCP
   - URL: `https://your-ngrok-url.ngrok.app/mcp`
3. Test the connection
4. Try asking: "Show me today's top stock movers"

## API Reference

### Tool: `topmovers`

**Parameters:**
- `limit` (optional, number): Number of stocks to display per category (default: 10)

**Returns:**
```typescript
{
  top_gainers: Array<{
    ticker: string;
    price: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
  }>;
  top_losers: Array<{...}>;
  most_actively_traded: Array<{...}>;
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ALPHA_VANTAGE_API_KEY` | Your Alpha Vantage API key | Yes |
| `PORT` | Server port (default: 3000) | No |

## Troubleshooting

**API Rate Limits**: Alpha Vantage free tier has rate limits (5 calls/minute, 100 calls/day). For production use, consider upgrading.

**CORS Issues**: The widget runs in an iframe with strict CSP. Network requests must be to allowed domains specified in `openai/widgetCSP`.

**ngrok Session**: Free ngrok URLs expire after 2 hours. Restart ngrok and update your ChatGPT connector URL.

## License

MIT

## Resources

- [OpenAI Apps SDK Documentation](https://developers.openai.com/apps-sdk)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Alpha Vantage API](https://www.alphavantage.co/documentation/)
