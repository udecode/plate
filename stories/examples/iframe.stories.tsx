import React, { useCallback } from 'react';
import {
  getBasicElementPlugins,
  getBasicMarkPlugins,
  getHistoryPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  HeadingToolbar,
  useSlatePlugins,
  useStoreEditor,
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

const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  ...getBasicMarkPlugins(),
];

export const Example = () => {
  const editor = useStoreEditor(id);

  const handleBlur = useCallback(() => {
    ReactEditor.deselect(editor);
  }, [editor]);

  const { slateProps, editableProps: _editableProps } = useSlatePlugins({
    id,
    plugins,
    components,
    options,
    editableProps,
    initialValue: initialValueIframe,
  });

  if (!slateProps.editor) return null;

  return (
    <Slate {...(slateProps as any)}>
      <HeadingToolbar>
        <ToolbarButtonsBasicMarks />
      </HeadingToolbar>
      <IFrame onBlur={handleBlur}>
        <Editable {..._editableProps} />
      </IFrame>
    </Slate>
  );
};
