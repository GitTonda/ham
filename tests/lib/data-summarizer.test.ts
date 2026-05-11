import { summarizeData } from '@/lib/data-summarizer';

describe('data-summarizer', () => {
  const metricName = 'test_metric';

  it('should handle empty arrays', () => {
    const result = summarizeData([], metricName);
    expect(result.count).toBe(0);
    expect(result.avg).toBe(0);
  });

  it('should handle undefined data', () => {
    const result = summarizeData(undefined as any, metricName);
    expect(result.count).toBe(0);
  });

  it('should correctly calculate statistics for numeric data', () => {
    const data = [
      { _value: 10 },
      { _value: 20 },
      { _value: 30 },
    ];
    const result = summarizeData(data, metricName);
    expect(result.min).toBe(10);
    expect(result.max).toBe(30);
    expect(result.avg).toBe(20);
    expect(result.count).toBe(3);
    expect(result.startVal).toBe(10);
    expect(result.endVal).toBe(30);
    expect(result.pctChange).toBe(200); // (30-10)/10 * 100
  });

  it('should handle string values that are numbers', () => {
    const data = [
      { _value: "10.5" },
      { _value: "20.5" },
    ];
    const result = summarizeData(data, metricName);
    expect(result.avg).toBe(15.5);
  });

  it('should filter out non-numeric values', () => {
    const data = [
      { _value: 10 },
      { _value: "invalid" },
      { _value: 20 },
    ];
    const result = summarizeData(data, metricName);
    expect(result.count).toBe(2);
    expect(result.avg).toBe(15);
  });

  it('should handle pctChange correctly when startVal is 0', () => {
    const data = [
      { _value: 0 },
      { _value: 10 },
    ];
    const result = summarizeData(data, metricName);
    expect(result.pctChange).toBe(100);
  });
});
