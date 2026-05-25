/**
 * Renderer.js - Software Renderer
 * Handles drawing 3D objects using Canvas 2D API with lighting and perspective
 */

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas || document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.clearColor = '#050b1a';
        
        // Depth buffer for z-culling
        this.depthBuffer = null;
        
        // Rendering settings
        this.wireframe = false;
        this.showNormals = false;
    }
    
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.depthBuffer = new Array(width * height).fill(Infinity);
    }
    
    clear() {
        this.ctx.fillStyle = this.clearColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Reset depth buffer
        if (this.depthBuffer) {
            for (let i = 0; i < this.depthBuffer.length; i++) {
                this.depthBuffer[i] = Infinity;
            }
        }
    }
    
    render(scene, camera, lights) {
        this.clear();
        
        // Render all visible meshes in scene
        for (const mesh of scene.children) {
            if (mesh.visible && mesh.geometry) {
                this.renderMesh(mesh, camera, lights);
            }
        }
    }
    
    renderMesh(mesh, camera, lights) {
        if (!mesh.geometry.vertices || mesh.geometry.vertices.length === 0) return;
        
        const vertices = mesh.geometry.vertices;
        const indices = mesh.geometry.indices;
        const normals = mesh.geometry.normals;
        
        // Transform vertices to world space
        mesh.updateMatrix();
        const worldVertices = [];
        
        for (let i = 0; i < vertices.length; i += 3) {
            const localPos = { x: vertices[i], y: vertices[i + 1], z: vertices[i + 2] };
            const worldPos = this.transformPoint(localPos, mesh.modelMatrix);
            worldVertices.push(worldPos);
        }
        
        // Transform to view space and project
        const projectedVertices = [];
        const viewVertices = [];
        
        for (let i = 0; i < worldVertices.length; i++) {
            const world = worldVertices[i];
            const view = this.transformPoint(world, camera.viewMatrix);
            viewVertices.push(view);
            
            const projected = this.projectPoint(view, camera);
            projectedVertices.push(projected);
        }
        
        // Draw triangles
        for (let i = 0; i < indices.length; i += 3) {
            const i1 = indices[i];
            const i2 = indices[i + 1];
            const i3 = indices[i + 2];
            
            const v1 = projectedVertices[i1];
            const v2 = projectedVertices[i2];
            const v3 = projectedVertices[i3];
            
            // Back-face culling
            if (!this.isClockwise(v1, v2, v3)) continue;
            
            // Calculate face normal for lighting
            const world1 = worldVertices[i1];
            const world2 = worldVertices[i2];
            const world3 = worldVertices[i3];
            const faceNormal = this.calculateFaceNormal(world1, world2, world3);
            
            // Calculate lighting
            let color = this.calculateLighting(faceNormal, lights, mesh.material);
            
            if (this.wireframe) {
                this.drawWireframeTriangle(v1, v2, v3, color);
            } else {
                this.drawFilledTriangle(v1, v2, v3, color, viewVertices[i1], viewVertices[i2], viewVertices[i3]);
            }
        }
    }
    
    transformPoint(point, matrix) {
        const e = matrix.elements;
        const x = point.x * e[0] + point.y * e[4] + point.z * e[8] + e[12];
        const y = point.x * e[1] + point.y * e[5] + point.z * e[9] + e[13];
        const z = point.x * e[2] + point.y * e[6] + point.z * e[10] + e[14];
        const w = point.x * e[3] + point.y * e[7] + point.z * e[11] + e[15];
        
        return { x: x / w, y: y / w, z: z / w };
    }
    
    projectPoint(point, camera) {
        const e = camera.projectionMatrix.elements;
        const x = point.x * e[0] + point.y * e[4] + point.z * e[8] + e[12];
        const y = point.x * e[1] + point.y * e[5] + point.z * e[9] + e[13];
        const z = point.x * e[2] + point.y * e[6] + point.z * e[10] + e[14];
        const w = point.x * e[3] + point.y * e[7] + point.z * e[11] + e[15];
        
        const invW = 1 / w;
        const ndcX = x * invW;
        const ndcY = y * invW;
        
        return {
            x: (ndcX * 0.5 + 0.5) * this.width,
            y: (1 - (ndcY * 0.5 + 0.5)) * this.height,
            z: z * invW
        };
    }
    
    calculateFaceNormal(v1, v2, v3) {
        const u = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
        const v = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
        
        const nx = u.y * v.z - u.z * v.y;
        const ny = u.z * v.x - u.x * v.z;
        const nz = u.x * v.y - u.y * v.x;
        
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len === 0) return { x: 0, y: 1, z: 0 };
        
        return { x: nx / len, y: ny / len, z: nz / len };
    }
    
    calculateLighting(normal, lights, material) {
        // Ambient light
        let r = 0.3 * this.hexToRgb(material.color).r;
        let g = 0.3 * this.hexToRgb(material.color).g;
        let b = 0.3 * this.hexToRgb(material.color).b;
        
        // Directional light
        if (lights && lights.directional) {
            const lightDir = { x: -lights.directional.position.x, y: -lights.directional.position.y, z: -lights.directional.position.z };
            const len = Math.sqrt(lightDir.x * lightDir.x + lightDir.y * lightDir.y + lightDir.z * lightDir.z);
            lightDir.x /= len;
            lightDir.y /= len;
            lightDir.z /= len;
            
            const dot = Math.max(0, normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z);
            const intensity = dot * lights.directional.intensity;
            
            r += intensity * this.hexToRgb(material.color).r;
            g += intensity * this.hexToRgb(material.color).g;
            b += intensity * this.hexToRgb(material.color).b;
        }
        
        // Clamp colors
        r = Math.min(255, Math.max(0, r * 255));
        g = Math.min(255, Math.max(0, g * 255));
        b = Math.min(255, Math.max(0, b * 255));
        
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 1, g: 1, b: 1 };
    }
    
    isClockwise(v1, v2, v3) {
        return ((v2.x - v1.x) * (v3.y - v1.y) - (v3.x - v1.x) * (v2.y - v1.y)) < 0;
    }
    
    drawWireframeTriangle(v1, v2, v3, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(v1.x, v1.y);
        this.ctx.lineTo(v2.x, v2.y);
        this.ctx.lineTo(v3.x, v3.y);
        this.ctx.closePath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawFilledTriangle(v1, v2, v3, color, zv1, zv2, zv3) {
        // Sort vertices by Y
        let vertices = [v1, v2, v3];
        let depths = [zv1.z, zv2.z, zv3.z];
        vertices.sort((a, b) => a.y - b.y);
        
        const [vTop, vMid, vBottom] = vertices;
        
        if (vTop.y === vBottom.y) return;
        
        // Rasterize triangle using scanline algorithm
        const invHeight = 1 / (vBottom.y - vTop.y);
        
        for (let y = Math.max(0, Math.floor(vTop.y)); y <= Math.min(this.height - 1, Math.floor(vBottom.y)); y++) {
            const t = (y - vTop.y) * invHeight;
            
            let xLeft, xRight;
            
            if (y < vMid.y) {
                const invHeightTop = 1 / (vMid.y - vTop.y);
                const tTop = (y - vTop.y) * invHeightTop;
                xLeft = this.lerp(vTop.x, vMid.x, tTop);
                xRight = this.lerp(vTop.x, vBottom.x, t);
            } else {
                const invHeightBottom = 1 / (vBottom.y - vMid.y);
                const tBottom = (y - vMid.y) * invHeightBottom;
                xLeft = this.lerp(vMid.x, vBottom.x, tBottom);
                xRight = this.lerp(vTop.x, vBottom.x, t);
            }
            
            if (xLeft > xRight) [xLeft, xRight] = [xRight, xLeft];
            
            for (let x = Math.max(0, Math.floor(xLeft)); x <= Math.min(this.width - 1, Math.floor(xRight)); x++) {
                const idx = y * this.width + x;
                if (this.depthBuffer && this.depthBuffer[idx] > (vTop.z + vMid.z + vBottom.z) / 3) {
                    this.depthBuffer[idx] = (vTop.z + vMid.z + vBottom.z) / 3;
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
}
