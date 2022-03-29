import { buildTestHarness } from 'slate-test-utils';
import { PlateTest } from '../../components/PlateTest';
import {
  createPlateEditor,
  CreatePlateEditorOptions,
} from '../../utils/createPlateEditor';

/**
 * `buildTestHarness` where:
 * - `Component`: `PlateTest`
 * - `editor`: `createPlateEditor`
 */
export const createPlateTestEditor = async (
  options: CreatePlateEditorOptions,
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
