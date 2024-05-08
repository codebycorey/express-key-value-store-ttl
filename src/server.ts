import express, { Express, Request, Response } from 'express';

import { KVStore } from './kv_store';

const kvStore = new KVStore();

const app: Express = express();

type SetBody = { key: string; value: string; ttlSeconds?: number };
type KeyParams = { key: string };

app.use(express.json());

app.post<{}, {}, SetBody>('/set', (req: Request, res: Response) => {
  const { key, value, ttlSeconds } = req.body;
  kvStore.set(key, value, ttlSeconds);
  res.send(`Key ${key} set to ${value}`);
});

app.get<KeyParams>('/get/:key', (req: Request, res: Response) => {
  const { key } = req.params;
  const value = kvStore.get(key);
  res.send(value);
});

app.delete<KeyParams>('/delete/:key', (req: Request, res: Response) => {
  const { key } = req.params;
  kvStore.delete(key);
  res.send(`Key ${key} deleted`);
});

app.delete('/dropExpired', (_: Request, res: Response) => {
  kvStore.dropExpired();
  res.send(`Removed all expired keys`);
});

export { app };
