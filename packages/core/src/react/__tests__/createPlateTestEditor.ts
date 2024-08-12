import type { RenderEditorReturnTuple } from 'slate-test-utils/dist/esm/buildTestHarness';

import { buildTestHarness } from 'slate-test-utils';

import type { CreateSlateEditorOptions, PlateEditor } from '../../lib';

import { PlateTest } from '../components/PlateTest';
import { createPlateEditor } from '../editor';

/**
 * `buildTestHarness` where:
 *
 * - `Component`: `PlateTest`
 * - `editor`: `createPlateEditor`
 */
export const createPlateTestEditor = async <
  E extends PlateEditor = PlateEditor,
>(
  options: NoInfer<CreateSlateEditorOptions>,
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
