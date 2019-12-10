/* eslint-disable no-alert */
import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { Editable, Slate } from 'slate-react';
import { createCustomEditor } from 'plugins/common/helpers/createCustomEditor';
import { Toolbar } from '../../components';
import { initialValue } from './config';
import { LinkButton } from './LinkButton';
import { editorPlugins } from './links.plugins';

export const Links = () => {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState<Range | null>(null);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(newValue, newSelection) => {
        setValue(newValue);
        setSelection(newSelection);
      }}
    >
      <Toolbar>
        <LinkButton />
      </Toolbar>
      <Editable placeholder="Enter some text..." />
    </Slate>
  );
};
