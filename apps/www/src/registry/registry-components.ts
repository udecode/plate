import type { Registry } from 'shadcn/schema';

import { registryFeatures } from './registry-features';

const registryApi: Registry['items'] = [
  {
    dependencies: [
      '@ai-sdk/gateway',
      '@platejs/ai',
      '@platejs/markdown',
      '@platejs/table',
      '@platejs/utils',
      'ai@6',
      'dedent@1.0.0',
      'zod',
    ],
    files: [
      {
        path: 'app/api/ai/command/route.ts',
        target: 'app/api/ai/command/route.ts',
        type: 'registry:file',
      },
      {
        path: 'app/api/ai/command/utils.ts',
        target: 'app/api/ai/command/utils.ts',
        type: 'registry:file',
      },
      {
        path: 'app/api/ai/command/prompt/index.ts',
        target: 'app/api/ai/command/prompt/index.ts',
        type: 'registry:file',
      },
      {
        path: 'app/api/ai/command/prompt/common.ts',
        target: 'app/api/ai/command/prompt/common.ts',
        type: 'registry:file',
      },
      {
        path: 'app/api/ai/command/prompt/getChooseToolPrompt.ts',
        target: 'app/api/ai/command/prompt/getChooseToolPrompt.ts',
        type: 'registry:file',
      },
      {
        path: 'app/api/ai/command/prompt/getCommentPrompt.ts',
        target: 'app/api/ai/command/prompt/getCommentPrompt.ts',
        type: 'registry:file',
      },
      {
        path: 'app/api/ai/command/prompt/getEditPrompt.ts',
        target: 'app/api/ai/command/prompt/getEditPrompt.ts',
        type: 'registry:file',
      },
      {
        path: 'app/api/ai/command/prompt/getEditTablePrompt.ts',
        target: 'app/api/ai/command/prompt/getEditTablePrompt.ts',
        type: 'registry:file',
      },
      {
        path: 'app/api/ai/command/prompt/getGeneratePrompt.ts',
        target: 'app/api/ai/command/prompt/getGeneratePrompt.ts',
        type: 'registry:file',
      },
    ],
    name: 'ai-api',
    registryDependencies: [
      '@plate/copilot-api',
      '@plate/editor-static',
      '@plate/markdown-joiner-transform',
      '@plate/use-chat',
      '@plate/editor-plugins-static',
    ],
    type: 'registry:file',
  },
  {
    dependencies: ['ai@6'],
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
    dependencies: ['uploadthing@7.7.4'],
    files: [
      {
        path: 'app/api/uploadthing/route.ts',
        target: 'app/api/uploadthing/route.ts',
        type: 'registry:file',
      },
    ],
    name: 'media-uploadthing-api',
    registryDependencies: ['@plate/uploadthing'],
    type: 'registry:file',
  },
];

export const registryComponents: Registry['items'] = [
  ...registryFeatures,
  ...registryApi,
  {
    dependencies: ['@platejs/ai'],
    files: [
      {
        path: 'components/editor/settings-dialog.tsx',
        type: 'registry:component',
      },
    ],
    name: 'settings-dialog',
    registryDependencies: [
      '@plate/ai',
      'button',
      'command',
      'dialog',
      'input',
      'popover',
      '@plate/use-chat',
    ],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@ai-sdk/react@3',
      '@faker-js/faker',
      '@platejs/ai',
      '@platejs/comment',
      '@platejs/markdown',
      '@platejs/plite',
      '@platejs/selection',
      '@platejs/table',
      'ai@6',
    ],
    files: [
      {
        path: 'components/editor/use-chat.ts',
        type: 'registry:component',
      },
    ],
    name: 'use-chat',
    registryDependencies: ['@plate/discussion'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@platejs/basic-nodes',
      '@platejs/callout',
      '@platejs/code-block',
      '@platejs/code-drawing',
      '@platejs/date',
      '@platejs/excalidraw',
      '@platejs/footnote',
      '@platejs/layout',
      '@platejs/link',
      '@platejs/math',
      '@platejs/media',
      '@platejs/plite',
      '@platejs/suggestion',
      '@platejs/table',
      '@platejs/toc',
      '@platejs/utils',
    ],
    files: [
      {
        path: 'components/editor/transforms.ts',
        type: 'registry:component',
      },
    ],
    name: 'transforms',
    registryDependencies: ['@plate/link'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@platejs/callout',
      '@platejs/code-block',
      '@platejs/date',
      '@platejs/footnote',
      '@platejs/layout',
      '@platejs/link',
      '@platejs/list-classic',
      '@platejs/math',
      '@platejs/media',
      '@platejs/plite',
      '@platejs/suggestion',
      '@platejs/table',
      '@platejs/toc',
      '@platejs/utils',
    ],
    files: [
      {
        path: 'components/editor/transforms-classic.ts',
        type: 'registry:component',
      },
    ],
    name: 'transforms-classic',
    registryDependencies: ['@plate/link'],
    type: 'registry:component',
  },
];
