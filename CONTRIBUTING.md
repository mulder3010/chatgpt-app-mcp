# Contributing to ChatGPT App MCP

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/chatgpt-app-mcp.git
   cd chatgpt-app-mcp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file with your Alpha Vantage API key
5. Run in development mode:
   ```bash
   npm run dev
   ```

## Making Changes

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add JSDoc comments for functions
- Use meaningful variable names

### Testing

Before submitting:

1. Build the project: `npm run build`
2. Test locally: `npm start`
3. Test with MCP Inspector
4. Test in ChatGPT if possible

### Commit Messages

Use clear, descriptive commit messages:

```
Add caching layer for API responses
Fix widget rendering on mobile devices
Update Alpha Vantage error handling
```

## Pull Request Process

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Commit your changes:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request on GitHub

## Areas for Contribution

- 🐛 Bug fixes
- 🎨 Widget styling improvements
- 📊 Additional data visualizations
- 📝 Documentation improvements
- ⚙️ Performance optimizations
- ✨ New MCP tools (e.g., specific stock lookup, technical indicators)

## Questions?

Open an issue or reach out via GitHub discussions.
