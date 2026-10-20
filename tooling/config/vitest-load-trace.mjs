import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const loadTrace = () => {
  const traceDir = process.env.TEST_LOAD_TRACE_DIR;

  if (!traceDir) return null;

  // Vitest can load its config more than once in one process.
  const trace = path.join(traceDir, `vitest-${process.pid}-${randomUUID()}`);
  const ids = new Set();

  fs.writeFileSync(`${trace}.start`, '');
  process.on('exit', () =>
    fs.writeFileSync(`${trace}.json`, JSON.stringify([...ids]))
  );

  return {
    enforce: 'pre',
    name: 'load-trace',
    configResolved(config) {
      // Vite bundles the config's own imports without the transform hook.
      for (const file of config.configFileDependencies) ids.add(file);

      const experimental = config.test?.experimental ?? {};

      if (
        experimental.fsModuleCache ||
        experimental.viteModuleRunner === false
      ) {
        throw new Error(
          'experimental.fsModuleCache and experimental.viteModuleRunner: false load modules without the transform hook, so the load trace would miss them'
        );
      }
    },
    transform(_code, id) {
      ids.add(id);
    },
  };
};
