import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';

// TypeScript 7 exposes its checker only under `typescript/unstable/*`, so this
// test compiles through the stable TypeScript 6 API.
import ts from '@typescript/typescript6';

const packageRoot = path.resolve(import.meta.dirname, '..');

const compileErrors = (calls: readonly string[]) => {
  const { config } = ts.readConfigFile(
    path.join(packageRoot, 'tsconfig.json'),
    ts.sys.readFile
  );
  const { options } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    packageRoot
  );
  const snippetPath = path.join(packageRoot, 'test/unknown-option-snippet.ts');
  const imports = [
    "import { createEditor } from 'plitejs';",
    "import { history } from 'plitejs/history';",
  ];
  const snippet = [...imports, ...calls].join('\n');
  const host = ts.createCompilerHost(options);
  const fileExists = host.fileExists.bind(host);
  const getSourceFile = host.getSourceFile.bind(host);

  host.fileExists = (fileName) =>
    fileName === snippetPath || fileExists(fileName);
  host.getSourceFile = (fileName, languageVersion, ...rest) =>
    fileName === snippetPath
      ? ts.createSourceFile(fileName, snippet, languageVersion)
      : getSourceFile(fileName, languageVersion, ...rest);

  const program = ts.createProgram(
    [snippetPath],
    { ...options, noEmit: true },
    host
  );

  return program
    .getSemanticDiagnostics(program.getSourceFile(snippetPath))
    .map((diagnostic) => ({
      call: calls[
        (diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start ?? 0)
          .line ?? 0) - imports.length
      ],
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    }));
};

describe('headless createEditor given an unknown option', () => {
  it('names the option in the compile error', () => {
    const calls = [
      'createEditor({ plugins: [history()], value: [] });',
      'createEditor({ readOnly: true, value: [] });',
    ];

    assert.deepEqual(
      compileErrors(calls).map(({ call, message }) => ({
        call,
        namesValue: message.includes("'value'"),
      })),
      calls.map((call) => ({ call, namesValue: true }))
    );
  });
});
