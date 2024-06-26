const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Fetch the latest git tag
const gitTag = execSync('git describe --tags --abbrev=0').toString().trim();

// Define the environment file path
const envFilePath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');

// Read the existing environment file
let envFileContent = fs.readFileSync(envFilePath, 'utf8');

// Inject the git tag into the environment file
envFileContent = envFileContent.replace(/GIT_TAG: '.*'/, `GIT_TAG: '${gitTag}'`);

// Write the updated environment file back to disk
fs.writeFileSync(envFilePath, envFileContent, 'utf8');

console.log(`Set GIT_TAG to ${gitTag} in environment.prod.ts`);