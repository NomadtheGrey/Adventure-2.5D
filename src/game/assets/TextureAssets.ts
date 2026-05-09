import * as THREE from 'three';

export class TextureAssets {
    public static generateProceduralTexture(baseColor: string, accentColor: string, pattern: 'circuit' | 'organic' | 'noise' | 'waves'): THREE.Texture {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Texture();

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;

        if (pattern === 'circuit') {
            for (let i = 0; i < 40; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random() * size, Math.random() * size);
                const dir = Math.random() > 0.5;
                ctx.lineTo(dir ? Math.random() * size : ctx.canvas.width, dir ? ctx.canvas.height : Math.random() * size);
                ctx.stroke();
            }
        } else if (pattern === 'organic') {
            for (let i = 0; i < 100; i++) {
                ctx.fillStyle = accentColor + '33';
                ctx.beginPath();
                ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 20, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (pattern === 'waves') {
            ctx.lineWidth = 4;
            for (let i = 0; i < 10; i++) {
                ctx.beginPath();
                const y = (i / 10) * size;
                ctx.moveTo(0, y);
                for (let x = 0; x < size; x += 10) {
                    ctx.lineTo(x, y + Math.sin(x * 0.1 + i) * 10);
                }
                ctx.stroke();
            }
        } else {
            for (let i = 0; i < 1000; i++) {
                ctx.fillStyle = accentColor + '11';
                ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
            }
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    public static generateFloorTexture(): THREE.Texture {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Texture();

        ctx.fillStyle = '#022c22';
        ctx.fillRect(0, 0, size, size);
        
        const greens = ['#065f46', '#14532d', '#166534', '#064e3b'];
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const length = 4 + Math.random() * 8;
            const angle = Math.random() * Math.PI;
            ctx.strokeStyle = greens[Math.floor(Math.random() * greens.length)];
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                x + Math.cos(angle) * (length/2) + (Math.random()-0.5)*5,
                y + Math.sin(angle) * (length/2) + (Math.random()-0.5)*5,
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length
            );
            ctx.stroke();
        }

        for (let i = 0; i < 400; i++) {
            ctx.fillStyle = '#05966922';
            ctx.beginPath();
            ctx.arc(Math.random() * size, Math.random() * size, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 10000; i++) {
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.15})`;
            ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(120, 120);
        return texture;
    }
}
