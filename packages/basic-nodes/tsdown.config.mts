import { createPlatePackageConfig } from '../../tooling/config/tsdown.config.ts';

export default createPlatePackageConfig({
  additionalEntries: ['src/migrations/index.ts'],
  directDeclarations: true,
});
