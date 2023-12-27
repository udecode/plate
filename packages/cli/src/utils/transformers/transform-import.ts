import { Transformer } from '.';

export const transformImport: Transformer = async ({ sourceFile, config }) => {
  const importDeclarations = sourceFile.getImportDeclarations();

  for (const importDeclaration of importDeclarations) {
    const moduleSpecifier = importDeclaration.getModuleSpecifierValue();

    // Replace @/registry/[style] with the components alias.
    if (moduleSpecifier.startsWith('@/registry/')) {
      importDeclaration.setModuleSpecifier(
        moduleSpecifier.replace(
          /^@\/registry\/[^/]+/,
          config.aliases.components
        )
      );
    }
  }

  return sourceFile;
};
