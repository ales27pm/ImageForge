#!/usr/bin/env node
// EAS preflight validator for iOS builds
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { log, logSection, logFail, logOk } from './preflight-lib/log.mjs';
import { readJson, readText, writeJson, writeText } from './preflight-lib/file-utils.mjs';
import { getEnv, redactEnv } from './preflight-lib/env.mjs';
import { sdkToRn, getExpoSdkMajor } from './preflight-lib/expo-rn.mjs';

const ARTIFACT_DIR = './artifacts/preflight';
const REPORT_JSON = join(ARTIFACT_DIR, 'preflight-report.json');
const REPORT_TXT = join(ARTIFACT_DIR, 'preflight-report.txt');

function fail(reason, ctx) {
  logFail(reason);
  const report = {
    ok: false,
    reason,
    ...ctx,
  };
  writeJson(REPORT_JSON, report);
  writeText(REPORT_TXT, `[preflight] FAIL\n${reason}\n` + (ctx && ctx.details ? ctx.details : ''));
  process.exit(1);
}

function ok(ctx) {
  logOk('All checks passed.');
  const report = {
    ok: true,
    ...ctx,
  };
  writeJson(REPORT_JSON, report);
  writeText(REPORT_TXT, '[preflight] OK\n');
}

function checkNodeEnv() {
  logSection('Environment');
  const node = process.version;
  let npm;
  try {
    npm = (typeof require !== 'undefined')
      ? require('child_process').execSync('npm -v').toString().trim()
      : undefined;
  } catch (e) {
    log('[WARN] npm -v failed: ' + (e && e.message ? e.message : e));
    npm = undefined;
  }
  const platform = process.platform;
  const env = {
    EAS_BUILD_PLATFORM: getEnv('EAS_BUILD_PLATFORM'),
    EAS_BUILD_PROFILE: getEnv('EAS_BUILD_PROFILE'),
    CI: getEnv('CI'),
    EXPO_TOKEN: getEnv('EXPO_TOKEN'),
    EXPO_APPLE_TEAM_ID: getEnv('EXPO_APPLE_TEAM_ID'),
  };
  log(`node: ${node}`);
  log(`npm: ${npm}`);
  log(`platform: ${platform}`);
  Object.entries(env).forEach(([k, v]) => log(`${k}: ${v ? (k.includes('TOKEN') ? '***' : v) : ''}`));
  if (env.EAS_BUILD_PLATFORM === 'ios' && platform !== 'darwin' && env.CI) {
    fail('iOS build must run on macOS (darwin) in CI.', { details: 'EAS_BUILD_PLATFORM=ios, platform=' + platform });
  }
  if (env.EAS_BUILD_PLATFORM === 'ios') {
    try {
      if (typeof require !== 'undefined') {
        require('child_process').execSync('xcodebuild -version', { stdio: 'ignore' });
      }
    } catch {
      log('[WARN] xcodebuild not available on macOS runner.');
    }
    if (!node) fail('Missing node.', { details: { node, npm } });
    if (!npm) log('[WARN] npm not found, but not required for preflight.');
  } else {
    if (!node) fail('Missing node.', { details: { node, npm } });
    if (!npm) log('[WARN] npm not found, but not required for preflight.');
  }
  return { node, npm, platform, env: redactEnv(env) };
}

function checkExpoVersions() {
  logSection('Expo/RN version');
  let pkg = readJson('package.json');
  if (!pkg) fail('Missing package.json');
  let expo = pkg.dependencies?.expo || pkg.devDependencies?.expo;
  let rn = pkg.dependencies?.['react-native'] || pkg.devDependencies?.['react-native'];
  let react = pkg.dependencies?.react || pkg.devDependencies?.react;
  // Try node_modules for installed version
  try {
    const expoPkg = readJson('node_modules/expo/package.json');
    if (expoPkg?.version) expo = expoPkg.version;
  } catch {}
  log(`expo: ${expo}`);
  log(`react-native: ${rn}`);
  log(`react: ${react}`);
  if (!expo) fail('expo not found in dependencies.');
  const sdkMajor = getExpoSdkMajor(expo);
  if (!sdkMajor) fail('Could not parse Expo SDK major version.');
  const expectedRn = sdkToRn[sdkMajor];
  if (expectedRn && rn && !rn.startsWith(expectedRn)) {
    fail(`Expo SDK ${sdkMajor} expects react-native ${expectedRn}, found ${rn}`);
  }
  return { expo, rn, react, sdkMajor, expectedRn };
}

