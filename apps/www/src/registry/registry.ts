import type { Registry } from 'shadcx/registry';

import { registryApp } from './registry-app';
import { blocks } from './registry-blocks';
import { components } from './registry-components';
import { examples } from './registry-examples';
import { hooks } from './registry-hooks';
import { lib } from './registry-lib';
import { themes } from './registry-themes';
import { ui } from './registry-ui';

export const registry = {
  homepage: 'https://platejs.org',
  items: [
    ...ui,
    ...components,
    ...registryApp,
    ...blocks,
    ...lib,
    ...hooks,
    ...themes,

    // Internal use only.
    ...examples,
  ],
  name: 'plate',
} satisfies Registry;
