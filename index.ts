export class BitDataView extends DataView {

  /**
   * Gets the 1-bit value at the specified bit offset from the start of the view.
   * @param bitOffset The place in the buffer at which the value should be retrieved.
   */
  public getUint1(bitOffset: number): number {
    const byteOffset = Math.floor(bitOffset / 8);
    const bitMask = 0x80 >> (bitOffset % 8);
    return (this.getUint8(byteOffset) & bitMask) ? 1 : 0;
  }

  /**
   * Stores a 1-bit value at the specified bit offset from the start of the view.
   * @param bitOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   */
  public setUint1(bitOffset: number, value: number): void {
    const byteOffset = Math.floor(bitOffset / 8);
    const bitMask = 0x80 >> (bitOffset % 8);
    if (value & 1) {
      this.setUint8(byteOffset, this.getUint8(byteOffset) | bitMask);
    } else {
      this.setUint8(byteOffset, this.getUint8(byteOffset) & ~bitMask);
    }
  }

}

/**
 * A typed array of 1-bit unsigned integer values.
 * The contents are initialized to 0.
 * If the requested number of bytes could not be allocated an exception is raised.
 */
export class Uint1Array implements ArrayBufferView {

  // TODO Implement mapFn argument
  /**
   * Creates an array from an array-like or iterable object.
   * @param items An array-like or iterable object to convert to an array.
   */
  static from(items: ArrayLike<number>): Uint1Array;
  static from(items: Iterable<number>): Uint1Array;
  static from(items: ArrayLike<number> | Iterable<number>): Uint1Array {
    return 'length' in items ? new Uint1Array(items) : new Uint1Array(items);
  }

  /**
   * Returns a new array from a set of elements.
   * @param items A set of elements to include in the new array object.
   */
  static of(...items: number[]): Uint1Array {
    return new Uint1Array(items);
  }

  [index: number]: number;

  public readonly BYTES_PER_ELEMENT = 1 / 8;

  public get buffer() {
    return this.internal.buffer;
  }

  public get byteOffset() {
    return Math.floor(this.bitOffset / 8);
  }

  public get byteLength() {
    return Math.ceil((this.bitOffset + this.bitLength) / 8) - Math.floor(this.bitOffset / 8);
  }

  public get length() {
    return this.bitLength;
  }

  /** The offset in bits of the array. */
  public readonly bitOffset: number;

  /** The length in bits of the array. */
  public readonly bitLength: number;

  /** BitDataView used to interface with the ArrayBuffer */
  private readonly internal: BitDataView;

