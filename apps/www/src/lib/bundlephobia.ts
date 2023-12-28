import fetch from 'node-fetch';

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  );
}

export async function getPackageData(name: string) {
  // export async function getPackageData(name, version) {
  const bundlephobiaResponse = await fetch(
    // `https://bundlephobia.com/api/size?package=@udecode/${name}@${version}`
    `https://bundlephobia.com/api/size?package=@udecode/${name}`
  );
  // sometimes we get an empty response body
  try {
    return (await bundlephobiaResponse.json()) as any;
  } catch (error) {
    return {};
  }
}
