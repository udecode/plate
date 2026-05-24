const absoluteUrlPattern = /^https?:\/\//;

export function getRegistryItemSpecifier(name: string) {
  const item = name.trim();

  if (
    item.startsWith('@') ||
    item.startsWith('/') ||
    item.startsWith('./') ||
    item.startsWith('../') ||
    absoluteUrlPattern.test(item)
  ) {
    return item;
  }

  return `@plate/${item}`;
}

export function getRegistryInstallCommand(name: string) {
  return `npx shadcn@latest add ${getRegistryItemSpecifier(name)}`;
}
