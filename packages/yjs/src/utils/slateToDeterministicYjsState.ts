import type { Value } from '@udecode/plate';

import { slateNodesToInsertDelta } from '@slate-yjs/core';
import * as Y from 'yjs';

/**
 * Produce the canonical "initial update" from a Slate node array.
 *
 * Every peer can call this _locally_ and get **bit‑identical** bytes, provided
 * `guid` and `initialNodes` are the same.
 *
 * Note: A more elegant solution would be to use a hash of the initialNodes to
 * determine the clientID.
 */
export function slateToDeterministicYjsState(
  guid: string, // use doc/room id
  initialNodes: Value // your template  // TODO: type
): Uint8Array {
  // 1️⃣ Build in a temp doc that has a stable clientID
  const tmp = new Y.Doc({ guid });
  tmp.clientID = -1;
  const delta = slateNodesToInsertDelta(initialNodes);
  const content = tmp.get('content', Y.XmlText) as Y.XmlText;
  content.applyDelta(delta);
  const initialUpdate = Y.encodeStateAsUpdate(tmp);
  tmp.destroy();
  return initialUpdate;
}
