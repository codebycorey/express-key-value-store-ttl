# In-Memory Key-Value Store with TTL

Express based HTTP service that is an in-memory key-value store that supports TTLs on the keys

## API Routes
This application provides a simple key-value store API with the following routes:

### POST /set
This route sets a key to a value. It accepts a JSON body with the following properties:

- `key` (string): The key to set.
- `value` (string): The value to set the key to.
- `ttlSeconds` (number, optional): The time-to-live (TTL) of the key in seconds. If provided, the key will automatically be removed after this duration.
Example request:

```
POST /set
Content-Type: application/json

{
  "key": "myKey",
  "value": "myValue",
  "ttlSeconds": 3600
}
```


## GET /get/:key

This route gets the value of a key. The key to get is specified as a URL parameter.

Example request:

```
GET /get/myKey
```

## DELETE /delete/:key

This route deletes a key. The key to delete is specified as a URL parameter.

Example request:

```
DELETE /delete/myKey
```

## DELETE /dropExpired

This route removes all keys that have expired.

Example request:

```
DELETE /dropExpired
```

All routes respond with a string message indicating the result of the operation.

## Design decisions

When designing my key value store, I wanted to make see lookup was efficient and I chose to store it using a `Map`. I also wanted to make sure we could efficiently remove any expired keys in the store. I went with a `MinHeap` to sort expirations.

### Map for Key-Value Store

- **Fast Access**: `Map` allows for O(1) time complexity for get, set, and delete operations 

### MinHeap for Expiration

A MinHeap was used to keep track of key expirations. The key with the earliest expiration time sits at the root of the MinHeap. 

- **Efficient Minimum Lookup**: the minimum key-value with with the earliest expiration is always at the root of the heap. This allows for constant time O(1) lookup of the next key to expire.
- **Efficient Removal**: When a key expires, it can be removed from the root of the MinHeap and the heap can be restructured in O(log n) time. This is more efficient than other data structures like arrays or linked lists, where removal can take O(n) time.
- **Efficient Insertion**: Inserting a new key into the MinHeap takes O(log n) time

These design decisions provide a balance between efficient access (through the `Map`) and efficient expiration handling (through the `MinHeap`), making the system robust and performant.
