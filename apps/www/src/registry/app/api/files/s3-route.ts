import { s3 } from 'files-sdk/s3';

import { createFilesRoute, requireFilesEnv } from '../../../lib/files';

export const runtime = 'nodejs';

const route = createFilesRoute(() =>
  s3({
    bucket: requireFilesEnv('FILES_S3_BUCKET'),
    region: requireFilesEnv('FILES_S3_REGION'),
  })
);
const { GET, POST, PUT } = route;

export { GET, POST, PUT };
