/**
 * Camera.js - Camera System
 * Handles view and projection matrices for rendering
 */

import { Vector3 } from './Vector3.js';
import { Matrix4 } from './Matrix4.js';

export class Camera {
    constructor(fov = 45, aspect = 1, near = 0.1, far = 1000) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = new Vector3(0, 0, 5);
        this.target = new Vector3(0, 0, 0);
        this.up = new Vector3(0, 1, 0);
        this.projectionMatrix = new Matrix4();
        this.viewMatrix = new Matrix4();
        this.viewProjectionMatrix = new Matrix4();
        
        this.updateProjectionMatrix();
        this.updateViewMatrix();
    }
    
    updateProjectionMatrix() {
        this.projectionMatrix.perspective(this.fov, this.aspect, this.near, this.far);
        this.updateViewProjectionMatrix();
    }
    
    updateViewMatrix() {
        this.viewMatrix.lookAt(this.position, this.target, this.up);
        this.updateViewProjectionMatrix();
    }
    
    updateViewProjectionMatrix() {
        this.viewProjectionMatrix.copy(this.projectionMatrix).multiply(this.viewMatrix);
    }
    
    resize(width, height) {
        this.aspect = width / height;
        this.updateProjectionMatrix();
    }
    
    lookAt(x, y, z) {
        this.target.set(x, y, z);
        this.updateViewMatrix();
    }
    
    getWorldDirection(target) {
        return target.copy(this.position).sub(this.target).normalize();
    }
    
    getRightVector(target) {
        const forward = this.getWorldDirection(new Vector3());
        target.copy(this.up).cross(forward).normalize();
        return target;
    }
    
    getUpVector(target) {
        const forward = this.getWorldDirection(new Vector3());
        const right = this.getRightVector(new Vector3());
        target.copy(forward).cross(right).normalize();
        return target;
    }
    
    moveForward(distance) {
        const direction = this.getWorldDirection(new Vector3());
        this.position.x += direction.x * distance;
        this.position.z += direction.z * distance;
        this.target.x += direction.x * distance;
        this.target.z += direction.z * distance;
        this.updateViewMatrix();
    }
    
    moveRight(distance) {
        const right = this.getRightVector(new Vector3());
        this.position.x += right.x * distance;
        this.position.z += right.z * distance;
        this.target.x += right.x * distance;
        this.target.z += right.z * distance;
        this.updateViewMatrix();
    }
    
    moveUp(distance) {
        this.position.y += distance;
        this.target.y += distance;
        this.updateViewMatrix();
    }
    
    zoom(delta) {
        const direction = this.getWorldDirection(new Vector3());
        const distance = direction.multiplyScalar(delta);
        this.position.add(distance);
        this.updateViewMatrix();
    }
    
    frustumCulling(mesh) {
        // Simple sphere-frustum test
        const sphere = mesh.boundingSphere;
        const center = sphere.center;
        const radius = sphere.radius;
        
        // Transform sphere center to view space
        const viewCenter = center.clone().applyMatrix4(this.viewMatrix);
        
        // Check against frustum planes (simplified)
        const vz = -viewCenter.z;
        if (vz - radius > this.far) return false;
        if (vz + radius < this.near) return false;
        
        const vx = viewCenter.x;
        const aspect = this.aspect;
        const fovRad = this.fov * Math.PI / 180;
        const rightPlane = vz * Math.tan(fovRad / 2) * aspect;
        if (Math.abs(vx) - radius > rightPlane) return false;
        
        const vy = viewCenter.y;
        const topPlane = vz * Math.tan(fovRad / 2);
        if (Math.abs(vy) - radius > topPlane) return false;
        
        return true;
    }
}
