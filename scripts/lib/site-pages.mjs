import { readFileSync } from 'node:fs';
// Page registration is authoritative for routes and language pairs.
const registry = JSON.parse(readFileSync(new URL('../../metadata/pages.json', import.meta.url)));
export const pagePaths = registry.pages.map(page => page.path);
export const localePrefixes = Object.values(registry.locales);
export const expectedPages = localePrefixes.flatMap(prefix => pagePaths.map(page => prefix + page)).sort();
