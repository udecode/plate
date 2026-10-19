import { createPlatePackageConfig } from '../../tooling/config/tsdown.config.ts';
import { plateAdditionalEntries } from './tsdown.config.mts';

export default createPlatePackageConfig({
  additionalEntries: [...plateAdditionalEntries],
  bundleDeclarationDependencies: [
    /^mdast-util-to-markdown(?:\/|$)/,
    /^plitejs(?:\/|$)/,
  ],
  declarationsOnly: true,
});
