import { describe, expect, test } from 'vitest';
import { KVMinHeap, MinHeapValue } from '../src/min_heap';

describe('KVMinHeap', () => {
  test('test each function', () => {
    const heap = new KVMinHeap();

    // Test insert
    const value1: MinHeapValue = { key: 'key1', value: new Date(2022, 1, 1) };
    heap.insert(value1);
    expect(heap.peek()).toEqual(value1);

    // Test insert with smaller value
    const value2: MinHeapValue = { key: 'key2', value: new Date(2021, 1, 1) };
    heap.insert(value2);
    expect(heap.peek()).toEqual(value2);

    // Test extractMin
    const min = heap.extractMin();
    expect(min).toEqual(value2);
    expect(heap.peek()).toEqual(value1);

    // Test delete
    heap.delete('key1');
    expect(heap.peek()).toEqual(undefined);
  });

  test('ensure sort with many values', async () => {
    const heap = new KVMinHeap();

    // Insert ten values
    const values: MinHeapValue[] = [
      { key: 'key1', value: new Date(2022, 1, 1) },
      { key: 'key2', value: new Date(2021, 1, 1) },
      { key: 'key3', value: new Date(2023, 1, 1) },
      { key: 'key4', value: new Date(2020, 1, 1) },
      { key: 'key5', value: new Date(2024, 1, 1) },
      { key: 'key6', value: new Date(2019, 1, 1) },
      { key: 'key7', value: new Date(2018, 1, 1) },
      { key: 'key8', value: new Date(2017, 1, 1) },
      { key: 'key9', value: new Date(2016, 1, 1) },
      { key: 'key10', value: new Date(2015, 1, 1) },
    ];
    values.forEach((value) => heap.insert(value));

    // Check that the smallest value is at the top of the heap
    expect(heap.peek()).toEqual(values[9]);

    // Extract the smallest value and check that the next smallest value is at the top
    heap.extractMin();
    expect(heap.peek()).toEqual(values[8]);

    // Delete the current smallest value and check that the next smallest value is at the top
    heap.delete('key9');
    expect(heap.peek()).toEqual(values[7]);
    expect(heap.extractMin()).toEqual(values[7]);

    expect(heap.extractMin()).toEqual(values[6]); // Expect 'key7'
    expect(heap.extractMin()).toEqual(values[5]); // Expect 'key6'
    expect(heap.extractMin()).toEqual(values[3]); // Expect 'key4'
    expect(heap.extractMin()).toEqual(values[1]); // Expect 'key2'
    expect(heap.extractMin()).toEqual(values[0]); // Expect 'key1'
    expect(heap.extractMin()).toEqual(values[2]); // Expect 'key3'
    expect(heap.extractMin()).toEqual(values[4]); // Expect 'key5'
    expect(heap.extractMin()).toEqual(undefined); // Expect 'key5'
  });
});
