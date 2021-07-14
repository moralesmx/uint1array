export declare class BitDataView extends DataView {
    /**
     * Gets the 1-bit value at the specified bit offset from the start of the view.
     * There is no alignment constraint.
     * @param bitOffset The place in the buffer at which the value should be retrieved.
     */
    getUint1(bitOffset: number): number;
    /**
     * Stores a 1-bit value at the specified bit offset from the start of the view.
     * @param bitOffset The place in the buffer at which the value should be set.
     * @param value The value to set.
     */
    setUint1(bitOffset: number, value: number): void;
}
/**
 * A typed array of 1-bit unsigned integer values.
 * The contents are initialized to 0.
 * If the requested number of bytes could not be allocated an exception is raised.
 */
export declare class Uint1Array implements ArrayBufferView {
    /**
     * Creates an array from an array-like or iterable object.
     * @param items An array-like or iterable object to convert to an array.
     */
    static from(items: ArrayLike<number>): Uint1Array;
    static from(items: Iterable<number>): Uint1Array;
    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    static of(...items: number[]): Uint1Array;
    [index: number]: number;
    readonly BYTES_PER_ELEMENT: number;
    get buffer(): ArrayBuffer;
    get byteOffset(): number;
    get byteLength(): number;
    get length(): number;
    /** The offset in bits of the array. */
    readonly bitOffset: number;
    /** The length in bits of the array. */
    readonly bitLength: number;
    /** BitDataView used to interface with the ArrayBuffer */
    private readonly internal;
    constructor();
    constructor(length: number);
    constructor(array: ArrayLike<number>);
    constructor(elements: Iterable<number>);
    constructor(buffer: ArrayBufferLike, bitOffset?: number, length?: number);
    subarray(begin?: number, end?: number): Uint1Array;
    slice(start?: number, end?: number): Uint1Array;
    fill(value: number, start?: number, end?: number): this;
    set(array: ArrayLike<number>, offset?: number): void;
    copyWithin(target: number, start: number, end?: number): this;
    [Symbol.iterator](): IterableIterator<number>;
    keys(): IterableIterator<number>;
    values(): IterableIterator<number>;
    entries(): IterableIterator<[number, number]>;
    forEach(callbackFn: (value: number, index: number, array: Uint1Array) => void): void;
    every(predicate: (value: number, index: number, array: Uint1Array) => boolean): boolean;
    some(predicate: (value: number, index: number, array: Uint1Array) => boolean): boolean;
    find(predicate: (value: number, index: number, array: Uint1Array) => boolean): number | undefined;
    findIndex(predicate: (value: number, index: number, array: Uint1Array) => boolean): number;
    includes(searchElement: number, fromIndex?: number): boolean;
    indexOf(searchElement: number, fromIndex?: number): number;
    lastIndexOf(searchElement: number, fromIndex?: number): number;
    reduce<T>(callbackfn: (previousValue: T, currentValue: number, currentIndex: number, array: Uint1Array) => T, initialValue: T): T;
    reduceRight<T>(callbackfn: (previousValue: T, currentValue: number, currentIndex: number, array: Uint1Array) => T, initialValue: T): T;
    filter(predicate: (value: number, index: number, array: Uint1Array) => boolean): Uint1Array;
    map(callbackFn: (value: number, index: number, array: Uint1Array) => number): Uint1Array;
    sort(compareFn?: ((a: number, b: number) => number)): this;
    reverse(): this;
    join(separator?: string): string;
    toString(): string;
}
