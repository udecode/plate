import imageExtensions from 'image-extensions';
import { isUrl } from '../../../common/utils';

export const isImageUrl = (url: string) => {
  if (!isUrl(url)) return false;

  const ext = new URL(url).pathname.split('.').pop() as string;

  return imageExtensions.includes(ext);
};
