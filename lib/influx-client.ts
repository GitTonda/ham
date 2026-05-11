import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import { env } from '@/config/env';

/**
 * InfluxDB client service.
 * Handles connections and queries to the time-series database.
 */
class InfluxClient {
  private client: InfluxDB;
  private queryApi: QueryApi;

  constructor() {
    if (!env.influx.url || !env.influx.token || !env.influx.org) {
      throw new Error('Missing InfluxDB configuration in environment variables.');
    }

    this.client = new InfluxDB({
      url: env.influx.url,
      token: env.influx.token,
    });

    this.queryApi = this.client.getQueryApi(env.influx.org);
  }

  /**
   * Executes a Flux query and returns the rows as an array of objects.
   * @param fluxQuery The Flux query string.
   * @returns Promise resolving to an array of data points.
   */
  async query<T = any>(fluxQuery: string): Promise<T[]> {
    const rows: T[] = [];
    
    return new Promise((resolve, reject) => {
      this.queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          rows.push(tableMeta.toObject(row) as T);
        },
        error(err) {
          reject(err);
        },
        complete() {
          resolve(rows);
        },
      });
    });
  }

  /**
   * Pings the InfluxDB instance to check health.
   * @returns Promise resolving to true if healthy.
   */
  async ping(): Promise<boolean> {
    try {
      // InfluxDB JS client doesn't have a direct ping, so we run a trivial query
      await this.query('buckets() |> limit(n: 1)');
      return true;
    } catch (error) {
      console.error('InfluxDB ping failed:', error);
      throw error;
    }
  }
}

export const influxClient = new InfluxClient();
