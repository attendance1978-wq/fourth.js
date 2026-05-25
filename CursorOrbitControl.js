/**
 * CursorOrbitControl.js - Mouse/Touch Orbit Controls with Cursor Feedback
 * Provides intuitive camera control: rotate, pan, zoom
 */

export class CursorOrbitControl {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement || document.body;
        this.target = { x: 0, y: 0, z: 0 };
        
        // Control parameters
        this.rotateSpeed = 1.0;
        this.zoomSpeed = 1.0;
        this.panSpeed = 0.8;
        this.enabled = true;
        this.autoRotate = false;
        this.autoRotateSpeed = 1.0;
        
        // Spherical coordinates
        this.distance = 5;
        this.theta = Math.PI / 4;      // horizontal angle
        this.phi = Math.PI / 3;         // vertical angle
        
        // Pan offset
        this.panX = 0;
        this.panY = 0;
        this.panZ = 0;
        
        // Mouse state
        this.mouseState = {
            left: false,
            right: false,
            middle: false,
            x: 0,
            y: 0
        };
        
        // Bind methods
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
        
        switch (event.button) {
            case 0:
                this.mouseState.left = true;
                this.domElement.style.cursor = 'grabbing';
                break;
            case 1:
                this.mouseState.middle = true;
                this.domElement.style.cursor = 'row-resize';
                break;
            case 2:
                this.mouseState.right = true;
                this.domElement.style.cursor = 'grabbing';
                break;
        }
    }
    
    onMouseMove(event) {
        if (!this.enabled) return;
        
        const dx = event.clientX - this.mouseState.x;
        const dy = event.clientY - this.mouseState.y;
        
        if (dx === 0 && dy === 0) return;
        
        if (this.mouseState.left) {
            // Rotate camera around target
            this.theta += dx * 0.008 * this.rotateSpeed;
            this.phi += dy * 0.008 * this.rotateSpeed;
            
            // Clamp phi to prevent flipping over the poles
            this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi));
        } else if (this.mouseState.right) {
            // Pan camera
            const forwardX = Math.sin(this.theta);
            const forwardZ = Math.cos(this.theta);
            const rightX = Math.cos(this.theta);
            const rightZ = -Math.sin(this.theta);
            
            this.panX += (dx * 0.008 * this.panSpeed) * rightX;
            this.panZ += (dx * 0.008 * this.panSpeed) * rightZ;
            this.panY += dy * 0.008 * this.panSpeed;
        } else if (this.mouseState.middle) {
            // Zoom
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
        // Calculate camera position in spherical coordinates
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
    
    setRotation(theta, phi) {
        this.theta = theta;
        this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
        this.updateCameraPosition();
    }
    
    reset() {
        this.distance = 6;
        this.theta = Math.PI / 4;
        this.phi = Math.PI / 3;
        this.panX = 0;
        this.panY = 0;
        this.panZ = 0;
        this.updateCameraPosition();
    }
    
    updateAutoRotate(deltaTime) {
        if (this.autoRotate && this.enabled) {
            this.theta += deltaTime * this.autoRotateSpeed;
            this.updateCameraPosition();
        }
    }
}
