import { registrySchema } from 'shadcn/schema';

import registryShadcnData from '../registry-shadcn.json';
import { createPlateRegistry, registry } from '../src/registry/registry';
import {
  toPublicRegistryDependencySpecifier,
  toRegistryDependencySpecifier,
} from './registry-dependencies.mts';

const ABSOLUTE_URL_REGEX = /^https?:\/\//;
const EDITOR_COMPONENT_PATH_SEGMENT = 'components/editor/';
const EDITOR_COMPONENT_TARGET_PREFIX = '@components/editor/';
const PLATE_PUBLIC_REGISTRY_BASE_URL = 'https://platejs.org/r';

const sourceRegistry = createPlateRegistry('https://platejs.org');
const normalizedRegistry = registrySchema.parse({
  ...sourceRegistry,
  items: sourceRegistry.items.map((item) => ({
    ...item,
    registryDependencies: item.registryDependencies?.map(
      toRegistryDependencySpecifier
    ),
  })),
});
const publicRegistry = registrySchema.parse({
  ...sourceRegistry,
  items: sourceRegistry.items.map((item) => ({
    ...item,
    registryDependencies: item.registryDependencies?.map((dependency) =>
      toPublicRegistryDependencySpecifier(
        dependency,
        PLATE_PUBLIC_REGISTRY_BASE_URL
      )
    ),
  })),
});

const itemsByName = new Map(
  normalizedRegistry.items.map((item) => [item.name, item])
);
const publicItemsByName = new Map(
  publicRegistry.items.map((item) => [item.name, item])
);
const shadcnItemsByName = new Map(
  registryShadcnData.items.map((item) => [item.name, item])
);
const runtimeItemsByName = new Map(
  registry.items.map((item) => [item.name, item])
);

