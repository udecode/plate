import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { Slate } from 'slate-react';
import { CustomEditable } from 'plugins/common/components/CustomEditable';
import { createCustomEditor } from 'plugins/common/helpers/createCustomEditor';
import { Toolbar } from '../../components';
import { initialValue } from './config';
import { editorPlugins, plugins } from './images.plugins';
import { InsertImageButton } from './InsertImageButton';

export const Images = () => {
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
        <InsertImageButton />
      </Toolbar>
      <CustomEditable plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
