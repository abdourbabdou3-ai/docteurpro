const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/ABDOU/.gemini/antigravity/brain/f50f5b04-4b1e-4935-97a6-fa75a44c02f0';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const results = [];

files.forEach(f => {
    const file = path.join(dir, f);
    try {
        const stats = fs.statSync(file);
        const buffer = Buffer.alloc(1024); // enough for most headers/SOFs
        const fd = fs.openSync(file, 'r');
        fs.readSync(fd, buffer, 0, 1024, 0);
        fs.closeSync(fd);

        const header = buffer.toString('hex', 0, 8);
        if (header === '89504e470d0a1a0a') {
            const width = buffer.readUInt32BE(16);
            const height = buffer.readUInt32BE(20);
            results.push(`${width === height ? 'SQUARE' : 'NON-SQUARE'} PNG: ${f}: ${width}x${height} (${stats.size} bytes)`);
        } else if (header.startsWith('ffd8')) {
            // Simplified JPEG scan in the first 1KB
            let offset = 2;
            let found = false;
            while (offset < 1020) {
                if (buffer[offset] === 0xff && (buffer[offset + 1] >= 0xc0 && buffer[offset + 1] <= 0xc3)) {
                    const h = buffer.readUInt16BE(offset + 5);
                    const w = buffer.readUInt16BE(offset + 7);
                    results.push(`${w === h ? 'SQUARE' : 'NON-SQUARE'} JPEG-as-PNG: ${f}: ${w}x${h} (${stats.size} bytes)`);
                    found = true;
                    break;
                }
                offset++;
            }
            if (!found) results.push(`JPEG-as-PNG (no SOF in first 1KB): ${f} (${stats.size} bytes)`);
        } else {
            results.push(`UNKNOWN: ${f}: Header ${header} (${stats.size} bytes)`);
        }
    } catch (e) {
        results.push(`ERROR: ${f}: ${e.message}`);
    }
});

fs.writeFileSync('dims_results.txt', results.join('\n'));
console.log('Results written to dims_results.txt');
