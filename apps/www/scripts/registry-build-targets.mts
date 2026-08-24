export const REGISTRY_HOMEPAGE = 'https://platejs.org';
const DEFAULT_STYLE = 'new-york';

export interface RegistryBuildTarget {
  outputDir: string;
  registryBaseUrl: string;
  registryFile: string;
  style: string;
}

export function getRegistryBuildTargets({
  dev,
  styles,
}: {
  dev: boolean;
  styles: readonly string[];
}): [RegistryBuildTarget, ...RegistryBuildTarget[]] {
  const outputRoot = dev ? 'public/rd' : 'public/r';
  const registryRootUrl = dev
    ? 'http://localhost:3000/rd'
    : `${REGISTRY_HOMEPAGE}/r`;

  return [
    {
      outputDir: outputRoot,
      registryBaseUrl: registryRootUrl,
      registryFile: `${outputRoot}/registry.json`,
      style: DEFAULT_STYLE,
    },
    ...styles.map((style) => ({
      outputDir: `${outputRoot}/${style}`,
      registryBaseUrl: `${registryRootUrl}/${style}`,
      registryFile: `${outputRoot}/${style}/registry.json`,
      style,
    })),
  ];
}
