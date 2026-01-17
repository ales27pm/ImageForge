// Minimal file utils for preflight (sync, no deps)
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export function readJson(path) {
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    return undefined;
  }
}

export function readText(path) {
  if (!existsSync(path)) return undefined;
  try {
    return readFileSync(path, 'utf8');
  } catch (e) {
    return undefined;
  }
}

export function writeJson(path, obj) {
  const dir = dirname(path);
  if (!existsSync(dir)) require('fs').mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2));
}

export function writeText(path, text) {
  const dir = dirname(path);
  if (!existsSync(dir)) require('fs').mkdirSync(dir, { recursive: true });
  writeFileSync(path, text);
}
