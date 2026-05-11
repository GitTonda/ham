/**
 * Environment variables configuration and validation.
 * Ensures that the application has all necessary settings to run.
 */

export const env = {
  port: process.env.PORT || 3000,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  influx: {
    url: process.env.INFLUXDB_URL || '',
    token: process.env.INFLUXDB_TOKEN || '',
    org: process.env.INFLUXDB_ORG || '',
    bucket: process.env.INFLUXDB_BUCKET || '',
  },
  llm: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.LLM_MODEL || 'claude-opus-4-7',
  },
};

// Simple validation to ensure critical variables are present
if (!env.influx.token || !env.llm.apiKey) {
  console.warn('Warning: Missing INFLUXDB_TOKEN or ANTHROPIC_API_KEY in environment variables.');
}
