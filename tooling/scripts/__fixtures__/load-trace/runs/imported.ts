import { existsSync } from 'node:fs';

export const reach = existsSync(import.meta.dirname) ? 'here' : 'gone';
