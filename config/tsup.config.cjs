import { defineConfig } from 'tsup';
import ts from 'typescript';

const cwd = process.cwd();
const tsConfigPath = ts.findConfigFile(cwd, ts.sys.fileExists, 'tsconfig.json');
if (!tsConfigPath) {
  throw new Error(`tsconfig.json not found in the current directory! ${cwd}`);
}
const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
const tsConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, cwd);

export default defineConfig({
  entry: [...tsConfig.fileNames],
  outDir: 'dist',
  clean: true,
  bundle: false,
  format: ['esm', 'cjs'],
  sourcemap: tsConfig.options.sourceMap,
  target: tsConfig.raw?.compilerOptions?.target ?? 'es2020',
});
