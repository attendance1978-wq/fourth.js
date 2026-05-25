
/**
 * fourth.js - Geometry Primitives and Mesh Factory
 * Provides basic 3D shapes and mesh creation utilities
 */

import { Mesh } from './core/Mesh.js';

// ============================================
// Geometry Classes
// ============================================

export class BoxGeometry {
    constructor(width = 1, height = 1, depth = 1) {
        this.type = 'box';
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.uvs = [];
        
        const w = width / 2;
        const h = height / 2;
        const d = depth / 2;
        
        // 8 vertices of the box
        const corners = [
            { x: -w, y: -h, z: -d }, // 0
            { x:  w, y: -h, z: -d }, // 1
            { x:  w, y: -h, z:  d }, // 2
            { x: -w, y: -h, z:  d }, // 3
            { x: -w, y:  h, z: -d }, // 4
            { x:  w, y:  h, z: -d }, // 5
            { x:  w, y:  h, z:  d }, // 6
            { x: -w, y:  h, z:  d }  // 7
        ];
        
        // Face definitions: indices and normals
        const faces = [
            { indices: [0, 1, 2, 0, 2, 3], normal: { x: 0, y: -1, z: 0 } }, // bottom
            { indices: [4, 7, 6, 4, 6, 5], normal: { x: 0, y: 1, z: 0 } },  // top
            { indices: [0, 3, 7, 0, 7, 4], normal: { x: -1, y: 0, z: 0 } }, // left
            { indices: [1, 5, 6, 1, 6, 2], normal: { x: 1, y: 0, z: 0 } },  // right
            { indices: [0, 4, 5, 0, 5, 1], normal: { x: 0, y: 0, z: -1 } }, // front
            { indices: [3, 2, 6, 3, 6, 7], normal: { x: 0, y: 0, z: 1 } }   // back
        ];
        
        for (const face of faces) {
            for (const idx of face.indices) {
                const v = corners[idx];
                this.vertices.push(v.x, v.y, v.z);
                this.normals.push(face.normal.x, face.normal.y, face.normal.z);
                this.indices.push(this.indices.length);
                // Simple UV mapping
                this.uvs.push(0, 0);
            }
        }
    }
}

export class SphereGeometry {
    constructor(radius = 1, segments = 24) {
        this.type = 'sphere';
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.uvs = [];
        
        const stacks = Math.max(2, segments);
        const slices = Math.max(3, segments);
        
        for (let i = 0; i <= stacks; i++) {
            const v = i / stacks;
            const phi = v * Math.PI;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            
            for (let j = 0; j <= slices; j++) {
                const u = j / slices;
                const theta = u * Math.PI * 2;
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);
                
                const x = radius * sinPhi * cosTheta;
                const y = radius * cosPhi;
                const z = radius * sinPhi * sinTheta;
                
                this.vertices.push(x, y, z);
                this.normals.push(x / radius, y / radius, z / radius);
                this.uvs.push(u, v);
            }
        }
        
        for (let i = 0; i < stacks; i++) {
            for (let j = 0; j < slices; j++) {
                const a = i * (slices + 1) + j;
                const b = i * (slices + 1) + j + 1;
                const c = (i + 1) * (slices + 1) + j;
                const d = (i + 1) * (slices + 1) + j + 1;
                
                this.indices.push(a, b, c);
                this.indices.push(b, d, c);
            }
        }
    }
}

export class CylinderGeometry {
    constructor(radiusTop = 1, radiusBottom = 1, height = 1, segments = 24) {
        this.type = 'cylinder';
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.uvs = [];
        
        const halfHeight = height / 2;
        const radialSegments = Math.max(3, segments);
        
        // Generate vertices for top and bottom circles
        for (let i = 0; i <= radialSegments; i++) {
            const theta = (i / radialSegments) * Math.PI * 2;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            // Bottom vertex
            const bx = radiusBottom * cosTheta;
            const bz = radiusBottom * sinTheta;
            this.vertices.push(bx, -halfHeight, bz);
            this.normals.push(0, -1, 0);
            this.uvs.push(i / radialSegments, 1);
            
            // Top vertex
            const tx = radiusTop * cosTheta;
            const tz = radiusTop * sinTheta;
            this.vertices.push(tx, halfHeight, tz);
            this.normals.push(0, 1, 0);
            this.uvs.push(i / radialSegments, 0);
        }
        
        // Generate indices for faces
        for (let i = 0; i < radialSegments; i++) {
            const bottomBase = i * 2;
            const topBase = i * 2 + 1;
            const nextBottomBase = ((i + 1) % radialSegments) * 2;
            const nextTopBase = ((i + 1) % radialSegments) * 2 + 1;
            
            // Side face (two triangles)
            this.indices.push(bottomBase, nextBottomBase, topBase);
            this.indices.push(topBase, nextBottomBase, nextTopBase);
        }
        
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
    }
}

