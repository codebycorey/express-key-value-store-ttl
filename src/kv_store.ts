import { KVMinHeap } from './min_heap';

type StoreValue = {
  value: string | number;
  ttlSeconds?: number;
  expiresAt?: Date;
};

export type KVStoreConfig = {
  dropExpiredInterval?: number;
};

export class KVStore {
  private store: Map<string, StoreValue> = new Map<string, StoreValue>();
  private expiresMinHeap: KVMinHeap = new KVMinHeap();

  constructor({ dropExpiredInterval }: KVStoreConfig = {}) {
    if (!dropExpiredInterval) {
      // drop expired keys every dropExpiredInterval
      setInterval(() => {
        this.dropExpired();
      }, dropExpiredInterval);
    }
  }

  /**
   * Set key value pair in store
   * @param key string
   * @param value string | number
   * @param ttlSeconds number | undefined
   * @returns void
   */
  public set(key: string, value: string | number, ttlSeconds?: number): void {
    const storeValue: StoreValue = { value, ttlSeconds };
    if (ttlSeconds) {
      storeValue.expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    }
    this.store.set(key, storeValue);
    if (storeValue.expiresAt) {
      this.expiresMinHeap.insert({ key, value: storeValue.expiresAt });
    }
  }

  /**
   * Get value from storeValue if key exists and not expired
   * @param key string
   * @returns string | number | undefined
   */
  public get(key: string): string | number | undefined {
    const storeValue = this.store.get(key);

    if (!storeValue) {
      return;
    }

    if (storeValue.expiresAt && storeValue.expiresAt < new Date()) {
      this.delete(key);
      return;
    }

    return storeValue.value;
  }

  public delete(key: string): void {
    this.store.delete(key);
    this.expiresMinHeap.delete(key);
  }

  /**
   * Drop all expired keys
   * backup plan in case the setTimeout fails, service restarts
   */
  public dropExpired(): void {
    const peek = this.expiresMinHeap.peek();

    if (!peek) {
      return;
    }

    if (peek.value > new Date()) {
      return;
    }

    const key = this.expiresMinHeap.extractMin()!.key;
    this.store.delete(key);

    // using recursion instead of while loop to avoid blocking the event loop
    this.dropExpired();
  }
}
