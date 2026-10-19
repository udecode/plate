import { r2 } from 'files-sdk/r2';

import { createFilesRoute, requireFilesEnv } from '../../../lib/files';

export const runtime = 'nodejs';

const route = createFilesRoute(() =>
  r2({
    bucket: requireFilesEnv('FILES_R2_BUCKET'),
    accountId: requireFilesEnv('FILES_R2_ACCOUNT_ID'),
    accessKeyId: requireFilesEnv('FILES_R2_ACCESS_KEY_ID'),
    secretAccessKey: requireFilesEnv('FILES_R2_SECRET_ACCESS_KEY'),
  })
);
const { GET, POST, PUT } = route;

export { GET, POST, PUT };
