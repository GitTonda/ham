/**
 * Application constants.
 */

export const CONSTANTS = {
  REFRESH_INTERVALS: [
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '5m', value: 300 },
    { label: '15m', value: 900 },
  ],
  TIME_RANGES: [
    { label: 'Last hour', value: '-1h' },
    { label: 'Last 24 hours', value: '-24h' },
    { label: 'Last 7 days', value: '-7d' },
    { label: 'Last 30 days', value: '-30d' },
  ],
  CHART_TYPES: [
    { label: 'Line Chart', value: 'line' },
    { label: 'Step Chart', value: 'step' },
    { label: 'Badge', value: 'badge' },
    { label: 'Text', value: 'text' },
  ],
};
