/**
 * main.js - Core 3D Engine Module
 * Manages scene, camera, renderer, and animation loop
 */

import { Camera } from './core/Camera.js';
import { Renderer } from './core/Renderer.js';
import { Mesh } from './core/Mesh.js';
import { CursorOrbitControl } from './CursorOrbitControl.js';

export class GraphicsEngine3D {
    constructor(containerId = 'canvas-container') {
        // Create container if not exists
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.zIndex = '0';
            document.body.appendChild(container);
        }
        this.container = container;
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        this.container.appendChild(canvas);
        
        // Initialize core components
        this.renderer = new Renderer(canvas);
        this.camera = new Camera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene = { 
            children: [],
            background: '#050b1a'
        };
        
        // Setup orbit controls
        this.controls = new CursorOrbitControl(this.camera, canvas);
        this.controls.setTarget(0, 0, 0);
        this.controls.setDistance(8);
        
        // Track objects
        this.objects = [];
        this.animatedObjects = [];
        this.clock = 0;
        
        // Setup lighting (for full WebGL implementation)
        this.setupLighting();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
        this.resize();
        
        // Start animation loop
        this.animate();
        
        console.log('GraphicsEngine3D initialized');
    }
    
    setupLighting() {
        // Lighting data for shader-based renderer
        this.lights = {
            ambient: { r: 0.4, g: 0.4, b: 0.6 },
            directional: { 
                position: { x: 5, y: 10, z: 7 },
                color: { r: 1, g: 1, b: 1 },
                intensity: 1.2
            }
        };
    }
    
    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setSize(width, height);
        this.camera.resize(width, height);
    }
    
    addMesh(mesh) {
        this.scene.children.push(mesh);
        this.objects.push(mesh);
        return mesh;
    }
    
    removeMesh(mesh) {
        const index = this.scene.children.indexOf(mesh);
        if (index !== -1) {
            this.scene.children.splice(index, 1);
            const objIndex = this.objects.indexOf(mesh);
            if (objIndex !== -1) this.objects.splice(objIndex, 1);
        }
    }
    
    addAnimated(mesh, options = {}) {
        mesh.userData = { 
            rotateY: options.rotateY !== false,
            rotateX: options.rotateX || false,
            speed: options.speed || 1,
            bob: options.bob || false,
            bobHeight: options.bobHeight || 0.3,
            bobSpeed: options.bobSpeed || 1.5
        };
        this.addMesh(mesh);
        this.animatedObjects.push(mesh);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update animations
        this.clock += 0.016; // Approximate delta time
        
        for (const obj of this.animatedObjects) {
            if (obj.userData.rotateY) {
                obj.rotation.y = this.clock * obj.userData.speed;
            }
            if (obj.userData.rotateX) {
                obj.rotation.x = this.clock * obj.userData.speed * 0.7;
            }
            if (obj.userData.bob) {
                const bobY = Math.sin(this.clock * obj.userData.bobSpeed) * obj.userData.bobHeight;
                obj.position.y = (obj.originalY || 0) + bobY;
            }
            obj.updateMatrix();
        }
        
        // Update camera view
        this.camera.updateViewMatrix();
        
        // Render scene
        this.renderer.render(this.scene, this.camera, this.lights);
    }
    
    // Helper method to clear all objects
    clear() {
        this.scene.children = [];
        this.objects = [];
        this.animatedObjects = [];
    }
    
    // Get object by name
    getObjectByName(name) {
        return this.objects.find(obj => obj.name === name);
    }
}
