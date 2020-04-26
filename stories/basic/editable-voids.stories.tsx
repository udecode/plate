import React, { useMemo, useState } from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { EditablePlugins } from '../../packages/slate-plugins/src';
import { initialValueVoids } from '../config/initialValues';
import { EditableVoidPlugin } from './editable-voids/EditableVoidPlugin';
import { withEditableVoids } from './editable-voids/withEditableVoids';

export default {
  title: 'Basic/Editable Voids',
};

const plugins = [EditableVoidPlugin()];

export const Example = () => {
  const [value, setValue] = useState(initialValueVoids);

  const editor = useMemo(
    () => withEditableVoids(withHistory(withReact(createEditor()))),
    []
  );

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <EditablePlugins
        readOnly={boolean('readOnly', false)}
        plugins={plugins}
        placeholder={text('placeholder', 'Enter some text...')}
        spellCheck={boolean('spellCheck', true)}
        autoFocus
      />
    </Slate>
  );
};
