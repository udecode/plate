'use client';

import { useEffect, useRef } from 'react';

import {
  clientRuntimeEntrypointSpecifiers,
  exerciseClientRuntimeEntrypoints,
} from '../../runtime-entrypoint-proof.generated';

export default function RuntimeEntrypointsPage() {
  const messageRef = useRef<HTMLPreElement>(null);
  const proofRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const proofElement = proofRef.current;

    if (!proofElement) return;

    try {
      const results = exerciseClientRuntimeEntrypoints();

      proofElement.dataset.entrypointCount = String(results.length);
      proofElement.dataset.runtimeEntrypointProof = 'passed';
    } catch (error) {
      proofElement.dataset.runtimeEntrypointProof = 'failed';

      if (messageRef.current) {
        messageRef.current.hidden = false;
        messageRef.current.textContent =
          error instanceof Error ? error.message : String(error);
      }
    }
  }, []);

  return (
    <main
      ref={proofRef}
      data-entrypoint-count={clientRuntimeEntrypointSpecifiers.length}
      data-runtime-entrypoint-proof="pending"
    >
      <h1>Client runtime entrypoint proof</h1>
      <pre ref={messageRef} hidden />
    </main>
  );
}
