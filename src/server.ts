import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import express, { Request, Response } from "express";
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import type { AlphaVantageResponse, TopMoversData } from "./types.js";

// Load environment variables
config();

const PORT = process.env.PORT || 3000;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

if (!ALPHA_VANTAGE_API_KEY) {
  throw new Error("ALPHA_VANTAGE_API_KEY is required in .env file");
}

// Create Express app
const app = express();

// Create MCP server
const server = new McpServer({
  name: "topmovers-server",
  version: "1.0.0",
});

// Load widget assets
let WIDGET_JS = "";
let WIDGET_CSS = "";

try {
  WIDGET_JS = readFileSync("web/dist/widget.js", "utf8");
} catch (error) {
  console.warn(
    "Widget JS not found. Run `npm run build:widget` to generate it."
  );
  WIDGET_JS = `
    // Fallback widget code
    (function() {
      const root = document.getElementById('topmovers-root');
      if (!root) return;
      
      // Wait for OpenAI SDK to be available
      if (typeof window.openai === 'undefined') {
        setTimeout(arguments.callee, 100);
        return;
      }
      
      root.innerHTML = '<div style="padding: 20px; text-align: center;">Loading top movers...</div>';
      
      // Call the topmovers tool
      window.openai.callTool('topmovers', { limit: 10 })
        .then(function(result) {
          const data = result.structuredContent;
          renderTables(data);
        })
        .catch(function(error) {
          root.innerHTML = '<div style="padding: 20px; color: red;">Error loading data: ' + error.message + '</div>';
        });
      
      function renderTables(data) {
        const categories = [
          { key: 'top_gainers', title: 'Top Gainers', color: '#22c55e' },
          { key: 'top_losers', title: 'Top Losers', color: '#ef4444' },
          { key: 'most_actively_traded', title: 'Most Active', color: '#3b82f6' }
        ];
        
        let html = '<div style="padding: 20px; font-family: -apple-system, system-ui, sans-serif;">';
        
        categories.forEach(function(cat) {
          const items = data[cat.key] || [];
          html += '<div style="margin-bottom: 30px;">';
          html += '<h3 style="color: ' + cat.color + '; margin-bottom: 15px;">' + cat.title + '</h3>';
          html += '<div style="overflow-x: auto;">';
          html += '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">';
          html += '<thead><tr style="background: #f3f4f6; text-align: left;">';
          html += '<th style="padding: 10px;">Ticker</th>';
          html += '<th style="padding: 10px;">Price</th>';
          html += '<th style="padding: 10px;">Change</th>';
          html += '<th style="padding: 10px;">% Change</th>';
          html += '<th style="padding: 10px;">Volume</th>';
          html += '</tr></thead><tbody>';
          
          items.forEach(function(item, i) {
            const bgColor = i % 2 === 0 ? '#ffffff' : '#f9fafb';
            const changeAmount = parseFloat(item.change_amount);
            const changePercentage = parseFloat(item.change_percentage);
            
            html += '<tr style="background: ' + bgColor + ';">';
            html += '<td style="padding: 10px; font-weight: 600;">' + item.ticker + '</td>';
            html += '<td style="padding: 10px;">$' + parseFloat(item.price).toFixed(2) + '</td>';
            html += '<td style="padding: 10px; color: ' + (changeAmount >= 0 ? '#22c55e' : '#ef4444') + ';">$' + item.change_amount + '</td>';
            html += '<td style="padding: 10px; color: ' + (changePercentage >= 0 ? '#22c55e' : '#ef4444') + ';">' + item.change_percentage + '</td>';
            html += '<td style="padding: 10px;">' + parseInt(item.volume).toLocaleString() + '</td>';
            html += '</tr>';
          });
          
          html += '</tbody></table></div></div>';
        });
        
        html += '</div>';
        root.innerHTML = html;
      }
    })();
  `;
}

try {
  WIDGET_CSS = readFileSync("web/dist/widget.css", "utf8");
} catch (error) {
  console.warn("Widget CSS not found. Using fallback styles.");
  WIDGET_CSS = `
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #topmovers-root { min-height: 100vh; }
  `;
}

