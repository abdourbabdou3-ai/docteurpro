const fs = require('fs');

function getPngDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    // PNG signature check
    if (buffer.readUInt32BE(0) !== 0x89504E47) {
        return { error: 'Not a PNG file' };
    }
    // IHDR chunk starts at offset 8, length(4) + type(4)
    // Width is at offset 16, Height at 20 (4 bytes each, Big Endian)
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
}

const icons = [
    'C:/Users/ABDOU/.gemini/antigravity/brain/f50f5b04-4b1e-4935-97a6-fa75a44c02f0/app_icon_192_1771950875746.png',
    'C:/Users/ABDOU/.gemini/antigravity/brain/f50f5b04-4b1e-4935-97a6-fa75a44c02f0/app_icon_512_1771950765466.png',
    'C:/Users/ABDOU/.gemini/antigravity/brain/f50f5b04-4b1e-4935-97a6-fa75a44c02f0/app_icon_512pc_1771950944914.png',
    'C:/Users/ABDOU/.gemini/antigravity/brain/f50f5b04-4b1e-4935-97a6-fa75a44c02f0/app_icon_512x512_v2_1771951017695.png'
];

icons.forEach(icon => {
    try {
        const dims = getPngDimensions(icon);
        console.log(`${icon}: ${dims.width}x${dims.height}`);
    } catch (e) {
        console.log(`Error reading ${icon}: ${e.message}`);
    }
});
