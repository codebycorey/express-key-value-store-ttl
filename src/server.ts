import express, { Express, Request, Response } from 'express';

import { KVStore } from './kv_store';

type SetBody = { key: string; value: string; ttlSeconds?: number };
type KeyParams = { key: string };

export class Server {
  public get app(): Express {
    return this._app;
  }

  private _app: Express;
  private _kvStore: KVStore;

  constructor(kvStore: KVStore) {
    this._app = express();
    this._app.use(express.json());
    this._kvStore = kvStore;

    this.setRoutes();
  }

  public start(port: number) {
    this._app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }

  private setRoutes() {
    this._app.post<{}, {}, SetBody>('/set', (req: Request, res: Response) => {
      const { key, value, ttlSeconds } = req.body;
      this._kvStore.set(key, value, ttlSeconds);
      res.send(`Key ${key} set to ${value}`);
    });

    this._app.get<KeyParams>('/get/:key', (req: Request, res: Response) => {
      const { key } = req.params;
      const value = this._kvStore.get(key);
      res.send(value);
    });

    this._app.delete<KeyParams>(
      '/delete/:key',
      (req: Request, res: Response) => {
        const { key } = req.params;
        this._kvStore.delete(key);
        res.send(`Key ${key} deleted`);
      }
    );

    this._app.delete('/dropExpired', (_: Request, res: Response) => {
      this._kvStore.dropExpired();
      res.send(`Removed all expired keys`);
    });
  }
}
