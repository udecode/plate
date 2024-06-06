import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../types/PlateEditor';
import type { PluginKey } from '../types/plugin/PlatePluginKey';

import { getPlugin } from './getPlugin';

export const getPluginInjectProps = <V extends Value>(
  editor: PlateEditor<V>,
  key: PluginKey
) => getPlugin<{}, V>(editor, key).inject?.props ?? {};