export class PlaneGeometry {
    constructor(width = 1, height = 1, segments = 1) {
        this.type = 'plane';
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.uvs = [];
        
        const w = width / 2;
        const h = height / 2;
        const stepX = width / segments;
        const stepZ = height / segments;
        
        for (let i = 0; i <= segments; i++) {
            const z = -h + i * stepZ;
            const v = i / segments;
            
            for (let j = 0; j <= segments; j++) {
                const x = -w + j * stepX;
                const u = j / segments;
                
                this.vertices.push(x, 0, z);
                this.normals.push(0, 1, 0);
                this.uvs.push(u, v);
            }
        }
        
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const a = i * (segments + 1) + j;
                const b = i * (segments + 1) + j + 1;
                const c = (i + 1) * (segments + 1) + j;
                const d = (i + 1) * (segments + 1) + j + 1;
                
                this.indices.push(a, b, c);
                this.indices.push(b, d, c);
            }
        }
    }
}

// ============================================
// Material Class
// ============================================

export class Material {
    constructor(options = {}) {
        this.color = options.color || '#ff3366';
        this.wireframe = options.wireframe || false;
        this.opacity = options.opacity || 1;
        this.transparent = options.transparent || false;
        this.emissive = options.emissive || '#000000';
        this.shininess = options.shininess || 30;
    }
    
    setColor(hexColor) {
        this.color = hexColor;
    }
}

// ============================================
// Mesh Factory - Creates ready-to-use meshes
// ============================================

export class MeshFactory {
    static createBox(width, height, depth, color = '#ff3366', options = {}) {
        const geometry = new BoxGeometry(width, height, depth);
        const material = new Material({ color, ...options });
        const mesh = new Mesh(geometry, material);
        mesh.type = 'box';
        return mesh;
    }
    
    static createSphere(radius, color = '#33ff66', options = {}) {
        const geometry = new SphereGeometry(radius, options.segments || 32);
        const material = new Material({ color, ...options });
        const mesh = new Mesh(geometry, material);
        mesh.type = 'sphere';
        return mesh;
    }
    
    static createCylinder(radiusTop, radiusBottom, height, color = '#ffaa33', options = {}) {
        const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, options.segments || 32);
        const material = new Material({ color, ...options });
        const mesh = new Mesh(geometry, material);
        mesh.type = 'cylinder';
        return mesh;
    }
    
    static createPlane(width, height, color = '#44aaff', options = {}) {
        const geometry = new PlaneGeometry(width, height, options.segments || 1);
        const material = new Material({ color, wireframe: options.wireframe || false });
        const mesh = new Mesh(geometry, material);
        mesh.type = 'plane';
        return mesh;
    }
    
    static createTorus(radius, tubeRadius, radialSegments = 32, tubularSegments = 64, color = '#ff66cc') {
        // Simple torus geometry
        const geometry = this.generateTorusGeometry(radius, tubeRadius, radialSegments, tubularSegments);
        const material = new Material({ color });
        const mesh = new Mesh(geometry, material);
        mesh.type = 'torus';
        return mesh;
    }
    
    static generateTorusGeometry(radius, tubeRadius, radialSegments, tubularSegments) {
        const geometry = {
            vertices: [],
            normals: [],
            indices: [],
            uvs: [],
            type: 'torus'
        };
        
        for (let i = 0; i <= radialSegments; i++) {
            const u = i / radialSegments;
            const theta = u * Math.PI * 2;
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);
            
            for (let j = 0; j <= tubularSegments; j++) {
                const v = j / tubularSegments;
                const phi = v * Math.PI * 2;
                const cosPhi = Math.cos(phi);
                const sinPhi = Math.sin(phi);
                
                const x = (radius + tubeRadius * cosPhi) * cosTheta;
                const y = (radius + tubeRadius * cosPhi) * sinTheta;
                const z = tubeRadius * sinPhi;
                
                geometry.vertices.push(x, y, z);
                
                // Normal approximation
                const nx = cosPhi * cosTheta;
                const ny = cosPhi * sinTheta;
                const nz = sinPhi;
                geometry.normals.push(nx, ny, nz);
                
                geometry.uvs.push(u, v);
            }
        }
        
        for (let i = 0; i < radialSegments; i++) {
            for (let j = 0; j < tubularSegments; j++) {
                const a = i * (tubularSegments + 1) + j;
                const b = i * (tubularSegments + 1) + j + 1;
                const c = (i + 1) * (tubularSegments + 1) + j;
                const d = (i + 1) * (tubularSegments + 1) + j + 1;
                
                geometry.indices.push(a, b, c);
                geometry.indices.push(b, d, c);
            }
        }
        
        return geometry;
    }
}

// ============================================
// Color Utilities
// ============================================

export const Colors = {
    RED: '#ff3333',
    GREEN: '#33ff33',
    BLUE: '#3333ff',
    YELLOW: '#ffff33',
    CYAN: '#33ffff',
    MAGENTA: '#ff33ff',
    ORANGE: '#ff9933',
    PURPLE: '#9933ff',
    WHITE: '#ffffff',
    BLACK: '#000000',
    
    random() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
};
