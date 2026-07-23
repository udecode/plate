import { createPlatePackageConfig } from '../../tooling/config/tsdown.config.ts';

export default createPlatePackageConfig({
  additionalEntries: [
    'src/internal/index.ts',
    'src/react/internal/index.ts',
    'src/react/test-entry.ts',
    'src/static/internal/index.ts',
  ],
  directDeclarations: true,
});
