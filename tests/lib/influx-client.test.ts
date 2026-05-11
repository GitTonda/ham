import { influxClient } from '@/lib/influx-client';

// Mock the influxdb-client
jest.mock('@influxdata/influxdb-client', () => {
  return {
    InfluxDB: jest.fn().mockImplementation(() => ({
      getQueryApi: jest.fn().mockReturnValue({
        queryRows: jest.fn().mockImplementation((query, { next, complete }) => {
          if (query.includes('buckets()')) {
            next(['bucket1'], { toObject: (row: any) => ({ name: row[0] }) });
          } else {
            next([100], { toObject: (row: any) => ({ _value: row[0] }) });
          }
          complete();
        }),
      }),
    })),
  };
});

describe('influx-client', () => {
  it('should execute a query and return data', async () => {
    const data = await influxClient.query('test query');
    expect(data).toHaveLength(1);
    expect(data[0]._value).toBe(100);
  });

  it('should return true on ping when healthy', async () => {
    const isHealthy = await influxClient.ping();
    expect(isHealthy).toBe(true);
  });
});
