import type { Registry } from './schema';

import { examples } from './registry-examples';
import { hooks } from './registry-hooks';
import { lib } from './registry-lib';
import { themes } from './registry-themes';
import { ui } from './registry-ui';

export const registry: Registry = [
  ...ui,
  ...examples,
  ...lib,
  ...hooks,
  ...themes,
];
