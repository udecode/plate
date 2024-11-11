import type { OurFileRouter } from '@/app/api/uploadthing/core';

import { generateReactHelpers } from '@uploadthing/react';

export const { uploadFiles, useUploadThing } =
  generateReactHelpers<OurFileRouter>();
