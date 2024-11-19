import type { FileRouter } from 'uploadthing/next';

import { createRouteHandler, createUploadthing } from 'uploadthing/next';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f(['image', 'text', 'blob', 'pdf', 'video', 'audio'])
    // Set permissions and file types for this FileRoute
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
    .middleware(async ({ req }) => {
      // This code runs on your server before upload

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return {};
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .onUploadComplete(({ file, metadata }) => {
      // This code RUNS ON YOUR SERVER after upload

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { file };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
