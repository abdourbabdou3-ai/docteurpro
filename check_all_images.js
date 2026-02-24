const fs = require('fs');

function getPngDimensions(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        if (buffer.readUInt32BE(0) !== 0x89504E47) {
            // Check if it's WebP
            if (buffer.readUInt32BE(0) === 0x52494646 && buffer.readUInt32BE(8) === 0x57454250) {
                return { type: 'WebP' };
            }
            return { type: 'Unknown', hex: buffer.slice(0, 8).toString('hex') };
        }
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { type: 'PNG', width, height };
    } catch (e) {
        return { error: e.message };
    }
}

const dir = 'C:/Users/ABDOU/.gemini/antigravity/brain/f50f5b04-4b1e-4935-97a6-fa75a44c02f0/';
fs.readdirSync(dir).forEach(f => {
    if (f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.jpg')) {
        const res = getPngDimensions(dir + f);
        console.log(`${f}:`, res);
    }
});
