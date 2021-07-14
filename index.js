"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uint1Array = exports.BitDataView = void 0;
class BitDataView extends DataView {
    /**
     * Gets the 1-bit value at the specified bit offset from the start of the view.
     * There is no alignment constraint.
     * @param bitOffset The place in the buffer at which the value should be retrieved.
     */
    getUint1(bitOffset) {
        const byteOffset = Math.floor(bitOffset / 8);
        const bitMask = 0x80 >> (bitOffset % 8);
        return (this.getUint8(byteOffset) & bitMask) ? 1 : 0;
    }
    /**
     * Stores a 1-bit value at the specified bit offset from the start of the view.
     * @param bitOffset The place in the buffer at which the value should be set.
     * @param value The value to set.
     */
    setUint1(bitOffset, value) {
        const byteOffset = Math.floor(bitOffset / 8);
        const bitMask = 0x80 >> (bitOffset % 8);
        if (value & 1) {
            this.setUint8(byteOffset, this.getUint8(byteOffset) | bitMask);
        }
        else {
            this.setUint8(byteOffset, this.getUint8(byteOffset) & ~bitMask);
        }
    }
}
exports.BitDataView = BitDataView;
/**
 * A typed array of 1-bit unsigned integer values.
 * The contents are initialized to 0.
 * If the requested number of bytes could not be allocated an exception is raised.
 */
