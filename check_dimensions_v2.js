const fs = require('fs');

function getImageDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);

    // PNG Check
    if (buffer.readUInt32BE(0) === 0x89504E47) {
        return { type: 'PNG', width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }

    // JPEG Check
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        let offset = 2;
        while (offset < buffer.length) {
            const marker = buffer.readUInt16BE(offset);
            const length = buffer.readUInt16BE(offset + 2);
            if (marker >= 0xFFC0 && marker <= 0xFFC3) {
                // SOF marker
                const height = buffer.readUInt16BE(offset + 5);
                const width = buffer.readUInt16BE(offset + 7);
                return { type: 'JPEG', width, height };
            }
            offset += length + 2;
        }
    }

    return { type: 'Unknown' };
}

const dir = 'C:/Users/ABDOU/.gemini/antigravity/brain/f50f5b04-4b1e-4935-97a6-fa75a44c02f0/';
fs.readdirSync(dir).forEach(f => {
    if (f.includes('icon') || f.includes('media')) {
        const dims = getImageDimensions(dir + f);
        console.log(`${f}: ${dims.type} ${dims.width}x${dims.height}`);
    }
});
