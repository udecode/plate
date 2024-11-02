import type { Registry } from '@/registry/schema';

export const blocks: Registry = [
  {
    category: 'Editors',
    files: [
      {
        path: 'block/ai-editor/page.tsx',
        target: 'app/editor/page.tsx',
        type: 'registry:page',
      },
      {
        path: 'block/ai-editor/components/editor/ai-plugins.tsx',
        type: 'registry:component',
      },
      {
        path: 'block/ai-editor/components/editor/autoformat-plugin.ts',
        type: 'registry:component',
      },
      {
        path: 'block/ai-editor/components/editor/copilot-plugins.tsx',
        type: 'registry:component',
      },
      {
        path: 'block/ai-editor/components/editor/plate-editor.tsx',
        type: 'registry:component',
      },
      {
        path: 'block/ai-editor/components/editor/plate-types.ts',
        type: 'registry:component',
      },
      {
        path: 'block/ai-editor/components/editor/use-create-editor.tsx',
        type: 'registry:component',
      },
    ],
    name: 'ai-editor',
    registryDependencies: ['editor'],
    type: 'registry:block',
  },
  {
    category: 'Editors',
    files: [
      {
        path: 'block/basic-editor/page.tsx',
        target: 'app/editor/page.tsx',
        type: 'registry:page',
      },
      {
        path: 'block/basic-editor/components/editor/plate-editor.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-editor',
    registryDependencies: ['editor'],
    type: 'registry:block',
  },
];
