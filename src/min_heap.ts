export type MinHeapValue = { key: string; value: Date };

export class KVMinHeap {
  private heap: MinHeapValue[] = [];
  private keyToIndex: Map<string, number> = new Map<string, number>();

  public peek(): MinHeapValue | undefined {
    return this.heap[0];
  }

  public insert(value: MinHeapValue): void {
    this.heap.push(value);
    this.keyToIndex.set(value.key, this.heap.length - 1);
    this.heapifyUp(this.heap.length - 1);
  }

  public extractMin(): MinHeapValue | undefined {
    if (this.heap.length === 0) {
      return;
    }

    const min = this.heap[0];
    this.keyToIndex.delete(min.key);

    if (this.heap.length > 1) {
      this.heap[0] = this.heap.pop() as MinHeapValue;
      this.keyToIndex.set(this.heap[0].key, 0);
      this.heapifyDown(0);
    } else {
      this.heap = [];
      this.keyToIndex = new Map<string, number>();
    }

    return min;
  }

  public delete(key: string): void {
    const index = this.keyToIndex.get(key);

    if (index === undefined) {
      return;
    }

    this.keyToIndex.delete(key);

    if (index !== this.heap.length - 1) {
      this.heap[index] = this.heap.pop() as MinHeapValue;
      this.keyToIndex.set(this.heap[index].key, index);
      this.heapifyDown(index);
      this.heapifyUp(index);
    } else {
      this.heap.pop();
    }
  }

  private heapifyUp(index: number): void {
    if (index === 0) {
      return;
    }

    const parentIndex = this.parent(index);
    const parentValue = this.heap[parentIndex]?.value;
    const value = this.heap[index].value;

    if (value < parentValue) {
      this.swap(index, parentIndex);
      this.heapifyUp(parentIndex);
    }
  }

  private heapifyDown(index: number): void {
    const leftChildIndex = this.leftChild(index);
    const rightChildIndex = this.rightChild(index);

    // Find the index of the smallest child
    let smallestChildIndex = index;
    if (
      leftChildIndex < this.heap.length &&
      this.heap[leftChildIndex].value < this.heap[smallestChildIndex].value
    ) {
      smallestChildIndex = leftChildIndex;
    }
    if (
      rightChildIndex < this.heap.length &&
      this.heap[rightChildIndex].value < this.heap[smallestChildIndex].value
    ) {
      smallestChildIndex = rightChildIndex;
    }

    // If the smallest child is smaller than the current node, swap them and continue heapifying down
    if (smallestChildIndex !== index) {
      this.swap(index, smallestChildIndex);
      this.heapifyDown(smallestChildIndex);
    }
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  private rightChild(index: number): number {
    return 2 * index + 2;
  }

  private swap(index1: number, index2: number): void {
    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;

    this.keyToIndex.set(this.heap[index1].key, index1);
    this.keyToIndex.set(this.heap[index2].key, index2);
  }
}
