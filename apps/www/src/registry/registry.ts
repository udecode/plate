import type { Registry } from './schema';

import { registryApp } from './registry-app';
import { blocks } from './registry-blocks';
import { components } from './registry-components';
import { examples } from './registry-examples';
import { hooks } from './registry-hooks';
import { lib } from './registry-lib';
import { themes } from './registry-themes';
import { ui } from './registry-ui';

export const registry: Registry = [
  ...ui,
  ...components,
  ...examples,
  ...registryApp,
  ...blocks,
  ...lib,
  ...hooks,
  ...themes,
];
