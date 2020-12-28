import { isUrl } from "@udecode/slate-plugins-common";
import imageExtensions from "image-extensions";

export const isImageUrl = (url: string) => {
  if (!isUrl(url)) return false;

  const ext = new URL(url).pathname.split(".").pop() as string;

  return imageExtensions.includes(ext);
};
