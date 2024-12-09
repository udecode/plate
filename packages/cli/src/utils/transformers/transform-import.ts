import type { Config } from '@/src/utils/get-config';
import type { Transformer } from '@/src/utils/transformers';

export const transformImport: Transformer = async ({ config, sourceFile }) => {
  const importDeclarations = sourceFile.getImportDeclarations();

  for (const importDeclaration of importDeclarations) {
    const moduleSpecifier = updateImportAliases(
      importDeclaration.getModuleSpecifierValue(),
      config
    );

    importDeclaration.setModuleSpecifier(moduleSpecifier);

    // Replace `import { cn } from "@/lib/utils"`
    if (moduleSpecifier == '@/lib/utils') {
      const namedImports = importDeclaration.getNamedImports();
      const cnImport = namedImports.find((i) => i.getName() === 'cn');

      if (cnImport) {
        importDeclaration.setModuleSpecifier(
          moduleSpecifier.replace(/^@\/lib\/utils/, config.aliases.utils)
        );
      }
    }
  }

  return sourceFile;
};

function updateImportAliases(moduleSpecifier: string, config: Config) {
  // Not a local import.
  if (!moduleSpecifier.startsWith('@/')) {
    return moduleSpecifier;
  }
  // Not a registry import.
  if (!moduleSpecifier.startsWith('@/registry/')) {
    // We fix the alias and return.
    const alias = config.aliases.components.split('/')[0];

    return moduleSpecifier.replace(/^@\//, `${alias}/`);
  }
  if (/^@\/registry\/(.+)\/ui/.exec(moduleSpecifier)) {
    return moduleSpecifier.replace(
      /^@\/registry\/(.+)\/ui/,
      config.aliases.ui ?? `${config.aliases.components}/ui`
    );
  }
  if (
    config.aliases.components &&
    /^@\/registry\/(.+)\/components/.exec(moduleSpecifier)
  ) {
    return moduleSpecifier.replace(
      /^@\/registry\/(.+)\/components/,
      config.aliases.components
    );
  }
  if (config.aliases.lib && /^@\/registry\/(.+)\/lib/.exec(moduleSpecifier)) {
    return moduleSpecifier.replace(
      /^@\/registry\/(.+)\/lib/,
      config.aliases.lib
    );
  }
  if (
    config.aliases.hooks &&
    /^@\/registry\/(.+)\/hooks/.exec(moduleSpecifier)
  ) {
    return moduleSpecifier.replace(
      /^@\/registry\/(.+)\/hooks/,
      config.aliases.hooks
    );
  }

  return moduleSpecifier.replace(
    /^@\/registry\/[^/]+/,
    config.aliases.components
  );
}