  constructor();
  constructor(length: number);
  constructor(array: ArrayLike<number>);
  constructor(elements: Iterable<number>);
  constructor(buffer: ArrayBufferLike, bitOffset?: number, length?: number);
  constructor(
    source?: number | Iterable<number> | ArrayLike<number> | ArrayBufferLike,
    offset?: number,
    length?: number
  ) {
    if (typeof source !== 'object') {
      source = source ?? 0;
      if (!Number.isInteger(source) || source < 0) {
        throw new RangeError(`Invalid typed array length: ${source}`);
      }
      this.bitOffset = 0;
      this.bitLength = source;
      this.internal = new BitDataView(new ArrayBuffer(Math.ceil(source / 8)));

    } else if ('byteLength' in source) {
      offset = offset ?? 0;
      length = length ?? source.byteLength * 8 - offset;
      if (!Number.isInteger(offset) || offset < 0) {
        throw new RangeError(`Invalid typed array offset: ${offset}`);
      }
      if (!Number.isInteger(length) || length < 0) {
        throw new RangeError(`Invalid typed array length: ${length}`);
      }
      if (offset > source.byteLength * 8) {
        throw new RangeError(`Offset ${offset} is outside the bounds of the buffer`);
      }
      if (length + offset > source.byteLength * 8) {
        throw new RangeError(`Length ${length} is outside the bounds of the buffer`);
      }
      this.bitOffset = offset;
      this.bitLength = length;
      this.internal = new BitDataView(source);

    } else {
      source = 'length' in source ? source : [...source];
      this.bitOffset = 0;
      this.bitLength = source.length;
      this.internal = new BitDataView(new ArrayBuffer(Math.ceil(source.length / 8)));
      for (let i = 0; i < source.length; i++) {
        this.internal.setUint1(i, source[i]);
      }
    }

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop === 'string' && !Number.isNaN(+prop)) {
          const index = +prop;
          if (Number.isInteger(index) && index >= 0 && index < this.bitLength) {
            return this.internal.getUint1(index + this.bitOffset);
          }
          return undefined;
        }
        return Reflect.get(target, prop, receiver);
      },
      set: (target, prop, value, receiver) => {
        if (typeof prop === 'string' && !Number.isNaN(+prop)) {
          const index = +prop;
          if (Number.isInteger(index) && index >= 0 && index < this.bitLength) {
            this.internal.setUint1(index + this.bitOffset, value);
            return true;
          }
          return false;
        }
        return Reflect.set(target, prop, value, receiver);
      },
    });
  }

  public subarray(begin?: number, end?: number): Uint1Array {
    begin = begin ?? 0;
    begin = begin < 0 ? this.bitLength + begin : begin;
    begin = begin < 0 ? 0 : begin;

    end = end ?? this.bitLength;
    end = end < 0 ? this.bitLength + end : end;
    end = end > this.bitLength ? this.bitLength : end;

    const length = begin > end ? 0 : end - begin;

    return new Uint1Array(this.internal.buffer, this.bitOffset + begin, length);
  }

  public slice(start?: number, end?: number): Uint1Array {
    return new Uint1Array(this.subarray(start, end));
  }

  public fill(value: number, start?: number, end?: number): this {
    const subarray = this.subarray(start, end);
    for (let i = 0; i < subarray.bitLength; i++) {
      subarray[i] = value;
    }
    return this;
  }

  public set(array: ArrayLike<number>, offset?: number): void {
    offset = offset ?? 0;
    if ((offset < 0) || ((offset + array.length) > this.bitLength)) {
      throw new RangeError('offset is out of bounds');
    }
    for (let i = 0; i < array.length; i++) {
      this[i + offset] = array[i];
    }
  }

  public copyWithin(target: number, start: number, end?: number): this {
    const toCopy = this.slice(start, end);
    for (let i = 0; i < toCopy.bitLength; i++) {
      this[target + i] = toCopy[i];
    }
    return this;
  }

  public *[Symbol.iterator](): IterableIterator<number> {
    for (let i = 0; i < this.bitLength; i++) {
      yield this[i];
    }
  }

  public *keys(): IterableIterator<number> {
    for (let i = 0; i < this.bitLength; i++) {
      yield i;
    }
  }

  public *values(): IterableIterator<number> {
    for (let i = 0; i < this.bitLength; i++) {
      yield this[i];
    }
  }

  public *entries(): IterableIterator<[number, number]> {
    for (let i = 0; i < this.bitLength; i++) {
      yield [i, this[i]];
    }
  }

  // * Array methods
  public forEach(callbackFn: (value: number, index: number, array: Uint1Array) => void): void {
    for (let i = 0; i < this.bitLength; i++) {
      callbackFn(this[i], i, this);
    }
  }

  public every(predicate: (value: number, index: number, array: Uint1Array) => boolean): boolean {
    for (let i = 0; i < this.bitLength; i++) {
      if (!predicate(this[i], i, this)) {
        return false;
      }
    }
    return true;
  }

  public some(predicate: (value: number, index: number, array: Uint1Array) => boolean): boolean {
    for (let i = 0; i < this.bitLength; i++) {
      if (predicate(this[i], i, this)) {
        return true;
      }
    }
    return false;
  }

  public find(predicate: (value: number, index: number, array: Uint1Array) => boolean): number | undefined {
    for (let i = 0; i < this.bitLength; i++) {
      if (predicate(this[i], i, this)) {
        return this[i];
      }
    }
    return undefined;
  }

  public findIndex(predicate: (value: number, index: number, array: Uint1Array) => boolean): number {
    for (let i = 0; i < this.bitLength; i++) {
      if (predicate(this[i], i, this)) {
        return i;
      }
    }
    return -1;
  }

  public includes(searchElement: number, fromIndex?: number): boolean {
    fromIndex = fromIndex ?? 0;
    for (let i = fromIndex; i < this.bitLength; i++) {
      if (this[i] === searchElement) {
        return true;
      }
    }
    return false;
  }

  public indexOf(searchElement: number, fromIndex?: number): number {
    fromIndex = fromIndex ?? 0;
    for (let i = fromIndex; i < this.bitLength; i++) {
      if (this[i] === searchElement) {
        return i;
      }
    }
    return -1;
  }

  public lastIndexOf(searchElement: number, fromIndex?: number): number {
    fromIndex = fromIndex ?? this.bitLength - 1;
    for (let i = fromIndex; i >= 0; i--) {
      if (this[i] === searchElement) {
        return i;
      }
    }
    return -1;
  }

  public reduce<T>(
    callbackfn: (previousValue: T, currentValue: number, currentIndex: number, array: Uint1Array) => T,
    initialValue: T
  ): T {
    let previousValue = initialValue;
    for (let i = 0; i < this.bitLength; i++) {
      previousValue = callbackfn(previousValue, this[i], i, this);
    }
    return previousValue;
  }

  public reduceRight<T>(
    callbackfn: (previousValue: T, currentValue: number, currentIndex: number, array: Uint1Array) => T,
    initialValue: T
  ): T {
    let previousValue = initialValue;
    for (let i = this.bitLength - 1; i >= 0; i--) {
      previousValue = callbackfn(previousValue, this[i], i, this);
    }
    return previousValue;
  }

  public filter(predicate: (value: number, index: number, array: Uint1Array) => boolean): Uint1Array {
    const array = new Uint1Array(this.bitLength);
    let length = 0;
    for (let i = 0; i < this.bitLength; i++) {
      if (predicate(this[i], i, this)) {
        array[length++] = this[i];
      }
    }
    return array.slice(0, length);
  }

  public map(callbackFn: (value: number, index: number, array: Uint1Array) => number): Uint1Array {
    const array = new Uint1Array(this.bitLength);
    for (let i = 0; i < this.bitLength; i++) {
      array[i] = callbackFn(this[i], i, this);
    }
    return array;
  }

  public sort(compareFn?: ((a: number, b: number) => number)): this {
    compareFn = compareFn ?? ((a, b) => a - b);
    this.set([...this].sort(compareFn));
    return this;
  }

  public reverse(): this {
    this.set([...this].reverse());
    return this;
  }

  public join(separator?: string): string {
    return [...this].join(separator);
  }

  // * Object methods
  public toString(): string {
    return [...this].join(',');
  }

  // * Nodejs methods
  public [Symbol.for('nodejs.util.inspect.custom')]() {
    const yellow = '\x1b\x5b33m';
    const reset = '\x1b\x5b0m';
    return `${Uint1Array.name}(${this.bitLength}) ${yellow}${[...this].join('')}${reset}`;
  }

}
