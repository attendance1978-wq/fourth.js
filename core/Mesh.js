/**
 * Mesh.js - Base Mesh Class
 * Represents a 3D object with geometry, material, and transformation
 */

import { Vector3 } from './Vector3.js';
import { Matrix4 } from './Matrix4.js';

export class Mesh {
    constructor(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.position = new Vector3(0, 0, 0);
        this.rotation = new Vector3(0, 0, 0);
        this.scale = new Vector3(1, 1, 1);
        this.modelMatrix = new Matrix4();
        this.children = [];
        this.parent = null;
        this.name = '';
        this.userData = {};
        this.visible = true;
        this.castShadow = true;
        this.receiveShadow = false;
        
        // Bounding sphere for culling
        this.boundingSphere = {
            center: new Vector3(0, 0, 0),
            radius: this.computeBoundingRadius()
        };
    }

    computeBoundingRadius() {
        if (!this.geometry || !this.geometry.vertices) return 1;
        
        let maxDist = 0;
        for (let i = 0; i < this.geometry.vertices.length; i += 3) {
            const x = this.geometry.vertices[i];
            const y = this.geometry.vertices[i + 1];
            const z = this.geometry.vertices[i + 2];
            const dist = x * x + y * y + z * z;
            if (dist > maxDist) maxDist = dist;
        }
        return Math.sqrt(maxDist);
    }

    updateMatrix() {
        // Build transformation matrix from position, rotation, scale
        const tx = this.position.x;
        const ty = this.position.y;
        const tz = this.position.z;
        
        const rx = this.rotation.x;
        const ry = this.rotation.y;
        const rz = this.rotation.z;
        
        const sx = this.scale.x;
        const sy = this.scale.y;
        const sz = this.scale.z;
        
        // Rotation matrices
        const cx = Math.cos(rx), sx_rot = Math.sin(rx);
        const cy = Math.cos(ry), sy_rot = Math.sin(ry);
        const cz = Math.cos(rz), sz_rot = Math.sin(rz);
        
        const e = this.modelMatrix.elements;
        
        // Combined rotation matrix (ZYX order)
        e[0] = cy * cz * sx;
        e[1] = cy * sz * sx;
        e[2] = -sy * sx;
        e[3] = 0;
        
        e[4] = (sx_rot * sy * cz - cx * sz) * sy;
        e[5] = (sx_rot * sy * sz + cx * cz) * sy;
        e[6] = sx_rot * cy * sy;
        e[7] = 0;
        
        e[8] = (cx * sy * cz + sx_rot * sz) * sz;
        e[9] = (cx * sy * sz - sx_rot * cz) * sz;
        e[10] = cx * cy * sz;
        e[11] = 0;
        
        // Translation
        e[12] = tx;
        e[13] = ty;
        e[14] = tz;
        e[15] = 1;
        
        // Apply scale
        for (let i = 0; i < 12; i++) {
            if (i % 4 !== 3) {
                e[i] *= (i % 4 === 0) ? sx : (i % 4 === 1) ? sy : sz;
            }
        }
        
        // Update bounding sphere world position
        this.boundingSphere.center.copy(this.position);
        this.boundingSphere.radius = this.computeBoundingRadius() * Math.max(sx, sy, sz);
        
        return this.modelMatrix;
    }

    add(child) {
        this.children.push(child);
        child.parent = this;
    }

    remove(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    traverse(callback) {
        callback(this);
        for (const child of this.children) {
            child.traverse(callback);
        }
    }

    getWorldPosition(target) {
        target.copy(this.position);
        let parent = this.parent;
        while (parent) {
            target.add(parent.position);
            parent = parent.parent;
        }
        return target;
    }

    setRotationFromEuler(x, y, z) {
        this.rotation.set(x, y, z);
        return this;
    }

    translate(x, y, z) {
        this.position.x += x;
        this.position.y += y;
        this.position.z += z;
        return this;
    }

    rotateX(angle) {
        this.rotation.x += angle;
        return this;
    }

    rotateY(angle) {
        this.rotation.y += angle;
        return this;
    }

    rotateZ(angle) {
        this.rotation.z += angle;
        return this;
    }
}
