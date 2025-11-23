/**
 * TopMovers Widget - Displays stock market top gainers, losers, and most active
 * Calls window.openai.callTool on load to fetch data from the MCP server
 */

(function () {
  'use strict';

  const root = document.getElementById('topmovers-root');
  if (!root) {
    console.error('Widget root element not found');
    return;
  }

  // Initialize widget
  function init() {
    // Check if OpenAI SDK is available
    if (typeof window.openai === 'undefined') {
      console.log('Waiting for OpenAI SDK...');
      setTimeout(init, 100);
      return;
    }

    console.log('OpenAI SDK ready, calling topmovers tool...');
    showLoading();

    // Call the topmovers tool with a limit parameter
    window.openai
      .callTool('topmovers', { limit: 10 })
      .then((result) => {
        console.log('Tool result received:', result);
        const data = result.structuredContent;
        if (data) {
          renderTables(data);
        } else {
          showError('No data received from API');
        }
      })
      .catch((error) => {
        console.error('Error calling tool:', error);
        showError(error.message || 'Failed to load data');
      });
  }

  function showLoading() {
    root.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 200px; padding: 20px;">
        <div style="text-align: center;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Loading top market movers...</div>
          <div style="color: #6b7280; font-size: 14px;">Fetching data from Alpha Vantage</div>
        </div>
      </div>
    `;
  }

  function showError(message) {
    root.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <div style="color: #ef4444; font-weight: 600; margin-bottom: 8px;">⚠️ Error</div>
        <div style="color: #6b7280; font-size: 14px;">${escapeHtml(message)}</div>
      </div>
    `;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatNumber(value) {
    const num = parseFloat(value);
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatVolume(value) {
    const num = parseInt(value);
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toLocaleString();
  }

  function renderTables(data) {
    const categories = [
      { key: 'top_gainers', title: 'Top Gainers 📈', color: '#22c55e', bgColor: '#f0fdf4' },
      { key: 'top_losers', title: 'Top Losers 📉', color: '#ef4444', bgColor: '#fef2f2' },
      { key: 'most_actively_traded', title: 'Most Active 🔥', color: '#3b82f6', bgColor: '#eff6ff' },
    ];

    let html = `<div style="padding: 20px; max-width: 1200px; margin: 0 auto;">`;

    // Header
    html += `
      <div style="margin-bottom: 24px; text-align: center;">
        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #111827;">Stock Market Top Movers</h1>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Last updated: ${escapeHtml(data.last_updated || 'Unknown')}</p>
      </div>
    `;

    categories.forEach(({ key, title, color, bgColor }) => {
      const items = data[key] || [];

      html += `<div style="margin-bottom: 32px;">`;
      html += `
        <div style="background: ${bgColor}; border-left: 4px solid ${color}; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: ${color};">${title}</h2>
        </div>
      `;

      if (items.length === 0) {
        html += `<div style="padding: 20px; text-align: center; color: #6b7280;">No data available</div>`;
      } else {
        html += `<div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e5e7eb;">`;
        html += `
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; background: white;">
            <thead>
              <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151;">Ticker</th>
                <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #374151;">Price</th>
                <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #374151;">Change</th>
                <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #374151;">% Change</th>
                <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #374151;">Volume</th>
              </tr>
            </thead>
            <tbody>
        `;

        items.forEach((item, i) => {
          const bgColor = i % 2 === 0 ? '#ffffff' : '#f9fafb';
          const changeAmount = parseFloat(item.change_amount);
          const changePercent = parseFloat(item.change_percentage.replace('%', ''));
          const changeColor = changeAmount >= 0 ? '#22c55e' : '#ef4444';

          html += `
            <tr style="background: ${bgColor}; border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; font-weight: 600; color: #111827;">${escapeHtml(item.ticker)}</td>
              <td style="padding: 12px 16px; text-align: right; color: #374151;">$${formatNumber(item.price)}</td>
              <td style="padding: 12px 16px; text-align: right; color: ${changeColor}; font-weight: 500;">
                ${changeAmount >= 0 ? '+' : ''}$${formatNumber(item.change_amount)}
              </td>
              <td style="padding: 12px 16px; text-align: right; color: ${changeColor}; font-weight: 600;">
                ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%
              </td>
              <td style="padding: 12px 16px; text-align: right; color: #6b7280;">${formatVolume(item.volume)}</td>
            </tr>
          `;
        });

        html += `</tbody></table></div>`;
      }

      html += `</div>`;
    });

    html += `</div>`;

    root.innerHTML = html;
  }

  // Start initialization
  init();
})();
