import React, { useMemo, useState } from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';
import { initialValuePlainText } from '../config/initialValues';

export default {
  title: 'Basic/Editable',
};

export const Props = () => {
  const [value, setValue] = useState(initialValuePlainText);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

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
