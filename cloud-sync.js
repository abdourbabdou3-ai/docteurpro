const { spawnSync } = require('child_process');

// Using the Pooler URL because Port 5432 is blocked. 
// Adding ?pgbouncer=true is recommended for Poolers.
const url = 'postgresql://postgres.crrqarczhabkgkiztylc:abdou20102007%23sa@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require';

const run = (cmd, args) => {
    console.log(`> 🛠️ Executing: ${cmd} ${args.join(' ')}`);
    // Added 10 minute timeout for slow connections
    const res = spawnSync(cmd, args, {
        stdio: 'inherit',
        shell: true,
        timeout: 600000,
        env: { ...process.env, DATABASE_URL: url, PRISMA_HIDE_UPDATE_MESSAGE: 'true' }
    });
    return res.status === 0;
};

console.log('🚀 Starting Optimized Cloud Sync...');
console.log('⚠️ Note: This may take 1-3 minutes depending on your internet connection. Please wait.');

console.log('\n--- Phase 1: Creating Tables (Schema Push) ---');
console.log('⏳ Running db push... (This is the slow part)');
// Added --skip-generate to make it MUCH faster
const pushSuccess = run('npx', ['prisma', 'db', 'push', '--skip-generate', '--accept-data-loss']);

if (!pushSuccess) {
    console.log('\n❌ Phase 1 failed or timed out.');
    console.log('Try refreshing your Supabase dashboard to see if tables appeared.');
} else {
    console.log('\n✅ Phase 1 Complete!');
}

console.log('\n--- Phase 2: Inserting Accounts (Seeding) ---');
const seedSuccess = run('npx', ['ts-node', '--transpile-only', '--compiler-options', '{"module":"CommonJS","moduleResolution":"node"}', 'prisma/seed.ts']);

if (seedSuccess) {
    console.log('\n🎉 ALL DONE! Your website is now fully active.');
    console.log('Login at: https://tabib-dz.vercel.app');
} else {
    console.error('\n❌ Seeding failed.');
}
