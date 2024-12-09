import type { Registry } from './schema';

export const registryApp: Registry = [
  {
    dependencies: ['@ai-sdk/openai', 'ai'],
    files: [
      {
        path: 'app/api/ai/command/route.ts',
        target: 'app/api/ai/command/route.ts',
        type: 'registry:lib',
      },
      {
        path: 'app/api/ai/copilot/route.ts',
        target: 'app/api/ai/copilot/route.ts',
        type: 'registry:lib',
      },
    ],
    name: 'api-ai',
    registryDependencies: [],
    type: 'registry:lib',
  },
  {
    dependencies: ['uploadthing@7.2.0'],
    files: [
      {
        path: 'app/api/uploadthing/route.ts',
        target: 'app/api/uploadthing/route.ts',
        type: 'registry:lib',
      },
    ],
    name: 'api-uploadthing',
    registryDependencies: [],
    type: 'registry:lib',
  },
];
