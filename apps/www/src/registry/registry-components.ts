import type { Registry } from 'shadcn/registry';

import { registryKits } from './registry-kits';

const registryApi: Registry['items'] = [
  {
    dependencies: [
      '@ai-sdk/openai',
      'ai',
      '@ai-sdk/provider',
      '@ai-sdk/provider-utils',
    ],
    files: [
      {
        path: 'app/api/ai/command/route.ts',
        target: 'app/api/ai/command/route.ts',
        type: 'registry:file',
      },
    ],
    name: 'ai-api',
    registryDependencies: ['copilot-api'],
    type: 'registry:file',
  },
  {
    dependencies: ['@ai-sdk/openai', 'ai'],
    files: [
      {
        path: 'app/api/ai/copilot/route.ts',
        target: 'app/api/ai/copilot/route.ts',
        type: 'registry:file',
      },
    ],
    name: 'copilot-api',
    registryDependencies: [],
    type: 'registry:file',
  },
  {
    dependencies: ['uploadthing@7.7.2'],
    files: [
      {
        path: 'app/api/uploadthing/route.ts',
        target: 'app/api/uploadthing/route.ts',
        type: 'registry:file',
      },
    ],
    name: 'media-uploadthing-api',
    registryDependencies: ['uploadthing'],
    type: 'registry:file',
  },
];

export const registryComponents: Registry['items'] = [
  ...registryKits,
  ...registryApi,
  {
    dependencies: ['@udecode/plate-ai'],
    files: [
      {
        path: 'components/editor/settings-dialog.tsx',
        type: 'registry:component',
      },
    ],
    name: 'settings-dialog',
    registryDependencies: [
      'ai-kit',
      'shadcn/button',
      'shadcn/command',
      'shadcn/dialog',
      'shadcn/input',
      'shadcn/popover',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@ai-sdk/react', '@faker-js/faker'],
    files: [
      {
        path: 'components/editor/use-chat.ts',
        type: 'registry:component',
      },
    ],
    name: 'use-chat',
    registryDependencies: ['ai-kit'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-callout',
      '@udecode/plate-code-block',
      '@udecode/plate-date',
      '@udecode/plate-toc',
      '@udecode/plate-layout',
      '@udecode/plate-link',
      '@udecode/plate-math',
      '@udecode/plate-media',
      '@udecode/plate-table',
    ],
    files: [
      {
        path: 'components/editor/transforms.ts',
        type: 'registry:component',
      },
    ],
    name: 'transforms',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-comments',
      '@udecode/plate-excalidraw',
      '@udecode/plate-link',
      '@udecode/plate-media',
      '@udecode/plate-mention',
      '@udecode/plate-table',
      '@udecode/plate-toggle',
    ],
    files: [
      {
        path: 'components/editor/plate-types.ts',
        type: 'registry:component',
      },
    ],
    name: 'plate-types',
    type: 'registry:component',
  },
];
