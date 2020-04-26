import React, { useMemo, useState } from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { EditablePlugins } from '../../packages/slate-plugins/src';
import { initialValuePlainText } from '../config/initialValues';

export default {
  title: 'Basic/Editable',
};

export const Example = () => {
  const [value, setValue] = useState(initialValuePlainText);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <EditablePlugins
        readOnly={boolean('readOnly', false)}
        placeholder={text('placeholder', 'Enter some plain text...')}
        spellCheck={boolean('spellCheck', true)}
        autoFocus
      />
    </Slate>
  );
};
