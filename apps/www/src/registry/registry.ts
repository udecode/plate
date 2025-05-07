import type { Registry } from 'shadcn/registry';

import { blocks } from './registry-blocks';
import { components } from './registry-components';
import { examples } from './registry-examples';
import { hooks } from './registry-hooks';
import { lib } from './registry-lib';
import { ui } from './registry-ui';

const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://platejs.org';

export const registry = {
  homepage: url,
  items: [...ui, ...components, ...blocks, ...lib, ...hooks, ...examples],
  name: 'plate',
} satisfies Registry;
