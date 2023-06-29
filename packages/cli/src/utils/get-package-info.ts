import path from 'path';
import fs from 'fs-extra';
import { type PackageJson } from 'type-fest';

/**
 * This is a simple utility that reads and returns the contents of your
 * project's package.json file.
 */
export function getPackageInfo() {
  const packageJsonPath = path.join('package.json');

  return fs.readJSONSync(packageJsonPath) as PackageJson;
}
