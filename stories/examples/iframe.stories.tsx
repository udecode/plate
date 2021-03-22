import React, { useCallback } from 'react';
import {
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  HeadingToolbar,
  useBasicElementPlugins,
  useBasicMarkPlugins,
  useHistoryPlugin,
  useReactPlugin,
  useSlatePlugins,
  useSlatePluginsEditor,
} from '@udecode/slate-plugins';
import { Editable, ReactEditor, Slate } from 'slate-react';
import { initialValueIframe } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { ToolbarButtonsBasicMarks } from '../config/Toolbars';
import { EDITABLE_VOID } from './editable-voids/defaults';
import { EditableVoidElement } from './editable-voids/EditableVoidElement';
import { IFrame } from './iframe/IFrame';

const id = 'Examples/Iframe Editable';

export default {
  title: id,
};

const components = getSlatePluginsComponents({
  [EDITABLE_VOID]: EditableVoidElement,
});
const options = getSlatePluginsOptions();

const Editor = ({ plugins }: any) => {
  const editor = useSlatePluginsEditor(id);

  const handleBlur = useCallback(() => {
    ReactEditor.deselect(editor);
  }, [editor]);

  const { getSlateProps, getEditableProps } = useSlatePlugins({
    id,
    plugins,
    components,
    options,
    editableProps,
    initialValue: initialValueIframe,
  });

  if (!getSlateProps().editor) return null;

  return (
    <Slate {...(getSlateProps() as any)}>
      <HeadingToolbar>
        <ToolbarButtonsBasicMarks />
      </HeadingToolbar>
      <IFrame onBlur={handleBlur}>
        <Editable {...getEditableProps()} />
      </IFrame>
    </Slate>
  );
};

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    ...useBasicMarkPlugins(),
  ];

  return <Editor plugins={plugins} />;
};
