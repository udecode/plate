import { createRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from '@/lib/uploadthing';

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
