import { resolve } from 'node:path';

const packageRoot = process.env.FILES_SDK_PACKAGE_ROOT;
if (!packageRoot) {
  throw new Error(
    'Set FILES_SDK_PACKAGE_ROOT to the installed files-sdk 2.6.0 package'
  );
}

const output = resolve(import.meta.dir, '.files.gateway.test-bundle.js');
const built = await Bun.build({
  entrypoints: [resolve(import.meta.dir, 'files.gateway.test.ts')],
  target: 'bun',
  plugins: [
    {
      name: 'installed-files-sdk',
      setup(build) {
        build.onResolve({ filter: /^files-sdk(?:\/.*)?$/ }, ({ path }) => {
          const subpath =
            path === 'files-sdk' ? '' : path.slice('files-sdk/'.length);
          return { path: resolve(packageRoot, 'dist', subpath, 'index.js') };
        });
      },
    },
  ],
});

if (!built.success) {
  for (const log of built.logs) console.error(log);
  process.exit(1);
}

try {
  await Bun.write(output, built.outputs[0]);
  const test = Bun.spawn(['bun', 'test', output], {
    stdout: 'inherit',
    stderr: 'inherit',
  });
  process.exitCode = await test.exited;
} finally {
  await Bun.file(output).delete();
}
