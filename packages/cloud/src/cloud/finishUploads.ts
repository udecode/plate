import { Value } from '@udecode/plate-core';
import delay from 'delay';
import { getInProgressUploads } from './getInProgressUploads';
import { PlateCloudEditor, FinishUploadsOptions } from './types';

const TEN_MINUTES = 1000 * 60 * 60;

/**
 * Finds all the in progress uploads and waits for them all to finish before
 * resolving the returned promise.
 *
 * Optionally, provide a `maxTimeoutInMs` and if the timeout is reached, the
 * method will return. This can be used if you only want to wait a certain
 * amount of time.
 */
export async function finishUploads<V extends Value>(
  editor: PlateCloudEditor<V>,
  { maxTimeoutInMs = TEN_MINUTES }: FinishUploadsOptions = {}
): Promise<void> {
  const { uploads } = editor.cloud.useUploadStore.getState();
  const uploadingOrigins = getInProgressUploads(editor.children, uploads);
  const finishPromises = uploadingOrigins.map((origin) => origin.finishPromise);
  const timeoutPromise = delay(maxTimeoutInMs, { value: 'timeout' });
  await Promise.race([Promise.all(finishPromises), timeoutPromise]);
}
