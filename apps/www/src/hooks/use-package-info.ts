import { atom, useAtom } from 'jotai';

export type PackageInfoType = {
  name: string;
  gzip: string;
  source: string;
  npm: string;
};

export const packageInfoAtom = atom<PackageInfoType>({
  name: '',
  gzip: '',
  source: '',
  npm: '',
});

export function usePackageInfo() {
  return useAtom(packageInfoAtom);
}
