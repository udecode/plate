import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { TEditor } from '../types/slate/TEditor';
import { setPlatePlugins } from '../utils/setPlatePlugins';
import { createDeserializeHtmlPlugin } from './html-deserializer/createDeserializeHtmlPlugin';
import { createDeserializeAstPlugin } from './createDeserializeAstPlugin';
import { createEventEditorPlugin } from './createEventEditorPlugin';
import { createHistoryPlugin } from './createHistoryPlugin';
import { createInlineVoidPlugin } from './createInlineVoidPlugin';
import { createInsertDataPlugin } from './createInsertDataPlugin';
import { createReactPlugin } from './createReactPlugin';

export interface WithPlateOptions<T = {}> {
  /**
   * A unique id used to store the editor state by id.
   * Required if rendering multiple `Plate`. Optional otherwise.
   * Default is `'main'`.
   */
  id?: string | null;

  /**
   * Plate plugins.
   */
  plugins?: PlatePlugin<T>[];

  /**
   * If `true`, disable all the core plugins.
   * If an object, disable the core plugin properties that are `true` in the object.
   */
  disableCorePlugins?:
    | {
        deserializeAst?: boolean;
        deserializeHtml?: boolean;
        eventEditor?: boolean;
        inlineVoid?: boolean;
        insertData?: boolean;
        history?: boolean;
        react?: boolean;
      }
    | boolean;
}

/**
 * Apply `withInlineVoid` and all plate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: Plate options
 */
export const withPlate = <T = {}>(
  e: TEditor,
  { id = 'main', plugins = [], disableCorePlugins }: WithPlateOptions<T> = {}
): PlateEditor<T> => {
  let editor = (e as any) as PlateEditor<T>;

  editor.id = id as string;

  if (!editor.key) {
    editor.key = Math.random();
  }

  let allPlugins: PlatePlugin<T>[] = [];

  if (disableCorePlugins !== true) {
    if (typeof disableCorePlugins !== 'object') {
      allPlugins = [
        createReactPlugin(),
        createHistoryPlugin(),
        createEventEditorPlugin(),
        createInlineVoidPlugin(),
        createInsertDataPlugin(),
        createDeserializeAstPlugin(),
        createDeserializeHtmlPlugin(),
      ];
    } else {
      if (!disableCorePlugins.react) {
        allPlugins.push(createReactPlugin());
      }
      if (!disableCorePlugins.history) {
        allPlugins.push(createHistoryPlugin());
      }
      if (!disableCorePlugins.eventEditor) {
        allPlugins.push(createEventEditorPlugin());
      }
      if (!disableCorePlugins.inlineVoid) {
        allPlugins.push(createInlineVoidPlugin());
      }
      if (!disableCorePlugins.insertData) {
        allPlugins.push(createInsertDataPlugin());
      }
      if (!disableCorePlugins.deserializeAst) {
        allPlugins.push(createDeserializeAstPlugin());
      }
      if (!disableCorePlugins.deserializeHtml) {
        allPlugins.push(createDeserializeHtmlPlugin());
      }
    }
  }

  allPlugins = [...allPlugins, ...plugins];

  setPlatePlugins(editor, allPlugins);

  // withOverrides
  editor.plugins.forEach((plugin) => {
    if (plugin.withOverrides) {
      editor = plugin.withOverrides(editor, plugin);
    }
  });

  return editor;
};