class Uint1Array {
    constructor(source, offset, length) {
        this.BYTES_PER_ELEMENT = 1 / 8;
        if (typeof source !== 'object') {
            source = source !== null && source !== void 0 ? source : 0;
            if (!Number.isInteger(source) || source < 0) {
                throw new RangeError(`Invalid typed array length: ${source}`);
            }
            this.bitOffset = 0;
            this.bitLength = source;
            this.internal = new BitDataView(new ArrayBuffer(Math.ceil(source / 8)));
        }
        else if ('byteLength' in source) {
            offset = offset !== null && offset !== void 0 ? offset : 0;
            length = length !== null && length !== void 0 ? length : source.byteLength * 8 - offset;
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
        }
        else {
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
    static from(items) {
        return 'length' in items ? new Uint1Array(items) : new Uint1Array(items);
    }
    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    static of(...items) {
        return new Uint1Array(items);
    }
    get buffer() {
        return this.internal.buffer;
    }
    get byteOffset() {
        return Math.floor(this.bitOffset / 8);
    }
    get byteLength() {
        return Math.ceil((this.bitOffset + this.bitLength) / 8) - Math.floor(this.bitOffset / 8);
    }
    get length() {
        return this.bitLength;
    }
    subarray(begin, end) {
        begin = begin !== null && begin !== void 0 ? begin : 0;
        begin = begin < 0 ? this.bitLength + begin : begin;
        begin = begin < 0 ? 0 : begin;
        end = end !== null && end !== void 0 ? end : this.bitLength;
        end = end < 0 ? this.bitLength + end : end;
        end = end > this.bitLength ? this.bitLength : end;
        const length = begin > end ? 0 : end - begin;
        return new Uint1Array(this.internal.buffer, this.bitOffset + begin, length);
    }
    slice(start, end) {
        return new Uint1Array(this.subarray(start, end));
    }
    fill(value, start, end) {
        const subarray = this.subarray(start, end);
        for (let i = 0; i < subarray.bitLength; i++) {
            subarray[i] = value;
        }
        return this;
    }
    set(array, offset) {
        offset = offset !== null && offset !== void 0 ? offset : 0;
        if ((offset < 0) || ((offset + array.length) > this.bitLength)) {
            throw new RangeError('offset is out of bounds');
        }
        for (let i = 0; i < array.length; i++) {
            this[i + offset] = array[i];
        }
    }
    copyWithin(target, start, end) {
        const toCopy = this.slice(start, end);
        for (let i = 0; i < toCopy.bitLength; i++) {
            this[target + i] = toCopy[i];
        }
        return this;
    }
    *[Symbol.iterator]() {
        for (let i = 0; i < this.bitLength; i++) {
            yield this[i];
        }
    }
    *keys() {
        for (let i = 0; i < this.bitLength; i++) {
            yield i;
        }
    }
    *values() {
        for (let i = 0; i < this.bitLength; i++) {
            yield this[i];
        }
    }
    *entries() {
        for (let i = 0; i < this.bitLength; i++) {
            yield [i, this[i]];
        }
    }
    // * Array methods
    forEach(callbackFn) {
        for (let i = 0; i < this.bitLength; i++) {
            callbackFn(this[i], i, this);
        }
    }
    every(predicate) {
        for (let i = 0; i < this.bitLength; i++) {
            if (!predicate(this[i], i, this)) {
                return false;
            }
        }
        return true;
    }
    some(predicate) {
        for (let i = 0; i < this.bitLength; i++) {
            if (predicate(this[i], i, this)) {
                return true;
            }
        }
        return false;
    }
    find(predicate) {
        for (let i = 0; i < this.bitLength; i++) {
            if (predicate(this[i], i, this)) {
                return this[i];
            }
        }
        return undefined;
    }
    findIndex(predicate) {
        for (let i = 0; i < this.bitLength; i++) {
            if (predicate(this[i], i, this)) {
                return i;
            }
        }
        return -1;
    }
    includes(searchElement, fromIndex) {
        fromIndex = fromIndex !== null && fromIndex !== void 0 ? fromIndex : 0;
        for (let i = fromIndex; i < this.bitLength; i++) {
            if (this[i] === searchElement) {
                return true;
            }
        }
        return false;
    }
    indexOf(searchElement, fromIndex) {
        fromIndex = fromIndex !== null && fromIndex !== void 0 ? fromIndex : 0;
        for (let i = fromIndex; i < this.bitLength; i++) {
            if (this[i] === searchElement) {
                return i;
            }
        }
        return -1;
    }
    lastIndexOf(searchElement, fromIndex) {
        fromIndex = fromIndex !== null && fromIndex !== void 0 ? fromIndex : this.bitLength - 1;
        for (let i = fromIndex; i >= 0; i--) {
            if (this[i] === searchElement) {
                return i;
            }
        }
        return -1;
    }
    reduce(callbackfn, initialValue) {
        let previousValue = initialValue;
        for (let i = 0; i < this.bitLength; i++) {
            previousValue = callbackfn(previousValue, this[i], i, this);
        }
        return previousValue;
    }
    reduceRight(callbackfn, initialValue) {
        let previousValue = initialValue;
        for (let i = this.bitLength - 1; i >= 0; i--) {
            previousValue = callbackfn(previousValue, this[i], i, this);
        }
        return previousValue;
    }
    filter(predicate) {
        const array = new Uint1Array(this.bitLength);
        let length = 0;
        for (let i = 0; i < this.bitLength; i++) {
            if (predicate(this[i], i, this)) {
                array[length++] = this[i];
            }
        }
        return array.slice(0, length);
    }
    map(callbackFn) {
        const array = new Uint1Array(this.bitLength);
        for (let i = 0; i < this.bitLength; i++) {
            array[i] = callbackFn(this[i], i, this);
        }
        return array;
    }
    sort(compareFn) {
        compareFn = compareFn !== null && compareFn !== void 0 ? compareFn : ((a, b) => a - b);
        this.set([...this].sort(compareFn));
        return this;
    }
    reverse() {
        this.set([...this].reverse());
        return this;
    }
    join(separator) {
        return [...this].join(separator);
    }
    // * Object methods
    toString() {
        return [...this].join(',');
    }
    // * Nodejs methods
    [Symbol.for('nodejs.util.inspect.custom')]() {
        const yellow = '\x1b\x5b33m';
        const reset = '\x1b\x5b0m';
        return `${Uint1Array.name}(${this.bitLength}) ${yellow}${[...this].join('')}${reset}`;
    }
}
exports.Uint1Array = Uint1Array;
