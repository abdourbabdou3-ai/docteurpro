
import 'dotenv/config';

async function checkEnv() {
    console.log('--- Environment Check ---');
    const pass = process.env.EMAIL_PASSWORD;
    console.log('EMAIL_PASSWORD found:', !!pass);
    if (pass) {
        console.log('EMAIL_PASSWORD length:', pass.length);
        console.log('EMAIL_PASSWORD starts with:', pass.substring(0, 4));
        // Check for common issues like quotes or spaces
        if (pass.startsWith('"') || pass.endsWith('"')) {
            console.log('WARNING: EMAIL_PASSWORD contains quotes (")');
        }
        if (pass.includes(' ')) {
            console.log('WARNING: EMAIL_PASSWORD contains spaces');
        }
    } else {
        console.log('EMAIL_PASSWORD is NOT defined in .env');
    }
    console.log('-------------------------');
}

checkEnv().catch(console.error);
