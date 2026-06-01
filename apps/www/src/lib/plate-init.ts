import { registryItemSchema } from 'shadcn/schema';

import {
  PLATE_INIT_DEPENDENCY,
  PLATE_INIT_URL,
  PLATE_REGISTRY_NAMESPACE,
  plateComponentsJsonConfig,
} from './plate-registry-config';

export const plateInitRegistryItem = registryItemSchema.parse({
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'plate',
  title: 'Plate',
  description: 'Initialize a shadcn project with the Plate registry.',
  type: 'registry:base',
  extends: 'none',
  config: plateComponentsJsonConfig,
  registryDependencies: [PLATE_INIT_DEPENDENCY],
  docs: `Plate is configured through ${PLATE_REGISTRY_NAMESPACE}. Add more editor parts with npx shadcn@latest add ${PLATE_REGISTRY_NAMESPACE}/<name>.`,
});

export function buildPlateInitInstructions() {
  const componentsJson = JSON.stringify(plateComponentsJsonConfig, null, 2);

  return [
    '# Plate init',
    '',
    'Initialize a shadcn project with the Plate registry and the basic editor.',
    '',
    '```bash',
    `npx shadcn@latest init --preset ${PLATE_INIT_URL}`,
    '```',
    '',
    'For an existing shadcn project, add the registry to `components.json`:',
    '',
    '```json',
    componentsJson,
    '```',
    '',
    'Then install a Plate editor:',
    '',
    '```bash',
    `npx shadcn@latest add ${PLATE_INIT_DEPENDENCY}`,
    '```',
  ].join('\n');
}
