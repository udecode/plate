import { buildTestHarness } from 'slate-test-utils';
import { PlateTest } from '../../components/PlateTest';
import { TEditor, Value } from '../../slate/editor/TEditor';
import {
  createPlateEditor,
  CreatePlateEditorOptions,
} from '../../utils/createPlateEditor';

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
) => {
  return buildTestHarness(PlateTest)({
    editor: createPlateEditor(options),
    ...buildTestHarnessOptions,
  });
};
