/**
 * Matrix4.js - 4x4 Matrix for 3D Transformations
 * Handles model, view, and projection matrices
 */

export class Matrix4 {
    constructor() {
        this.elements = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        const e = this.elements;
        e[0] = n11; e[1] = n12; e[2] = n13; e[3] = n14;
        e[4] = n21; e[5] = n22; e[6] = n23; e[7] = n24;
        e[8] = n31; e[9] = n32; e[10] = n33; e[11] = n34;
        e[12] = n41; e[13] = n42; e[14] = n43; e[15] = n44;
        return this;
    }

    identity() {
        this.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        return this;
    }

    clone() {
        return new Matrix4().fromArray(this.elements);
    }

    copy(m) {
        const e = this.elements;
        const me = m.elements;
        for (let i = 0; i < 16; i++) {
            e[i] = me[i];
        }
        return this;
    }

    multiply(m) {
        return this.multiplyMatrices(this, m);
    }

    multiplyMatrices(a, b) {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a11 = ae[0], a12 = ae[1], a13 = ae[2], a14 = ae[3];
        const a21 = ae[4], a22 = ae[5], a23 = ae[6], a24 = ae[7];
        const a31 = ae[8], a32 = ae[9], a33 = ae[10], a34 = ae[11];
        const a41 = ae[12], a42 = ae[13], a43 = ae[14], a44 = ae[15];

        const b11 = be[0], b12 = be[1], b13 = be[2], b14 = be[3];
        const b21 = be[4], b22 = be[5], b23 = be[6], b24 = be[7];
        const b31 = be[8], b32 = be[9], b33 = be[10], b34 = be[11];
        const b41 = be[12], b42 = be[13], b43 = be[14], b44 = be[15];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[1] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[2] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[3] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[4] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[6] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[7] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[8] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[9] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[11] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[12] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[13] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[14] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return this;
    }

    multiplyScalar(s) {
        const e = this.elements;
        for (let i = 0; i < 16; i++) {
            e[i] *= s;
        }
        return this;
    }

    determinant() {
        const e = this.elements;
        const a11 = e[0], a12 = e[1], a13 = e[2], a14 = e[3];
        const a21 = e[4], a22 = e[5], a23 = e[6], a24 = e[7];
        const a31 = e[8], a32 = e[9], a33 = e[10], a34 = e[11];
        const a41 = e[12], a42 = e[13], a43 = e[14], a44 = e[15];

        return (
            a11 * (a22 * (a33 * a44 - a34 * a43) - a23 * (a32 * a44 - a34 * a42) + a24 * (a32 * a43 - a33 * a42)) -
            a12 * (a21 * (a33 * a44 - a34 * a43) - a23 * (a31 * a44 - a34 * a41) + a24 * (a31 * a43 - a33 * a41)) +
            a13 * (a21 * (a32 * a44 - a34 * a42) - a22 * (a31 * a44 - a34 * a41) + a24 * (a31 * a42 - a32 * a41)) -
            a14 * (a21 * (a32 * a43 - a33 * a42) - a22 * (a31 * a43 - a33 * a41) + a23 * (a31 * a42 - a32 * a41))
        );
    }

    transpose() {
        const e = this.elements;
        let temp;
        temp = e[1]; e[1] = e[4]; e[4] = temp;
        temp = e[2]; e[2] = e[8]; e[8] = temp;
        temp = e[3]; e[3] = e[12]; e[12] = temp;
        temp = e[6]; e[6] = e[9]; e[9] = temp;
        temp = e[7]; e[7] = e[13]; e[13] = temp;
        temp = e[11]; e[11] = e[14]; e[14] = temp;
        return this;
    }

    setPosition(x, y, z) {
        const e = this.elements;
        e[12] = x;
        e[13] = y;
        e[14] = z;
        return this;
    }

    getPosition(target) {
        const e = this.elements;
        target.set(e[12], e[13], e[14]);
        return target;
    }

    makeTranslation(x, y, z) {
        this.set(
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        );
        return this;
    }

    makeScale(x, y, z) {
        this.set(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        );
        return this;
    }

    makeRotationX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.set(
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        );
        return this;
    }

    makeRotationY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.set(
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        );
        return this;
    }

    makeRotationZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.set(
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        return this;
    }

    perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov * Math.PI / 360);
        const rangeInv = 1.0 / (near - far);
        
        this.set(
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * rangeInv, -1,
            0, 0, 2 * far * near * rangeInv, 0
        );
        return this;
    }

    ortho(left, right, top, bottom, near, far) {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);
        
        this.set(
            -2 * lr, 0, 0, (left + right) * lr,
            0, -2 * bt, 0, (top + bottom) * bt,
            0, 0, 2 * nf, (far + near) * nf,
            0, 0, 0, 1
        );
        return this;
    }

    lookAt(eye, target, up) {
        const z = eye.clone().sub(target).normalize();
        const x = up.clone().cross(z).normalize();
        const y = z.clone().cross(x);
        
        this.set(
            x.x, y.x, z.x, 0,
            x.y, y.y, z.y, 0,
            x.z, y.z, z.z, 0,
            -x.dot(eye), -y.dot(eye), -z.dot(eye), 1
        );
        return this;
    }

    compose(position, quaternion, scale) {
        // Simplified composition - for full implementation, use quaternion
        this.makeTranslation(position.x, position.y, position.z);
        return this;
    }

    fromArray(array, offset = 0) {
        for (let i = 0; i < 16; i++) {
            this.elements[i] = array[offset + i];
        }
        return this;
    }

    toArray() {
        return this.elements.slice();
    }
}
