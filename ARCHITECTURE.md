# Architecture Overview

This document explains the architecture and data flow of the ChatGPT MCP Stock Top Movers application.

## System Components

```
┌────────────────────────────────────────────────────┐
│                    ChatGPT Client                      │
│  (⚡️ User asks: "Show me top stock movers")          │
└────────────────────────┬───────────────────────────┘
                         │
                         │ MCP Protocol
                         │ (SSE/HTTP)
                         │
┌────────────────────────┴───────────────────────────┐
│                                                          │
│              MCP Server (Express + SDK)                │
│                                                          │
│  ┌──────────────────────────────────────────────┐  │
│  │         Tool: "topmovers"                     │  │
│  │  - Fetches from Alpha Vantage API          │  │
│  │  - Returns structured data                 │  │
│  │  - Links to widget template                │  │
│  └──────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────┐  │
│  │    Resource: "ui://widget/topmovers.html"   │  │
│  │  - HTML + CSS + JavaScript                 │  │
│  │  - Rendered in iframe                      │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────┴───────────────────────────┐
│                                                          │
│            Alpha Vantage API                            │
│  (https://www.alphavantage.co/query)                   │
│                                                          │
│  Endpoint: TOP_GAINERS_LOSERS                          │
│  Returns: JSON with market data                        │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Tool Invocation

```typescript
// ChatGPT calls the tool
CALL topmovers { limit: 10 }

↓

// Server handler executes
async ({ limit = 10 }) => {
  const data = await fetchTopMovers();
  return {
    structuredContent: limitedData,  // For widget
    content: [...],                   // For model
  };
}
```

### 2. Alpha Vantage API Request

```typescript
GET https://www.alphavantage.co/query
  ?function=TOP_GAINERS_LOSERS
  &apikey=YOUR_KEY

↓

Response:
{
  "top_gainers": [
    {
      "ticker": "AAPL",
      "price": "150.25",
      "change_amount": "5.30",
      "change_percentage": "3.65%",
      "volume": "82456789"
    },
    ...
  ],
  "top_losers": [...],
  "most_actively_traded": [...]
}
```

### 3. Widget Rendering

```javascript
// Widget code (runs in iframe)
window.openai.callTool('topmovers', { limit: 10 })
  .then(result => {
    const data = result.structuredContent;
    renderTables(data);  // Creates HTML tables
  });
```

### 4. Response Structure

```typescript
{
  // Visible to the model - used for reasoning
  content: [
    {
      type: "text",
      text: "Retrieved top 10 gainers, losers, and most active stocks..."
    }
  ],
  
  // Sent to widget for rendering
  structuredContent: {
    top_gainers: [...],
    top_losers: [...],
    most_actively_traded: [...],
    last_updated: "2024-11-24T08:00:00Z"
  },
  
  // Widget-only metadata (not shown to model)
  _meta: {
    fullData: {...}
  }
}
```

## Key Design Decisions

### 1. Single-File Widget

The widget is bundled into a single JavaScript file that:
- Loads automatically when the widget is rendered
- Calls `window.openai.callTool()` on initialization
- Renders responsive HTML tables
- Has no external dependencies

### 2. MCP Protocol

Using the Model Context Protocol (MCP) allows:
- Standard integration with ChatGPT
- Tool discovery and invocation
- Structured data exchange
- Component lifecycle management

### 3. SSE Transport

Server-Sent Events (SSE) for MCP communication:
- Maintains persistent connection
- Bidirectional communication
- Real-time updates possible

### 4. Content Security Policy

Strict CSP for the widget iframe:
- Only allows connections to Alpha Vantage domain
- No external resource loading (except specified domains)
- Protects user data and privacy

## Technology Stack

### Backend

- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment
- **Express** - HTTP server framework
- **@modelcontextprotocol/sdk** - MCP implementation
- **Zod** - Schema validation

### Frontend (Widget)

- **Vanilla JavaScript** - No framework overhead
- **HTML/CSS** - Responsive table rendering
- **OpenAI SDK** - `window.openai` for tool calls

### Development

- **tsx** - TypeScript execution and hot-reload
- **ngrok** - HTTPS tunneling for local development

## Security Considerations

### API Key Protection

- API key stored in `.env` (not committed to Git)
- Server-side only - never exposed to client
- Environment variable validation on startup

### Widget Isolation

- Runs in sandboxed iframe
- Strict Content Security Policy
- No access to parent page or cookies
- Limited network access via CSP

### Rate Limiting

Alpha Vantage free tier limits:
- 5 API calls per minute
- 100 API calls per day
- Consider implementing caching for production

## Extension Points

### Adding More Tools

```typescript
server.registerTool(
  'stock-quote',
  { /* tool config */ },
  async ({ symbol }) => {
    // Fetch specific stock data
  }
);
```

### Custom Widget Components

```typescript
server.registerResource(
  'custom-widget',
  'ui://widget/custom.html',
  {},
  async () => ({ /* resource config */ })
);
```

### API Caching

```typescript
const cache = new Map();

async function fetchTopMovers() {
  const cacheKey = 'topmovers';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.data;
  }
  
  const data = await fetch(...);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

## Performance Optimization

### Current Implementation

- No caching (every request hits Alpha Vantage)
- Synchronous data fetching
- Full dataset returned

### Recommended Improvements

1. **Response Caching**
   - Cache API responses for 1-5 minutes
   - Reduce API call frequency
   - Faster response times

2. **Data Pagination**
   - Support `limit` and `offset` parameters
   - Load more data on demand

3. **Lazy Loading**
   - Initial render with cached data
   - Background refresh
   - Update indicator in UI

4. **Error Handling**
   - Retry logic for failed API calls
   - Exponential backoff
   - Graceful degradation

## Deployment Considerations

For production deployment:

1. **HTTPS**: Required by ChatGPT (use real domain, not ngrok)
2. **API Key Management**: Use secrets manager (not .env)
3. **Rate Limiting**: Implement caching to stay within API limits
4. **Monitoring**: Log API calls and errors
5. **Scaling**: Consider serverless deployment (AWS Lambda, Vercel)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions (coming soon).
