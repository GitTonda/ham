import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mocking global objects that might be missing in the test environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mocking InfluxDB and other complex clients if needed globally
// But we'll mostly do it per test.

// Add ResizeObserver mock for Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;
