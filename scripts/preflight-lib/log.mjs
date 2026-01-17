// Logging helpers for preflight
export function log(msg) {
  process.stdout.write(`[preflight] ${msg}\n`);
}

export function logSection(title) {
  log(`--- ${title} ---`);
}

export function logFail(msg) {
  process.stderr.write(`[preflight] FAIL: ${msg}\n`);
}

export function logOk(msg) {
  log(`OK: ${msg}`);
}
