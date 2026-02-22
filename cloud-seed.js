const { spawnSync } = require('child_process');

const url = 'postgresql://postgres.crrqarczhabkgkiztylc:abdou20102007%23sa@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require';

const run = (cmd, args) => {
    console.log(`> 🛠️ Executing: ${cmd} ${args.join(' ')}`);
    const res = spawnSync(cmd, args, {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, DATABASE_URL: url }
    });
    return res.status === 0;
};

console.log('🚀 Phase 2: Inserting Accounts (Seeding) Only...');
const seedSuccess = run('npx', ['ts-node', '--transpile-only', '--compiler-options', '{"module":"CommonJS","moduleResolution":"node"}', 'prisma/seed.ts']);

if (seedSuccess) {
    console.log('\n🎉 ALL DONE! Your website is now fully active with all data.');
    console.log('Login at: https://tabib-dz.vercel.app');
} else {
    console.error('\n❌ Seeding failed. Make sure you applied the SQL schema first.');
}
