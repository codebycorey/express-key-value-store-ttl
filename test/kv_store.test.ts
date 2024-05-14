import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { KVStore } from '../src/kv_store';

describe('KVStore', () => {
  let kvStore: KVStore;

  beforeEach(() => {
    vi.useFakeTimers();
    kvStore = new KVStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('set and get values', () => {
    kvStore.set('key1', 'value1');
    expect(kvStore.get('key1')).toEqual('value1');
  });

  test('delete values', () => {
    kvStore.set('key1', 'value1');
    kvStore.delete('key1');
    expect(kvStore.get('key1')).toBeUndefined();
  });

  test('values expire after ttl', async () => {
    kvStore.set('key1', 'value1', 1); // 1 second ttl
    vi.advanceTimersByTime(1100);
    expect(kvStore.get('key1')).toBeUndefined();
  });

  test('trimExpiredKeys removes expired keys', async () => {
    kvStore.set('key1', 'value1', 1); // 1 second ttl
    kvStore.set('key2', 'value2', 2); // 2 seconds ttl
    vi.advanceTimersByTime(1100);
    kvStore.dropExpired();
    expect(kvStore.get('key1')).toBeUndefined();
    expect(kvStore.get('key2')).toEqual('value2');
  });

  test('trimExpiredKeys removes expired keys every dropExpiredInterval', async () => {
    kvStore = new KVStore({ dropExpiredInterval: 1000 });
    kvStore.set('key1', 'value1', 1); // 1 second ttl
    kvStore.set('key2', 'value2', 2); // 2 seconds ttl
    vi.advanceTimersByTime(1100);
    vi.advanceTimersByTime(1100);
    expect(kvStore.get('key1')).toBeUndefined();
    expect(kvStore.get('key2')).toBeUndefined();
  });
});
