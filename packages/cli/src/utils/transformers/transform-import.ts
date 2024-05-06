import type { Transformer } from '.';

// eslint-disable-next-line @typescript-eslint/require-await
export const transformImport: Transformer = async ({ config, sourceFile }) => {
  const importDeclarations = sourceFile.getImportDeclarations();

  for (const importDeclaration of importDeclarations) {
    const moduleSpecifier = importDeclaration.getModuleSpecifierValue();

    // Replace @/registry/[style] with the components alias.
    if (moduleSpecifier.startsWith('@/registry/')) {
      if (config.aliases['plate-ui']) {
        importDeclaration.setModuleSpecifier(
          moduleSpecifier.replace(
            /^@\/registry\/[^/]+\/plate-ui/,
            config.aliases['plate-ui']
          )
        );
      } else if (config.aliases.ui) {
        importDeclaration.setModuleSpecifier(
          moduleSpecifier.replace(
            /^@\/registry\/[^/]+\/plate-ui/,
            config.aliases.ui
          )
        );
      } else {
        importDeclaration.setModuleSpecifier(
          moduleSpecifier.replace(
            /^@\/registry\/[^/]+/,
            config.aliases.components
          )
        );
      }
    }
  }

  return sourceFile;
};
