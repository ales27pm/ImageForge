// Env helpers for preflight
export function getEnv(key, fallback) {
  return process.env[key] || fallback;
}

export function redactEnv(env) {
  // Redact secrets for report
  const redacted = { ...env };
  if (redacted.EXPO_TOKEN) redacted.EXPO_TOKEN = '***';
  if (redacted.APPLE_APP_SPECIFIC_PASSWORD) redacted.APPLE_APP_SPECIFIC_PASSWORD = '***';
  return redacted;
}
