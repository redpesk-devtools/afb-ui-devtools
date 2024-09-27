const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Fetch the latest git tag
const gitTag = execSync('git tag --sort=v:refname | tail -n 1').toString().trim();

// Define the environment file path
const envFilePathProd = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
const envFilePath = path.join(__dirname, 'src', 'environments', 'environment.ts');
const pkgFilePath = path.join(__dirname, 'package.json');

// Read the existing environment file
let envFileContentProd = fs.readFileSync(envFilePathProd, 'utf8');
let envFileContent = fs.readFileSync(envFilePath, 'utf8');
let pkgFileContent = fs.readFileSync(pkgFilePath, 'utf8');

// Inject the git tag into the environment file
envFileContentProd = envFileContentProd.replace(/GIT_TAG: '.*'/, `GIT_TAG: '${gitTag}'`);
envFileContent = envFileContent.replace(/GIT_TAG: '.*'/, `GIT_TAG: '${gitTag}'`);

// Update the version in package.json
pkgFileContent = pkgFileContent.replace(/"version": ".*"/, `"version": "${gitTag}"`);

// Write the updated environment file back to disk
fs.writeFileSync(envFilePath, envFileContent, 'utf8');
fs.writeFileSync(envFilePathProd, envFileContentProd, 'utf8');
fs.writeFileSync(pkgFilePath, pkgFileContent, 'utf8');

console.log(`Set GIT_TAG to ${gitTag} in environment.prod.ts`);
console.log(`Set GIT_TAG to ${gitTag} in environment.ts`);
console.log(`Set version to ${gitTag} in package.json`);
