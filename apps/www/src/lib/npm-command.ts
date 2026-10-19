import type { NpmCommands } from '@/types/unist';

export function getNpmCommands(command?: string): NpmCommands | null {
  const npmCommand = command?.trim();

  if (!npmCommand) {
    return null;
  }

  if (npmCommand.startsWith('npm install')) {
    return {
      __bunCommand__: npmCommand.replace('npm install', 'bun add'),
      __npmCommand__: npmCommand,
      __pnpmCommand__: npmCommand.replace('npm install', 'pnpm add'),
      __yarnCommand__: npmCommand.replace('npm install', 'yarn add'),
    };
  }

  if (npmCommand.startsWith('npx create-')) {
    return {
      __bunCommand__: npmCommand.replace('npx', 'bunx --bun'),
      __npmCommand__: npmCommand,
      __pnpmCommand__: npmCommand.replace('npx create-', 'pnpm create '),
      __yarnCommand__: npmCommand.replace('npx create-', 'yarn create '),
    };
  }

  if (npmCommand.startsWith('npm create')) {
    return {
      __bunCommand__: npmCommand.replace('npm create', 'bun create'),
      __npmCommand__: npmCommand,
      __pnpmCommand__: npmCommand.replace('npm create', 'pnpm create'),
      __yarnCommand__: npmCommand.replace('npm create', 'yarn create'),
    };
  }

  if (npmCommand.startsWith('npx')) {
    return {
      __bunCommand__: npmCommand.replace('npx', 'bunx --bun'),
      __npmCommand__: npmCommand,
      __pnpmCommand__: npmCommand.replace('npx', 'pnpm dlx'),
      __yarnCommand__: npmCommand.replace('npx', 'yarn dlx'),
    };
  }

  if (npmCommand.startsWith('npm run')) {
    return {
      __bunCommand__: npmCommand.replace('npm run', 'bun'),
      __npmCommand__: npmCommand,
      __pnpmCommand__: npmCommand.replace('npm run', 'pnpm'),
      __yarnCommand__: npmCommand.replace('npm run', 'yarn'),
    };
  }

  return null;
}
