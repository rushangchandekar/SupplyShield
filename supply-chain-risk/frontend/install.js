const { execSync } = require('child_process');
const path = require('path');

const dir = path.resolve(__dirname);
console.log('Installing in:', dir);
try {
    const result = execSync('npm install', {
        cwd: dir,
        stdio: 'inherit',
        env: { ...process.env, npm_config_loglevel: 'notice' },
        timeout: 300000,
    });
    console.log('Install complete!');
} catch (e) {
    console.error('Install failed:', e.message);
    process.exit(1);
}
