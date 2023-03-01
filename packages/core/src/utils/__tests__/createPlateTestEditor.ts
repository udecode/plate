import { buildTestHarness } from 'slate-test-utils';
import { RenderEditorReturnTuple } from 'slate-test-utils/dist/esm/buildTestHarness';
import { PlateTest } from '../../components/plate/PlateTest';
import { TEditor, Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import {
  createPlateEditor,
  CreatePlateEditorOptions,
} from '../plate/createPlateEditor';

/**
 * `buildTestHarness` where:
 * - `Component`: `PlateTest`
 * - `editor`: `createPlateEditor`
 */
export const createPlateTestEditor = async <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>
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
