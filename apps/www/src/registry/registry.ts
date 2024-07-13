import type { Registry } from './schema';

import { example } from './example';
import { ui } from './ui';

export const registry: Registry = [...ui, ...example];
