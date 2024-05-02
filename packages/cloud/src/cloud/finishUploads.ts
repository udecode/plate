import { Value } from '@udecode/plate-common/server';
import delay from 'delay';

import { getInProgressUploads } from './getInProgressUploads';
import { FinishUploadsOptions, PlateCloudEditor } from './types';

const TEN_MINUTES = 1000 * 60 * 60;

/**
 * Finds all the in progress uploads and waits for them all to finish before
 * resolving the returned promise.
 *
 * Optionally, provide a `maxTimeoutInMs` and if the timeout is reached, the
 * method will return. This can be used if you only want to wait a certain
 * amount of time.
 */
export const finishUploads = async <V extends Value>(
  editor: PlateCloudEditor<V>,
  { maxTimeoutInMs = TEN_MINUTES }: FinishUploadsOptions = {}
): Promise<void> => {
  const uploads = editor.cloud.uploadStore.get.uploads();
  const uploadingOrigins = getInProgressUploads(editor.children, uploads);
  const finishPromises = uploadingOrigins.map((origin) => origin.finishPromise);
  const timeoutPromise = delay(maxTimeoutInMs, { value: 'timeout' });
  await Promise.race([Promise.all(finishPromises), timeoutPromise]);
};