for (const item of sourceRegistry.items) {
  for (const dependency of item.registryDependencies ?? []) {
    assert(
      !dependency.startsWith('@shadcn/'),
      `Expected source item ${item.name} to use bare shadcn dependency ${dependency.slice('@shadcn/'.length)} instead of ${dependency}`
    );
  }
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function toEditorComponentTarget(filePath: string) {
  const segmentIndex = filePath.indexOf(EDITOR_COMPONENT_PATH_SEGMENT);

  assert(
    segmentIndex !== -1,
    `Expected ${filePath} to include ${EDITOR_COMPONENT_PATH_SEGMENT}`
  );

  return `${EDITOR_COMPONENT_TARGET_PREFIX}${filePath.slice(segmentIndex + EDITOR_COMPONENT_PATH_SEGMENT.length)}`;
}

assert(itemsByName.has('plate-ui'), 'Expected plate-ui registry item');
assert(itemsByName.has('editor-basic'), 'Expected editor-basic registry item');

const editorBasic = itemsByName.get('editor-basic');
assert(
  editorBasic?.registryDependencies?.includes('@plate/plate-ui'),
  'Expected editor-basic to depend on namespaced plate-ui registry item after normalization'
);

const publicEditorBasic = publicItemsByName.get('editor-basic');
assert(
  publicEditorBasic?.registryDependencies?.includes(
    'https://platejs.org/r/plate-ui.json'
  ),
  'Expected public editor-basic to keep direct URL installs on the same Plate registry base'
);
assert(
  !publicEditorBasic?.registryDependencies?.some((dependency) =>
    dependency.startsWith('@plate/')
  ),
  'Expected public editor-basic to avoid @plate self-dependencies'
);

const runtimeEditorBasic = runtimeItemsByName.get('editor-basic');
assert(
  runtimeEditorBasic?.registryDependencies?.includes('@plate/plate-ui'),
  'Expected runtime editor-basic to depend on namespaced plate-ui'
);

for (const item of normalizedRegistry.items) {
  for (const file of item.files ?? []) {
    if (!file.path.includes(EDITOR_COMPONENT_PATH_SEGMENT)) {
      continue;
    }

    assert(
      file.target === toEditorComponentTarget(file.path),
      `Expected ${item.name} file ${file.path} to install under the configured components alias for relative editor imports`
    );
  }
}

const editorBaseKit = itemsByName.get('editor-base-kit');
const editorBaseKitFile = editorBaseKit?.files?.[0];
assert(
  editorBaseKitFile?.target === '@components/editor/editor-base-kit.tsx',
  'Expected editor-base-kit to install in the configured components editor directory so its relative plugin imports resolve'
);

for (const dependency of editorBaseKit?.registryDependencies ?? []) {
  if (!dependency.startsWith('@plate/') || !dependency.endsWith('-kit')) {
    continue;
  }

  const dependencyName = dependency.slice('@plate/'.length);
  const dependencyItem = itemsByName.get(dependencyName);
  const dependencyFile = dependencyItem?.files?.[0];

  assert(
    dependencyFile?.path &&
      dependencyFile.target === toEditorComponentTarget(dependencyFile.path) &&
      dependencyFile.target.startsWith('@components/editor/plugins/'),
    `Expected editor-base-kit dependency ${dependency} to install under the configured components editor plugins directory`
  );
}

const editorAi = itemsByName.get('editor-ai');
assert(
  editorAi?.files?.some(
    (file) =>
      file.path === 'blocks/editor-ai/components/editor/plate-editor.tsx' &&
      file.target === '@components/editor/plate-editor.tsx'
  ),
  'Expected editor-ai plate-editor to install under the configured components editor directory'
);
assert(
  editorAi?.files?.some(
    (file) =>
      file.path === 'blocks/editor-ai/components/editor/editor-kit.tsx' &&
      file.target === '@components/editor/editor-kit.tsx'
  ),
  'Expected editor-ai editor-kit to install under the configured components editor directory'
);

assert(
  editorBasic?.files?.some(
    (file) =>
      file.path === 'blocks/editor-basic/components/editor/plate-editor.tsx' &&
      file.target === '@components/editor/plate-editor.tsx'
  ),
  'Expected editor-basic plate-editor to install under the configured components editor directory'
);

const excalidrawNode = itemsByName.get('excalidraw-node');
assert(
  excalidrawNode?.meta?.examples?.includes('excalidraw-demo'),
  'Expected excalidraw-node to expose its existing registry demo'
);

for (const item of normalizedRegistry.items) {
  for (const dependency of item.registryDependencies ?? []) {
    assert(
      !dependency.startsWith('@shadcn/'),
      `Expected ${item.name} to use bare shadcn dependency ${dependency.slice('@shadcn/'.length)} instead of ${dependency}`
    );

    if (dependency.startsWith('@plate/')) {
      const itemName = dependency.slice('@plate/'.length);

      assert(
        itemsByName.has(itemName),
        `Expected ${item.name} Plate dependency ${dependency} to reference a registry item`
      );

      continue;
    }

    if (
      dependency.startsWith('@') ||
      dependency.startsWith('/') ||
      dependency.startsWith('./') ||
      dependency.startsWith('../') ||
      ABSOLUTE_URL_REGEX.test(dependency)
    ) {
      continue;
    }

    assert(
      shadcnItemsByName.has(dependency),
      `Expected bare dependency ${dependency} in ${item.name} to be a shadcn registry item`
    );
  }
}

for (const item of publicRegistry.items) {
  for (const dependency of item.registryDependencies ?? []) {
    assert(
      !dependency.startsWith('@shadcn/'),
      `Expected public ${item.name} to use bare shadcn dependency ${dependency.slice('@shadcn/'.length)} instead of ${dependency}`
    );

    assert(
      !dependency.startsWith('@plate/'),
      `Expected public ${item.name} to use same-base URL dependency instead of ${dependency}`
    );

    if (dependency.startsWith(`${PLATE_PUBLIC_REGISTRY_BASE_URL}/`)) {
      const itemName = dependency
        .slice(`${PLATE_PUBLIC_REGISTRY_BASE_URL}/`.length)
        .replace(/\.json$/, '');

      assert(
        publicItemsByName.has(itemName),
        `Expected public ${item.name} Plate dependency ${dependency} to reference a registry item`
      );

      continue;
    }

    if (
      dependency.startsWith('@') ||
      dependency.startsWith('/') ||
      dependency.startsWith('./') ||
      dependency.startsWith('../') ||
      ABSOLUTE_URL_REGEX.test(dependency)
    ) {
      continue;
    }

    assert(
      shadcnItemsByName.has(dependency),
      `Expected public bare dependency ${dependency} in ${item.name} to be a shadcn registry item`
    );
  }
}

console.info('Registry source check passed.');
