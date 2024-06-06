// eslint-disable-next-line import/no-extraneous-dependencies
import type { PackageJson } from 'type-fest';

import fs from 'fs-extra';
import path from 'path';

/**
 * This is a simple utility that reads and returns the contents of your
 * project's package.json file.
 */
export function getPackageInfo() {
  const packageJsonPath = path.join('package.json');

  return fs.readJSONSync(packageJsonPath) as PackageJson;
}
