import type { Value } from 'platejs';

import { slateNodesToInsertDelta } from '@slate-yjs/core';
import * as Y from 'yjs';

/**
 * Produce the canonical "initial update" from a Slate node array using a
 * deterministically generated clientID based on guid and initialNodes.
 *
 * Every peer can call this _locally_ and get **bit‑identical** bytes, provided
 * `guid` and `initialNodes` are the same.
 */
export async function slateToDeterministicYjsState(
  guid: string, // use doc/room id
  initialNodes: Value // your template
): Promise<Uint8Array> {
  //  Generate clientID deterministically
  const deterministicClientId = await generateDeterministicClientId(
    guid,
    initialNodes
  );

  // 2Build the update in a temp doc with the deterministic clientID
  const tmp = new Y.Doc({ guid });
  tmp.clientID = deterministicClientId;

  const delta = slateNodesToInsertDelta(initialNodes);
  const content = tmp.get('content', Y.XmlText) as Y.XmlText;
  content.applyDelta(delta);
  const initialUpdate = Y.encodeStateAsUpdate(tmp);
  tmp.destroy();
  return initialUpdate;
}

// Helper to convert ArrayBuffer to a non-negative 31-bit integer + 1
function arrayBufferToClientId(buffer: ArrayBuffer): number {
  const dataView = new DataView(buffer);
  // Use the first 4 bytes (32 bits)
  const int32 = dataView.getInt32(0, false); // false for big-endian
  // Take absolute value, modulo 2^31 - 1 to fit in signed 31 bits, and add 1 to ensure non-zero.
  // (2**31 - 1 is 0x7FFFFFFF)
  return (Math.abs(int32) % 0x7f_ff_ff_ff) + 1;
}

/**
 * Generates a deterministic Yjs clientID based on a GUID and initial Slate
 * nodes using the Web Crypto API (SHA-256).
 */
async function generateDeterministicClientId(
  guid: string,
  initialNodes: Value
): Promise<number> {
  const nodesString = JSON.stringify(initialNodes);
  const combinedString = `${guid}-${nodesString}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(combinedString);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);

  return arrayBufferToClientId(hashBuffer);
}
