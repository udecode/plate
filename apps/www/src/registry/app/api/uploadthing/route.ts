import { createRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from '@/registry/lib/uploadthing';

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
