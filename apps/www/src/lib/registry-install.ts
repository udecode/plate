import { PLATE_REGISTRY_NAMESPACE } from '@/lib/plate-registry-config';

const absoluteUrlPattern = /^https?:\/\//;
const localRegistryUrl = 'http://localhost:3000/rd/';
const plateRegistrySpecifierPattern = /^@plate\/(.+)$/;

function getPlateRegistryItemName(item: string) {
  return item.match(plateRegistrySpecifierPattern)?.[1] ?? item;
}

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

  return `${PLATE_REGISTRY_NAMESPACE}/${item}`;
}

export function getRegistryClipboardItemSpecifier(name: string) {
  const item = name.trim();

  if (process.env.NODE_ENV !== 'development') {
    return getRegistryItemSpecifier(item);
  }

  if (
    item.startsWith('/') ||
    item.startsWith('./') ||
    item.startsWith('../') ||
    absoluteUrlPattern.test(item)
  ) {
    return item;
  }

  return `${localRegistryUrl}${getPlateRegistryItemName(item)}`;
}

export function getRegistryInstallCommand(name: string) {
  return `npx shadcn@latest add ${getRegistryItemSpecifier(name)}`;
}

export function getRegistryClipboardInstallCommand(name: string) {
  return `npx shadcn@latest add ${getRegistryClipboardItemSpecifier(name)}`;
}
