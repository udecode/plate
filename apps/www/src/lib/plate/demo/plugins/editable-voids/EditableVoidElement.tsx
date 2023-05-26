import React, { CSSProperties, useState } from 'react';
import {
  createBasicElementsPlugin,
  createExitBreakPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  Plate,
  PlateRenderElementProps,
  TElement,
} from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyEditor, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';

const plugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
  ],
  {
    components: plateUI,
  }
);

const styles: Record<string, CSSProperties> = {
  box: { boxShadow: '0 0 0 3px #ddd', padding: '8px' },
  input: { margin: '8px 0' },
  radio: { width: 'unset' },
  editor: { padding: '20px', border: '2px solid #ddd' },
};

export function EditableVoidElement({
  attributes,
  children,
}: PlateRenderElementProps<MyValue, TElement>) {
  const [inputValue, setInputValue] = useState('');

  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <div {...attributes} contentEditable={false}>
      <div style={styles.box}>
        <h4>Name:</h4>
        <input
          style={styles.input}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
        <h4>Left or right handed:</h4>
        <input
          style={styles.radio}
          type="radio"
          name="handedness"
          value="left"
        />{' '}
        Left
        <br />
        <input
          style={styles.radio}
          type="radio"
          name="handedness"
          value="right"
        />{' '}
        Right
        <h4>Tell us about yourself:</h4>
        <div style={styles.editor}>
          <Plate<MyValue, MyEditor>
            id="editable-void-basic-elements"
            plugins={plugins}
            editableProps={editableProps}
            // initialValue={basicElementsValue}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
