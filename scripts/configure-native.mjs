import { readFile, writeFile } from 'node:fs/promises';

const platform = process.argv[2] || 'both';
if (platform === 'android' || platform === 'both') {
const androidPath = new URL('../android/app/src/main/AndroidManifest.xml', import.meta.url);
let android = await readFile(androidPath, 'utf8');
const permissions = [
  '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
  '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
  '<uses-feature android:name="android.hardware.location.gps" android:required="false" />',
];
const missing = permissions.filter(line => !android.includes(line));
if (missing.length) {
  const manifestTag = android.match(/<manifest\b[^>]*>/)?.[0];
  if (!manifestTag) throw new Error('Could not locate Android manifest root');
  android = android.replace(manifestTag, manifestTag + '\n    ' + missing.join('\n    '));
}
if (!android.includes('android:scheme="truckingcostrau"')) {
  const deepLink = [
    '            <intent-filter>',
    '                <action android:name="android.intent.action.VIEW" />',
    '                <category android:name="android.intent.category.DEFAULT" />',
    '                <category android:name="android.intent.category.BROWSABLE" />',
    '                <data android:scheme="truckingcostrau" android:host="auth" android:path="/callback" />',
    '            </intent-filter>',
    '',
  ].join('\n');
  const close = android.indexOf('</activity>');
  if (close < 0) throw new Error('Could not locate MainActivity in Android manifest');
  android = android.slice(0, close) + deepLink + android.slice(close);
}
await writeFile(androidPath, android);
}
if (platform === 'ios' || platform === 'both') {
const iosPath = new URL('../ios/App/App/Info.plist', import.meta.url);
let plist = await readFile(iosPath, 'utf8');
function addRootEntry(key, xml) {
  if (plist.includes('<key>' + key + '</key>')) return;
  const end = plist.lastIndexOf('</dict>');
  if (end < 0) throw new Error('Could not locate Info.plist root dictionary');
  plist = plist.slice(0, end) + xml + '\n' + plist.slice(end);
}
addRootEntry('NSLocationWhenInUseUsageDescription', [
  '    <key>NSLocationWhenInUseUsageDescription</key>',
  '    <string>TruckingCostr AU uses your location while you record a trip, to log the route, distance and GPS speed.</string>',
].join('\n'));
addRootEntry('NSLocationAlwaysAndWhenInUseUsageDescription', [
  '    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>',
  '    <string>TruckingCostr AU uses your location for trip recording. GPS recording may stop when the app is suspended.</string>',
].join('\n'));
addRootEntry('CFBundleURLTypes', [
  '    <key>CFBundleURLTypes</key>',
  '    <array>',
  '        <dict>',
  '            <key>CFBundleURLName</key>',
  '            <string>au.com.truckingcostr.app</string>',
  '            <key>CFBundleURLSchemes</key>',
  '            <array><string>truckingcostrau</string></array>',
  '        </dict>',
  '    </array>',
].join('\n'));
await writeFile(iosPath, plist);
}
console.log('Configured ' + platform + ' native GPS permissions and truckingcostrau://auth/callback deep links');
