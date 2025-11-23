/**
 * Simple build script for the widget
 * This bundles the widget code into a single JS file
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create dist directory if it doesn't exist
const distDir = join(__dirname, 'web', 'dist');
try {
  mkdirSync(distDir, { recursive: true });
} catch (err) {
  // Directory already exists
}

// Read widget source
const widgetSource = readFileSync(
  join(__dirname, 'web', 'src', 'widget.js'),
  'utf8'
);

// For now, just copy it (in a real project, you'd use esbuild or similar)
writeFileSync(join(distDir, 'widget.js'), widgetSource);

// Create minimal CSS
const css = `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
}

#topmovers-root {
  min-height: 100vh;
  background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  #topmovers-root {
    background: #1f2937;
    color: #f3f4f6;
  }
}
`;

writeFileSync(join(distDir, 'widget.css'), css);

console.log('✅ Widget built successfully!');
