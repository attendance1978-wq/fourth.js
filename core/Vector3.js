/**
 * Vector3.js - 3D Vector Mathematics
 * Handles vector operations for positions, directions, and normals
 */

export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    setX(x) {
        this.x = x;
        return this;
    }

    setY(y) {
        this.y = y;
        return this;
    }

    setZ(z) {
        this.z = z;
        return this;
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    addScalar(s) {
        this.x += s;
        this.y += s;
        this.z += s;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    subScalar(s) {
        this.x -= s;
        this.y -= s;
        this.z -= s;
        return this;
    }

    multiply(v) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
    }

    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    divide(v) {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;
        return this;
    }

    divideScalar(s) {
        if (s !== 0) {
            this.x /= s;
            this.y /= s;
            this.z /= s;
        }
        return this;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize() {
        const len = this.length();
        if (len > 0) {
            this.multiplyScalar(1 / len);
        }
        return this;
    }

    normalized() {
        return this.clone().normalize();
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    crossVectors(a, b) {
        const x = a.y * b.z - a.z * b.y;
        const y = a.z * b.x - a.x * b.z;
        const z = a.x * b.y - a.y * b.x;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    distanceToSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    angleTo(v) {
        const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
        if (denominator === 0) return 0;
        const theta = this.dot(v) / denominator;
        return Math.acos(Math.max(-1, Math.min(1, theta)));
    }

    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;
        return this;
    }

    equals(v) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    applyMatrix4(m) {
        const e = m.elements;
        const x = this.x, y = this.y, z = this.z;
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
        return this;
    }

    toArray() {
        return [this.x, this.y, this.z];
    }

    fromArray(array, offset = 0) {
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        return this;
    }

    static add(a, b) {
        return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    static sub(a, b) {
        return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    static cross(a, b) {
        return new Vector3(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    static distance(a, b) {
        return a.distanceTo(b);
    }

    static lerp(a, b, t) {
        return new Vector3(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t,
            a.z + (b.z - a.z) * t
        );
    }
}
