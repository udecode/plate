import React, { useState } from 'react';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createReactPlugin,
} from '@udecode/slate-plugins';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
} from '@udecode/slate-plugins-break';
import {
  SlatePlugins,
  SPRenderElementProps,
} from '@udecode/slate-plugins-core';
import { createResetNodePlugin } from '@udecode/slate-plugins-reset-node';
import { initialValueBasicElements } from '../../config/initialValues';
import {
  editableProps,
  options,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../../config/pluginOptions';
import { components } from '../../live';

const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createResetNodePlugin(optionsResetBlockTypePlugin),
  createSoftBreakPlugin(optionsSoftBreakPlugin),
  createExitBreakPlugin(optionsExitBreakPlugin),
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
          <SlatePlugins
            id="editable-void-basic-elements"
            plugins={plugins}
            components={components}
            options={options}
            editableProps={editableProps}
            initialValue={initialValueBasicElements}
          />
        </div>
      </div>
      {children}
    </div>
  );
};
