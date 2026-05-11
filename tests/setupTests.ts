import '@testing-library/jest-dom';
const { TextEncoder, TextDecoder } = require('node:util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Basic Response.json polyfill for older environments
if (typeof Response !== 'undefined' && !Response.json) {
  Response.json = (data, init) => {
    const res = new Response(JSON.stringify(data), init);
    res.headers.set('Content-Type', 'application/json');
    return res;
  };
}

// Add ResizeObserver mock for Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;
