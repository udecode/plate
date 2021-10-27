import React, { useState } from 'react';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createReactPlugin,
} from '@udecode/plate';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { Plate, SPRenderElementProps } from '@udecode/plate-core';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import { CONFIG } from '../../config/config';
import { VALUES } from '../../config/values/values';

const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createResetNodePlugin(CONFIG.resetBlockType),
  createSoftBreakPlugin(CONFIG.softBreak),
  createExitBreakPlugin(CONFIG.exitBreak),
];

export const EditableVoidElement = ({
  attributes,
  children,
}: SPRenderElementProps) => {
  const [inputValue, setInputValue] = useState('');

  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <div {...attributes} contentEditable={false}>
      <div style={{ boxShadow: '0 0 0 3px #ddd', padding: '8px' }}>
        <h4>Name:</h4>
        <input
          style={{ margin: '8px 0' }}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
        <h4>Left or right handed:</h4>
        <input
          style={{ width: 'unset' }}
          type="radio"
          name="handedness"
          value="left"
        />{' '}
        Left
        <br />
        <input
          style={{ width: 'unset' }}
          type="radio"
          name="handedness"
          value="right"
        />{' '}
        Right
        <h4>Tell us about yourself:</h4>
        <div style={{ padding: '20px', border: '2px solid #ddd' }}>
          <Plate
            id="editable-void-basic-elements"
            plugins={plugins}
            components={CONFIG.components}
            options={CONFIG.options}
            editableProps={CONFIG.editableProps}
            initialValue={VALUES.basicElements}
          />
        </div>
      </div>
      {children}
    </div>
  );
};
