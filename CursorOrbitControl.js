/**
 * CursorOrbitControl.js - Mouse/Touch Orbit Controls
 */

export class CursorOrbitControl {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement || document.body;
        this.target = { x: 0, y: 0, z: 0 };
        
        this.rotateSpeed = 1.0;
        this.zoomSpeed = 1.0;
        this.panSpeed = 0.8;
        this.enabled = true;
        this.autoRotate = false;
        this.autoRotateSpeed = 1.0;
        
        this.distance = 7;
        this.theta = Math.PI / 4;
        this.phi = Math.PI / 3;
        
        this.panX = 0;
        this.panY = 0;
        this.panZ = 0;
        
        this.mouseState = {
            left: false,
            right: false,
            middle: false,
            x: 0,
            y: 0
        };
        
        this.updateCameraPosition = this.updateCameraPosition.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        
        this.attach();
        this.updateCameraPosition();
    }
    
    attach() {
        this.domElement.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        this.domElement.addEventListener('wheel', this.onWheel);
        this.domElement.addEventListener('contextmenu', this.onContextMenu);
        this.domElement.style.cursor = 'grab';
        this.domElement.style.userSelect = 'none';
    }
    
    detach() {
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        this.domElement.removeEventListener('wheel', this.onWheel);
        this.domElement.removeEventListener('contextmenu', this.onContextMenu);
        this.domElement.style.cursor = 'default';
    }
    
    onContextMenu(event) {
        event.preventDefault();
        return false;
    }
    
    onMouseDown(event) {
        if (!this.enabled) return;
        event.preventDefault();
        
        this.mouseState.x = event.clientX;
        this.mouseState.y = event.clientY;
        
        if (event.button === 0) {
            this.mouseState.left = true;
            this.domElement.style.cursor = 'grabbing';
        } else if (event.button === 1) {
            this.mouseState.middle = true;
            this.domElement.style.cursor = 'row-resize';
        } else if (event.button === 2) {
            this.mouseState.right = true;
            this.domElement.style.cursor = 'grabbing';
        }
    }
    
    onMouseMove(event) {
        if (!this.enabled) return;
        
        const dx = event.clientX - this.mouseState.x;
        const dy = event.clientY - this.mouseState.y;
        
        if (dx === 0 && dy === 0) return;
        
        if (this.mouseState.left) {
            this.theta += dx * 0.008 * this.rotateSpeed;
            this.phi += dy * 0.008 * this.rotateSpeed;
            this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi));
        } else if (this.mouseState.right) {
            const forwardX = Math.sin(this.theta);
            const forwardZ = Math.cos(this.theta);
            const rightX = Math.cos(this.theta);
            const rightZ = -Math.sin(this.theta);
            
            this.panX += (dx * 0.008 * this.panSpeed) * rightX;
            this.panZ += (dx * 0.008 * this.panSpeed) * rightZ;
            this.panY += dy * 0.008 * this.panSpeed;
        } else if (this.mouseState.middle) {
            this.distance += dy * 0.05 * this.zoomSpeed;
            this.distance = Math.max(1.5, Math.min(25, this.distance));
        }
        
        this.mouseState.x = event.clientX;
        this.mouseState.y = event.clientY;
        
        this.updateCameraPosition();
    }
    
    onMouseUp(event) {
        this.mouseState.left = false;
        this.mouseState.right = false;
        this.mouseState.middle = false;
        this.domElement.style.cursor = 'grab';
    }
    
    onWheel(event) {
        if (!this.enabled) return;
        event.preventDefault();
        this.distance += event.deltaY * 0.01 * this.zoomSpeed;
        this.distance = Math.max(1.5, Math.min(25, this.distance));
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        const x = this.distance * Math.sin(this.phi) * Math.cos(this.theta);
        const y = this.distance * Math.cos(this.phi);
        const z = this.distance * Math.sin(this.phi) * Math.sin(this.theta);
        
        this.camera.position.x = x + this.target.x + this.panX;
        this.camera.position.y = y + this.target.y + this.panY;
        this.camera.position.z = z + this.target.z + this.panZ;
        
        this.camera.target.x = this.target.x + this.panX;
        this.camera.target.y = this.target.y + this.panY;
        this.camera.target.z = this.target.z + this.panZ;
        
        this.camera.updateViewMatrix();
    }
    
    setTarget(x, y, z) {
        this.target = { x, y, z };
        this.updateCameraPosition();
    }
    
    setDistance(distance) {
        this.distance = Math.max(1.5, Math.min(25, distance));
        this.updateCameraPosition();
    }
    
    reset() {
        this.distance = 7;
        this.theta = Math.PI / 4;
        this.phi = Math.PI / 3;
        this.panX = 0;
        this.panY = 0;
        this.panZ = 0;
        this.updateCameraPosition();
    }
}
