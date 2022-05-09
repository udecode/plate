import { PlateProps } from '../components/Plate';
import {
  createDeserializeAstPlugin,
  KEY_DESERIALIZE_AST,
} from '../plugins/createDeserializeAstPlugin';
import {
  createEventEditorPlugin,
  KEY_EVENT_EDITOR,
} from '../plugins/createEventEditorPlugin';
import { createHistoryPlugin } from '../plugins/createHistoryPlugin';
import {
  createInlineVoidPlugin,
  KEY_INLINE_VOID,
} from '../plugins/createInlineVoidPlugin';
import {
  createInsertDataPlugin,
  KEY_INSERT_DATA,
} from '../plugins/createInsertDataPlugin';
import { createReactPlugin } from '../plugins/createReactPlugin';
import {
  createDeserializeHtmlPlugin,
  KEY_DESERIALIZE_HTML,
} from '../plugins/html-deserializer/createDeserializeHtmlPlugin';
import { Value } from '../slate/editor/TEditor';
import { TReactEditor } from '../slate/react-editor/TReactEditor';
import { isText } from '../slate/text/isText';
import { MarksOf } from '../slate/text/TText';
import { getPlateActions } from '../stores/plate/platesStore';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { createTEditor } from './createTEditor';
import { flattenDeepPlugins } from './flattenDeepPlugins';
import { overridePluginsByKey } from './overridePluginsByKey';

type FormattedText = {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  underline?: boolean;
  text: string;
};

type BulletedList = {
  type: 'bulleted-list';
  children: ListItem[];
};

type HeadingThree = {
  type: 'heading-three';
  children: FormattedText[];
};

type Image = {
  type: 'image';
  url: string;
  children: [FormattedText];
};

type Link = {
  type: 'link';
  url: string;
  children: FormattedText[];
};

type ListItem = {
  type: 'list-item';
  children: (Link | FormattedText)[];
};

type NumberedList = {
  type: 'numbered-list';
  children: ListItem[];
};

export type Paragraph = {
  type: 'paragraph';
  children: (Link | FormattedText)[];
};

type Quote = {
  type: 'quote';
  children: (Link | FormattedText)[];
};

export type MyElements =
  | Paragraph
  | Quote
  | Image
  | HeadingThree
  | BulletedList
  | NumberedList;

export type MyValue = MyElements[];

type MyEditor = TReactEditor<MyValue>;

export type MyMarks = MarksOf<MyEditor>;

const myeditor = createTEditor<MyValue>();

myeditor.insertFragment([
  {
    text: 'a',
    bold: true,
  },
]);

const element = myeditor.children[0];
const text = element.children[0];
if (isText(text)) {
  // text.
}

/**
 * Flatten deep plugins then set editor.plugins and editor.pluginsByKey
 */
export const setPlatePlugins = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  {
    disableCorePlugins,
    plugins: _plugins = [],
  }: Pick<PlateProps<V, T>, 'plugins' | 'disableCorePlugins'>
) => {
  let plugins: PlatePlugin<V, T>[] = [];

  if (disableCorePlugins !== true) {
    const dcp = disableCorePlugins;

    if (typeof dcp !== 'object' || !dcp.react) {
      plugins.push((editor.pluginsByKey?.react as any) ?? createReactPlugin());
    }
    if (typeof dcp !== 'object' || !dcp.history) {
      plugins.push(
        (editor.pluginsByKey?.history as any) ?? createHistoryPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.eventEditor) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_EVENT_EDITOR] as any) ??
          createEventEditorPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.inlineVoid) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_INLINE_VOID] as any) ??
          createInlineVoidPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.insertData) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_INSERT_DATA] as any) ??
          createInsertDataPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.deserializeHtml) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_DESERIALIZE_HTML] as any) ??
          createDeserializeHtmlPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.deserializeAst) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_DESERIALIZE_AST] as any) ??
          createDeserializeAstPlugin()
      );
    }
  }

  plugins = [...plugins, ..._plugins];

  editor.plugins = [];
  editor.pluginsByKey = {};

  flattenDeepPlugins(editor, plugins);

  // override all the plugins one by one, so plugin.overrideByKey effects can be overridden by the next plugin
  editor.plugins.forEach((plugin) => {
    if (plugin.overrideByKey) {
      const newPlugins = editor.plugins.map((p) => {
        return overridePluginsByKey<V, T, {}>(
          p as any,
          plugin.overrideByKey as any
        );
      });

      editor.plugins = [];
      editor.pluginsByKey = {};

      // flatten again the overrides
      flattenDeepPlugins<V, T>(editor, newPlugins);
    }
  });

  getPlateActions(editor.id).incrementKey('keyPlugins');
};
