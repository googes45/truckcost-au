import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../android/app/build.gradle', import.meta.url);
let gradle = await readFile(file, 'utf8');
if (gradle.includes('truckingUpload')) throw new Error('Signing already configured');
const androidMatch = /android\s*\{/;
if (!androidMatch.test(gradle)) throw new Error('Android Gradle block not found');
gradle = gradle.replace(androidMatch, `android {
    signingConfigs {
        truckingUpload {
            storeFile file(System.getenv('TRUCKING_UPLOAD_STORE_FILE'))
            storePassword System.getenv('TRUCKING_UPLOAD_STORE_PASSWORD')
            keyAlias System.getenv('TRUCKING_UPLOAD_KEY_ALIAS')
            keyPassword System.getenv('TRUCKING_UPLOAD_KEY_PASSWORD')
        }
    }`);
const releaseMatch = /release\s*\{/;
if (!releaseMatch.test(gradle)) throw new Error('Release buildType not found');
gradle = gradle.replace(releaseMatch, `release {
            signingConfig signingConfigs.truckingUpload`);
await writeFile(file, gradle);
console.log('Configured release signing from environment variables');
