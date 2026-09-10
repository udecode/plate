import React, { useInsertionEffect, useRef } from 'react';

import type { NodeKey, Path } from '../..';
import type { ExternalTextAdapter } from '../external-text';
import { useEditableDOMRuntime } from '../hooks/use-claim-editable-dom-commit';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

/** The stable noneditable host owns no canonical Text DOM. */
export const EditableExternalText = <TConfig,>({
  adapter,
  ariaLabel,
  config,
  elementKey,
  elementPath,
}: {
  adapter: ExternalTextAdapter<TConfig>;
  ariaLabel: string;
  config: TConfig;
  elementKey: NodeKey;
  elementPath: Path;
}) => {
  const runtime = useEditableDOMRuntime();
  const host = useRef<HTMLSpanElement>(null);
  const registration = useRef<{
    destroy: () => void;
    update: (config: TConfig) => void;
  } | null>(null);

  useInsertionEffect(() => {
    runtime?.externalText.invalidateProjections();
  });

  useIsomorphicLayoutEffect(() => {
    if (!runtime || !host.current) {
      throw new Error('Plite externalText must mount inside Editable.');
    }
    const mounted = runtime.externalText.register({
      adapter,
      config,
      elementKey,
      host: host.current,
    });
    registration.current = mounted;
    return () => {
      if (registration.current === mounted) registration.current = null;
      mounted.destroy();
    };
    // Config updates share the mounted view; only its adapter or owner replaces it.
  }, [adapter, elementKey, runtime]);
  useIsomorphicLayoutEffect(() => {
    registration.current?.update(config);
  });

  return (
    <span
      aria-label={ariaLabel}
      contentEditable={false}
      data-plite-external-text=""
      data-plite-external-text-path={elementPath.join(',')}
      ref={host}
      role="group"
      style={{ display: 'block' }}
    />
  );
};
