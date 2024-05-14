import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Express } from 'express';
import request from 'supertest';
import { Server } from '../src/server';
import { KVStore } from '../src/kv_store';

describe('Express app', () => {
  let app: Express;
  beforeEach(() => {
    app = new Server({ kvStore: new KVStore() }).app;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('set route', async () => {
    const response = await request(app)
      .post('/set')
      .send({ key: 'key1', value: 'value1' })
      .expect(200);

    expect(response.text).toEqual('Key key1 set to value1');
  });

  test('get route', async () => {
    await request(app).post('/set').send({ key: 'key1', value: 'value1' });

    const response = await request(app).get('/get/key1').expect(200);

    expect(response.text).toEqual('value1');
  });

  test('get route after expired', async () => {
    await request(app).post('/set').send({ key: 'key1', value: 'value1' });
    await request(app)
      .post('/set')
      .send({ key: 'key2', value: 'value2', ttlSeconds: 1 });

    vi.advanceTimersByTime(1100);

    const response = await request(app).get('/get/key1').expect(200);
    expect(response.text).toEqual('value1');

    const expiredResponse = await request(app).get('/get/key2').expect(404);
    expect(expiredResponse.text).toEqual('');
  });

  test('delete route', async () => {
    await request(app).post('/set').send({ key: 'key1', value: 'value1' });

    const response = await request(app).delete('/delete/key1').expect(200);

    expect(response.text).toEqual('Key key1 deleted');

    const getResponse = await request(app).get('/get/key1').expect(404);
    expect(getResponse.text).toEqual('');
  });

  test('dropExpired route', async () => {
    // Set two keys, one with a TTL and one without
    await request(app)
      .post('/set')
      .send({ key: 'key1', value: 'value1', ttlSeconds: 1 }); // 1 second ttl

    await request(app).post('/set').send({ key: 'key2', value: 'value2' }); // no ttl

    vi.advanceTimersByTime(1100);

    // Drop expired keys
    const response = await request(app).delete('/dropExpired').expect(200);

    expect(response.text).toEqual('Removed all expired keys');

    // Check that the first key has been removed and the second key is still there
    // expect 404 error
    const getResponse1 = await request(app).get('/get/key1').expect(404);
    expect(getResponse1.text).toEqual('');

    const getResponse2 = await request(app).get('/get/key2').expect(200);

    expect(getResponse2.text).toEqual('value2');
  });
});
