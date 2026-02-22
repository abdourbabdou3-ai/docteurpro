const { register } = require('ts-node');
const path = require('path');

// Register ts-node with specific options to avoid TS5095/TS5023 errors on Windows
register({
    transpileOnly: true,
    compilerOptions: {
        module: 'CommonJS',
        moduleResolution: 'node',
        esModuleInterop: true,
        skipLibCheck: true,
    },
});

// Run the actual seed script
console.log('🚀 Starting seed via wrapper...');
require('./seed.ts');