function findAppConfig() {
  const files = ['app.json', 'app.config.js', 'app.config.ts'];
  for (const f of files) {
    if (existsSync(f)) return f;
  }
  return undefined;
}

function checkIosConfig() {
  logSection('iOS config');
  const configFile = findAppConfig();
  if (!configFile) fail('No app config (app.json/app.config.js/ts) found.');
  let config;
  if (configFile.endsWith('.json')) {
    config = readJson(configFile);
  } else {
    try {
      config = require(resolve(configFile));
    } catch (e) {
      fail('Could not load app config: ' + configFile, { details: e.message });
    }
  }
  const ios = config?.expo?.ios;
  if (!ios?.bundleIdentifier) fail('expo.ios.bundleIdentifier missing in app config.');
  log(`bundleIdentifier: ${ios.bundleIdentifier}`);
  // Team ID logic
  let teamId = ios.appleTeamId || getEnv('EXPO_APPLE_TEAM_ID');
  if (!teamId) {
    log('No appleTeamId in config or env; assuming EAS remote credentials only.');
  } else {
    log(`appleTeamId: ${teamId}`);
  }
  return { configFile, bundleIdentifier: ios.bundleIdentifier, teamId };
}

function checkEasJson() {
  logSection('eas.json');
  if (!existsSync('eas.json')) fail('eas.json missing.');
  const eas = readJson('eas.json');
  if (!eas) fail('Could not parse eas.json');
  let iosProfiles = Object.entries(eas.build || {}).filter(([k, v]) => v?.platform === 'ios' || k === 'ios' || k.includes('ios'));
  if (!iosProfiles.length) fail('No iOS build profiles in eas.json');
  let ok = false;
  for (const [k, v] of iosProfiles) {
    if (v.credentialsSource !== 'remote') {
      fail(`eas.json profile ${k} must set credentialsSource: "remote" for iOS.`);
    }
    ok = true;
  }
  if (!ok) fail('No iOS profile with credentialsSource: "remote".');
  log('All iOS profiles use credentialsSource: "remote".');
  return { iosProfiles };
}

function checkPodfile() {
  logSection('Podfile');
  const podfile = readText('ios/Podfile');
  if (!podfile) fail('ios/Podfile missing.');
  const marker = '# --- BREAK ReactCodegen ↔ app target cycle (Xcode archive) ---';
  if (!podfile.includes(marker)) {
    fail('Podfile missing ReactCodegen cycle-breaking patch marker.');
  }
  log('Podfile contains ReactCodegen cycle-breaking patch.');
  return { markerFound: true };
}

function checkJimpLandmine() {
  logSection('Known landmines');
  // Only warn if jimp-compact is present and withIosDangerousBaseMod is used
  let found = false;
  if (existsSync('package.json')) {
    const pkg = readJson('package.json');
    if (pkg?.dependencies?.['jimp-compact'] || pkg?.devDependencies?.['jimp-compact']) {
      // Try to grep for withIosDangerousBaseMod
      try {
        const files = require('child_process').execSync('grep -ril withIosDangerousBaseMod .', { encoding: 'utf8' }).split('\n');
        if (files.some(f => f.includes('ios') || f.includes('plugin'))) {
          log('[WARN] jimp-compact + withIosDangerousBaseMod detected. This is a known prebuild landmine.');
          found = true;
        }
      } catch {}
    }
  }
  if (!found) log('No known landmines detected.');
  return { jimpLandmine: found };
}

function main() {
  let ctx = {};
  ctx.env = checkNodeEnv();
  ctx.versions = checkExpoVersions();
  ctx.iosConfig = checkIosConfig();
  ctx.eas = checkEasJson();
  ctx.podfile = checkPodfile();
  ctx.landmines = checkJimpLandmine();
  ok(ctx);
}

main();
