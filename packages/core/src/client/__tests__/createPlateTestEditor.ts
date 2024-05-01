import type { TEditor, Value } from '@udecode/slate';
import type { RenderEditorReturnTuple } from 'slate-test-utils/dist/esm/buildTestHarness';

import { buildTestHarness } from 'slate-test-utils';

import { PlateTest } from '../components/PlateTest';
import {
  type CreatePlateEditorOptions,
  createPlateEditor,
} from '../utils/createPlateEditor';

/**
 * `buildTestHarness` where:
 *
 * - `Component`: `PlateTest`
 * - `editor`: `createPlateEditor`
 */
export const createPlateTestEditor = async <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
>(
  options: CreatePlateEditorOptions<V, E>,
  buildTestHarnessOptions?: Omit<
    Parameters<ReturnType<typeof buildTestHarness>>[0],
    'editor'
  >
): Promise<[E, RenderEditorReturnTuple[1], RenderEditorReturnTuple[2]]> => {
  return buildTestHarness(PlateTest)({
    editor: createPlateEditor(options),
    ...buildTestHarnessOptions,
  }) as any;
};
