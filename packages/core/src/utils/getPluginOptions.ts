import { Value } from "../slate/editor/TEditor";
import { PlateEditor } from "../types/PlateEditor";
import { PluginKey } from "../types/plugins/PlatePluginKey";
import { getPlugin } from "./getPlugin";

export const getPluginOptions = <P, V extends Value = Value, T = {}>(
  editor: PlateEditor<V, T>,
  key: PluginKey
): P => getPlugin<P, V, T>(editor, key).options ?? ({} as P);
