/* eslint-disable turbo/no-undeclared-env-vars,no-console */

import type * as z from 'zod';

import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import path from 'path';

import type { Config } from '../get-config';

import {
  type registryItemWithContentSchema,
  registryBaseColorSchema,
  registryIndexSchema,
  registryWithContentSchema,
  stylesSchema,
} from './schema';

const baseUrl = process.env.COMPONENTS_REGISTRY_URL ?? 'https://platejs.org';
const agent = process.env.https_proxy
  ? new HttpsProxyAgent(process.env.https_proxy)
  : undefined;

export async function getRegistryIndex() {
  try {
    const [result] = await fetchRegistry(['index.json']);

    return registryIndexSchema.parse(result);
  } catch (error) {
    throw new Error(`Failed to fetch components from registry.`);
  }
}

export async function getRegistryStyles() {
  try {
    const [result] = await fetchRegistry(['styles/index.json']);

    return stylesSchema.parse(result);
  } catch (error) {
    throw new Error(`Failed to fetch styles from registry.`);
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getRegistryBaseColors() {
  return [
    {
      label: 'Slate',
      name: 'slate',
    },
    {
      label: 'Gray',
      name: 'gray',
    },
    {
      label: 'Zinc',
      name: 'zinc',
    },
    {
      label: 'Neutral',
      name: 'neutral',
    },
    {
      label: 'Stone',
      name: 'stone',
    },
  ];
}

export async function getRegistryBaseColor(baseColor: string) {
  try {
    const [result] = await fetchRegistry([`colors/${baseColor}.json`]);

    return registryBaseColorSchema.parse(result);
  } catch (error) {
    throw new Error(`Failed to fetch base color from registry.`);
  }
}

export async function resolveTree(
  index: z.infer<typeof registryIndexSchema>,
  names: string[]
) {
  const tree: z.infer<typeof registryIndexSchema> = [];

  for (const name of names) {
    const entry = index.find((e) => e.name === name);

    if (!entry) {
      continue;
    }

    tree.push(entry);

    if (entry.registryDependencies) {
      const dependencies = await resolveTree(index, entry.registryDependencies);
      tree.push(...dependencies);
    }
  }

  return tree.filter(
    (component, i, self) =>
      self.findIndex((c) => c.name === component.name) === i
  );
}

export async function fetchTree(
  style: string,
  tree: z.infer<typeof registryIndexSchema>
) {
  try {
    const paths = tree.map((item) => `styles/${style}/${item.name}.json`);
    const result = await fetchRegistry(paths);

    return registryWithContentSchema.parse(result);
  } catch (error) {
    throw new Error(`Failed to fetch tree from registry.`);
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getItemTargetPath(
  config: Config,
  item: Pick<z.infer<typeof registryItemWithContentSchema>, 'type'>,
  override?: string
) {
  if (override) {
    return override;
  }

  if (item.type === 'components:plate-ui' && config?.aliases['plate-ui']) {
    return config.resolvedPaths['plate-ui'];
  }

  if (item.type === 'components:plate-ui' && config?.aliases.ui) {
    return config.resolvedPaths.ui;
  }

  const [parent, type] = item.type.split(':');
  if (!config || !(parent in config.resolvedPaths)) {
    return null;
  }

  return path.join(
    config.resolvedPaths[parent as keyof typeof config.resolvedPaths],
    type
  );
}

async function fetchRegistry(paths: string[]) {
  try {
    const results = await Promise.all(
      paths.map(async (p) => {
        const response = await fetch(`${baseUrl}/registry/${p}`, {
          agent,
        });
        return await response.json();
      })
    );

    return results;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to fetch registry from ${baseUrl}.`);
  }
}
