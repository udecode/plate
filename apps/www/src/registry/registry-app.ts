import type { Registry } from './schema';

export const registryApp: Registry = [
  {
    dependencies: ['@ai-sdk/openai', 'ai'],
    files: [
      {
        path: 'app/api/ai/command/route.ts',
        target: 'app/api/ai/command/route.ts',
        type: 'registry:block',
      },
      {
        path: 'app/api/ai/copilot/route.ts',
        target: 'app/api/ai/copilot/route.ts',
        type: 'registry:block',
      },
    ],
    name: 'api-ai',
    registryDependencies: ['use-chat'],
    type: 'registry:block',
  },
  {
    dependencies: ['uploadthing@7.2.0'],
    files: [
      {
        path: 'app/api/uploadthing/route.ts',
        target: 'app/api/uploadthing/route.ts',
        type: 'registry:block',
      },
    ],
    name: 'api-uploadthing',
    registryDependencies: [],
    type: 'registry:block',
  },
];
