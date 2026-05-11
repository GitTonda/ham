import { DataSignature } from '@/types';

/**
 * Utility to process raw InfluxDB data into a summarized signature.
 * Handles edge cases like empty arrays and non-numeric values.
 */
export const summarizeData = (data: any[], metricName: string): DataSignature => {
  if (!data || data.length === 0) {
    return {
      metricName,
      min: 0,
      max: 0,
      avg: 0,
      startVal: 0,
      endVal: 0,
      pctChange: 0,
      count: 0,
    };
  }

  // Extract values, ensuring we only deal with numbers
  const values = data
    .map((d) => (typeof d._value === 'number' ? d._value : parseFloat(d._value)))
    .filter((v) => !isNaN(v));

  if (values.length === 0) {
    return {
      metricName,
      min: 0,
      max: 0,
      avg: 0,
      startVal: 0,
      endVal: 0,
      pctChange: 0,
      count: 0,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  
  const startVal = values[0];
  const endVal = values[values.length - 1];
  
  // Calculate percentage change
  let pctChange = 0;
  if (startVal !== 0) {
    pctChange = ((endVal - startVal) / Math.abs(startVal)) * 100;
  } else if (endVal !== 0) {
    pctChange = 100; // From 0 to something is a 100% increase in this context
  }

  return {
    metricName,
    min,
    max,
    avg: Number(avg.toFixed(2)),
    startVal,
    endVal,
    pctChange: Number(pctChange.toFixed(2)),
    count: values.length,
  };
};
