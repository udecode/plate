#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (isMainModule()) {
  const tags = getPublishedPackageTags(process.env.PUBLISHED_PACKAGES ?? '');

  if (tags.length === 0) {
    console.error('No published package tags found in PUBLISHED_PACKAGES.');
    process.exit(1);
  }

  console.log(tags.join('\n'));
}

function isMainModule() {
  return (
    !!process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  );
}

export function getPublishedPackageTags(value) {
  let packages;

  try {
    packages = JSON.parse(value);
  } catch {
    return [];
  }

  if (!Array.isArray(packages)) return [];

  return packages
    .filter(
      (packageInfo) =>
        typeof packageInfo?.name === 'string' &&
        typeof packageInfo?.version === 'string' &&
        packageInfo.name.length > 0 &&
        packageInfo.version.length > 0
    )
    .map((packageInfo) => `${packageInfo.name}@${packageInfo.version}`);
}
