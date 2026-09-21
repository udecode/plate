import type { Registry } from 'shadcn/schema';

import { registryFeatures } from './registry-features';

const registryApi: Registry['items'] = [
  {
    dependencies: [
      '@ai-sdk/gateway@3',
      'platejs',
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
    dependencies: ['@ai-sdk/gateway@3', 'ai@6'],
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
    dependencies: ['files-sdk@2.6.0'],
    files: [{ path: 'lib/files.ts', type: 'registry:lib' }],
    name: 'files-api',
    registryDependencies: [],
    type: 'registry:lib',
    title: 'Files Gateway',
  },
  {
    dependencies: [
      '@aws-sdk/client-s3',
      '@aws-sdk/lib-storage',
      '@aws-sdk/s3-presigned-post',
      '@aws-sdk/s3-request-presigner',
      'files-sdk@2.6.0',
    ],
    description: 'Files SDK upload gateway backed by Cloudflare R2.',
    files: [
      {
        path: 'app/api/files/route.ts',
        target: 'app/api/files/route.ts',
        type: 'registry:file',
      },
    ],
    name: 'upload-r2',
    registryDependencies: ['@plate/files-api', '@plate/upload'],
    type: 'registry:file',
    title: 'Upload with R2',
    meta: { docs: [{ route: '/docs/upload' }] },
  },
  {
    dependencies: [
      '@aws-sdk/client-s3',
      '@aws-sdk/lib-storage',
      '@aws-sdk/s3-presigned-post',
      '@aws-sdk/s3-request-presigner',
      'files-sdk@2.6.0',
    ],
    description: 'Files SDK upload gateway backed by Amazon S3.',
    files: [
      {
        path: 'app/api/files/s3-route.ts',
        target: 'app/api/files/route.ts',
        type: 'registry:file',
      },
    ],
    name: 'upload-s3',
    registryDependencies: ['@plate/files-api', '@plate/upload'],
    type: 'registry:file',
    title: 'Upload with S3',
    meta: { docs: [{ route: '/docs/upload' }] },
  },
];

export const registryComponents: Registry['items'] = [
  ...registryFeatures,
  ...registryApi,
  {
    dependencies: ['platejs'],
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
    dependencies: ['@ai-sdk/react@3', 'platejs', 'ai@6', 'sonner'],
    files: [
      {
        path: 'components/editor/use-chat.ts',
        type: 'registry:component',
      },
    ],
    name: 'use-chat',
    registryDependencies: ['@plate/comment'],
    type: 'registry:component',
  },
];
