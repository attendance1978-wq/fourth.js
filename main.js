/**
 * main.js - Core 3D Engine Module
 */

import { Camera } from './core/Camera.js';
import { Renderer } from './core/Renderer.js';
import { Mesh } from './core/Mesh.js';
import { CursorOrbitControl } from './CursorOrbitControl.js';

export class GraphicsEngine3D {
    constructor(containerId = 'canvas-container') {
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
        
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        this.container.appendChild(canvas);
        
        this.renderer = new Renderer(canvas);
        this.camera = new Camera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene = { children: [] };
        
        this.controls = new CursorOrbitControl(this.camera, canvas);
        this.controls.setTarget(0, 0, 0);
        
        this.objects = [];
        this.animatedObjects = [];
        this.clock = 0;
        
        this.lights = {
            ambient: { r: 0.4, g: 0.4, b: 0.6 },
            directional: { 
                position: { x: 5, y: 10, z: 7 },
                color: { r: 1, g: 1, b: 1 },
                intensity: 1.2
            }
        };
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.animate();
        
        console.log('GraphicsEngine3D initialized');
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
            const animIndex = this.animatedObjects.indexOf(mesh);
            if (animIndex !== -1) this.animatedObjects.splice(animIndex, 1);
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
        mesh.originalY = mesh.position.y;
        this.addMesh(mesh);
        this.animatedObjects.push(mesh);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.clock += 0.016;
        
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
        
        this.camera.updateViewMatrix();
        this.renderer.render(this.scene, this.camera, this.lights);
    }
    
    clear() {
        this.scene.children = [];
        this.objects = [];
        this.animatedObjects = [];
    }
}
