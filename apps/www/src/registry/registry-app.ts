import type { Registry } from './schema';

export const registryApp: Registry = [
  {
    dependencies: ['@ai-sdk/openai', 'ai'],
    files: ['app/api/ai/command/route.ts', 'app/api/ai/copilot/route.ts'],
    name: 'api-ai',
    registryDependencies: ['use-chat'],
    type: 'registry:app',
  },
  {
    dependencies: ['uploadthing@7.2.0'],
    files: ['app/api/uploadthing/route.ts'],
    name: 'api-uploadthing',
    registryDependencies: [],
    type: 'registry:app',
  },
];