// Register HTML resource for the widget
server.registerResource(
  "topmovers-widget",
  "ui://widget/topmovers.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/topmovers.html",
        mimeType: "text/html+skybridge",
        text: `
<div id="topmovers-root"></div>
${WIDGET_CSS ? `<style>${WIDGET_CSS}</style>` : ""}
<script type="module">${WIDGET_JS}</script>
        `.trim(),
        _meta: {
          "openai/widgetPrefersBorder": true,
          "openai/widgetDomain": "https://alphavantage.co",
          "openai/widgetCSP": {
            connect_domains: ["https://www.alphavantage.co"],
            resource_domains: [],
          },
          "openai/widgetDescription":
            "Displays an interactive widget showing top stock market gainers, losers, and most actively traded stocks from Alpha Vantage.",
        },
      },
    ],
  })
);

// Type guard for API error responses
interface ApiErrorResponse {
  "Error Message"?: string;
  Note?: string;
}

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    ("Error Message" in data || "Note" in data)
  );
}

// Fetch data from Alpha Vantage
async function fetchTopMovers(): Promise<AlphaVantageResponse> {
  const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.statusText}`);
  }

  const data: unknown = await response.json();

  // Check for API errors
  if (isApiErrorResponse(data)) {
    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage API error: ${data["Error Message"]}`);
    }
    if (data["Note"]) {
      throw new Error("API rate limit exceeded. Please try again later.");
    }
  }

  // Validate response structure
  if (
    typeof data === "object" &&
    data !== null &&
    "top_gainers" in data &&
    "top_losers" in data &&
    "most_actively_traded" in data
  ) {
    return data as AlphaVantageResponse;
  }

  throw new Error("Unexpected response format from Alpha Vantage API.");
}

// Register the topmovers tool
server.registerTool(
  "topmovers",
  {
    title: "Top Stock Market Movers",
    description:
      "Fetches and displays the top gaining, losing, and most actively traded stocks in the US market",
    _meta: {
      "openai/outputTemplate": "ui://widget/topmovers.html",
      "openai/toolInvocation/invoking": "Fetching top market movers...",
      "openai/toolInvocation/invoked": "Displayed top market movers",
      "openai/widgetAccessible": true,
    },
    inputSchema: z.object({
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .describe("Number of stocks to display per category (default: 10)"),
    }),
  },
  async ({ limit = 10 }) => {
    try {
      const data = await fetchTopMovers();

      // Limit the results
      const limitedData: TopMoversData = {
        top_gainers: data.top_gainers.slice(0, limit),
        top_losers: data.top_losers.slice(0, limit),
        most_actively_traded: data.most_actively_traded.slice(0, limit),
        last_updated: data.last_updated,
      };

      return {
        structuredContent: limitedData as unknown as Record<string, unknown>,
        content: [
          {
            type: "text" as const,
            text: `Retrieved top ${limit} gainers, losers, and most active stocks. Last updated: ${data.last_updated}`,
          },
        ],
        _meta: {
          fullData: data,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching top movers: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Express middleware
app.use(express.json());

// Health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    name: "TopMovers MCP Server",
    version: "1.0.0",
    endpoints: {
      mcp: "/mcp",
      health: "/",
    },
  });
});

// MCP endpoint with SSE transport
app.get("/mcp", async (_req: Request, res: Response) => {
  console.log("MCP connection request received");

  const transport = new SSEServerTransport("/mcp", res);
  await server.connect(transport);

  console.log("MCP client connected");
});

app.post("/mcp", async (_req: Request, res: Response) => {
  console.log("MCP POST request received");
  res.status(405).json({ error: "Use GET for SSE connection" });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ MCP Server running on http://localhost:${PORT}`);
  console.log(`✅ MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(
    `\n🔑 Using Alpha Vantage API key: ${ALPHA_VANTAGE_API_KEY.substring(
      0,
      8
    )}...`
  );
  console.log(`\n🌐 To expose via ngrok, run: ngrok http ${PORT}\n`);
});
