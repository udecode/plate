import { resolve } from 'node:path';

import ts from 'typescript';

const packageRoot = process.env.FILES_SDK_PACKAGE_ROOT;
if (!packageRoot) {
  throw new Error(
    'Set FILES_SDK_PACKAGE_ROOT to the installed files-sdk 2.6.0 package'
  );
}

const appRoot = resolve(import.meta.dir, '../../..');
const configPath = resolve(appRoot, 'tsconfig.json');
const config = ts.getParsedCommandLineOfConfigFile(
  configPath,
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic(diagnostic) {
      throw new Error(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      );
    },
  }
);
if (!config) throw new Error('Could not parse the www tsconfig');

const entry = (subpath: string) =>
  resolve(packageRoot, 'dist', subpath, 'index.d.ts');
const options: ts.CompilerOptions = {
  ...config.options,
  incremental: false,
  paths: {
    ...config.options.paths,
    'files-sdk': [entry('')],
    'files-sdk/api': [entry('api')],
    'files-sdk/client': [entry('client')],
    'files-sdk/next': [entry('next')],
    'files-sdk/r2': [entry('r2')],
    'files-sdk/s3': [entry('s3')],
    'files-sdk/memory': [entry('memory')],
  },
};
const files = [
  resolve(import.meta.dir, 'files.ts'),
  resolve(import.meta.dir, 'files.gateway.test.ts'),
  resolve(appRoot, 'src/registry/app/api/files/route.ts'),
  resolve(appRoot, 'src/registry/app/api/files/s3-route.ts'),
];
const program = ts.createProgram(files, options);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getNewLine: () => ts.sys.newLine,
    })
  );
  process.exitCode = 1;
}
