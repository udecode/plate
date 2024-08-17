import type { Value } from '@udecode/slate';
import type { RenderEditorReturnTuple } from 'slate-test-utils/dist/esm/buildTestHarness';

import { buildTestHarness } from 'slate-test-utils';

import type { AnyPluginConfig, CorePlugin, InferPlugins } from '../../lib';
import type { TPlateEditor } from '../plugin';

import { PlateTest } from '../components/PlateTest';
import { type CreatePlateEditorOptions, createPlateEditor } from '../editor';

/**
 * `buildTestHarness` where:
 *
 * - `Component`: `PlateTest`
 * - `editor`: `createPlateEditor`
 */
export const createPlateTestEditor = async <
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
>(
  options: CreatePlateEditorOptions<V, P>,
  buildTestHarnessOptions?: Omit<
    Parameters<ReturnType<typeof buildTestHarness>>[0],
    'editor'
  >
): Promise<
  [
    TPlateEditor<V, InferPlugins<P[]>>,
    RenderEditorReturnTuple[1],
    RenderEditorReturnTuple[2],
  ]
> => {
  return buildTestHarness(PlateTest)({
    editor: createPlateEditor(options),
    ...buildTestHarnessOptions,
  }) as any;
};
