import type { AnyPluginConfig, EditorPluginContext } from '../../lib';
import type { CurrentRuntimeEditorTransforms } from '../currentRuntimeBridge';

import { getCurrentRuntimeTransforms } from '../currentRuntimeBridge';

type LegacyTransformRecord = CurrentRuntimeEditorTransforms &
  Record<string, any>;

export type LegacyTransformOverride<
  C extends AnyPluginConfig = AnyPluginConfig,
> = (
  ctx: EditorPluginContext<C> & {
    tf: LegacyTransformRecord;
  }
) => {
  api?: any;
  tf?: Partial<LegacyTransformRecord>;
};

export const withLegacyTransformOverride = <
  C extends AnyPluginConfig,
  P extends { overrideEditor?: (extension: any) => any },
>(
  plugin: P,
  extension: LegacyTransformOverride<C>
): P => {
  const wrappedExtension = (ctx: EditorPluginContext<C>) =>
    extension({
      ...ctx,
      tf: getCurrentRuntimeTransforms(ctx.editor) as LegacyTransformRecord,
    });

  (
    wrappedExtension as typeof wrappedExtension & {
      __legacyTransformSource?: LegacyTransformOverride<C>;
    }
  ).__legacyTransformSource = extension;

  const nextPlugin = (plugin.overrideEditor?.(wrappedExtension) ??
    plugin) as P & {
    __apiExtensions?: Array<{
      source?: LegacyTransformOverride<C>;
      isTransform?: boolean;
    }>;
  };

  const apiExtensions = nextPlugin.__apiExtensions ?? [];
  const lastExtension = apiExtensions.at(-1);

  if (lastExtension) {
    lastExtension.isTransform = true;
    lastExtension.source = extension;
  }

  return nextPlugin;
};
