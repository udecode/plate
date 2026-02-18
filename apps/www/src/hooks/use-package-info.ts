import { atom, useAtom } from 'jotai';

export type PackageInfoType = {
  gzip: string;
  name: string;
  npm: string;
  source: string;
};

export const packageInfoAtom = atom<PackageInfoType>({
  gzip: '',
  name: '',
  npm: '',
  source: '',
});

export function usePackageInfo() {
  return useAtom(packageInfoAtom);
}
