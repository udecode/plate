import type { FileRouter } from 'uploadthing/next';

import { createUploadthing } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  editorUploader: f(['image', 'text', 'blob', 'pdf', 'video', 'audio'])
    .middleware(() => {
      return {};
    })
    .onUploadComplete(({ file }) => {
      return {
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
