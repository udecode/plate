import { Value } from "../slate/editor/TEditor";
import { PlateEditor } from "../types/PlateEditor";
import { PluginKey } from "../types/plugins/PlatePluginKey";
import { getPlugin } from "./getPlugin";

export const getPluginInjectProps = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  key: PluginKey
) => getPlugin<{}, V, T>(editor, key).inject?.props ?? {};
