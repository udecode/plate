import React, { useState } from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import { useCreateEditor } from 'slate-plugins';
import { Editable, Slate, withReact } from 'slate-react';
import { initialValuePlainText } from '../config/initialValues';

export default {
  title: 'Basic/Editable',
};

export const Props = () => {
  const [value, setValue] = useState(initialValuePlainText);

  const editor = useCreateEditor([withReact, withHistory]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Editable
        readOnly={boolean('readOnly', false)}
        placeholder={text('placeholder', 'Enter some plain text...')}
        spellCheck={boolean('spellCheck', true)}
        autoFocus
      />
    </Slate>
  );
};
