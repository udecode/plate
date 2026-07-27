import React from 'react';

import type { BasePluginInput, WithRequiredKey } from '../../../lib';

import {
  type InferConfig,
  type PlatePluginContext,
  getEditorPlugin,
} from '../../plugin';
import { useEditor } from './createPlateStore';

/** Get editor and plugin context. */
export function useEditorPlugin<P extends BasePluginInput>(
  p: WithRequiredKey<P>,
  id?: string
): PlatePluginContext<InferConfig<P>> {
  const editor = useEditor({ id });

  return React.useMemo(() => getEditorPlugin(editor, p), [editor, p]);
}
