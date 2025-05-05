import type { Registry } from 'shadcn/registry';

import { blocks } from './registry-blocks';
import { components } from './registry-components';
import { examples } from './registry-examples';
import { hooks } from './registry-hooks';
import { lib } from './registry-lib';
import { themes } from './registry-themes';
import { ui } from './registry-ui';

const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://platejs.org';

export const registry = {
  homepage: url,
  items: [
    ...ui,
    ...components,
    ...blocks,
    ...lib,
    ...hooks,
    ...themes,

    // Internal use only.
    ...examples,
  ].map((item) => ({
    ...item,
    registryDependencies: item.registryDependencies?.map((dep) =>
      dep.startsWith('/r') ? url + dep : dep
    ),
  })),
  name: 'plate',
} satisfies Registry;
