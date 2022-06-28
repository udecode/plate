import 'tippy.js/dist/tippy.css';
import React from 'react';
import { Check } from '@styled-icons/material/Check';
import { FontDownload } from '@styled-icons/material/FontDownload';
import { FormatColorText } from '@styled-icons/material/FormatColorText';
import {
  ColorPickerToolbarDropdown,
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
  createPlateUI,
  HeadingToolbar,
  MARK_BG_COLOR,
  Plate,
} from '@udecode/plate';
import { MARK_COLOR } from '@udecode/plate-font/src/index';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { fontValue } from './font/fontValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createFontColorPlugin(),
    createFontBackgroundColorPlugin(),
    createFontSizePlugin(),
  ],
  {
    components: createPlateUI(),
  }
);

const CopyContent = () => (
  <div
    style={{
      borderBottom: '1px solid #eee',
      margin: '0 -16px',
      padding: '0 16px 16px',
    }}
  >
    <span style={{ color: '#f92672' }}>Copy Me in the editor</span>
  </div>
);

export default () => (
  <>
    <HeadingToolbar>
      <ColorPickerToolbarDropdown
        pluginKey={MARK_COLOR}
        icon={<FormatColorText />}
        selectedIcon={<Check />}
        tooltip={{ content: 'Text color' }}
      />
      <ColorPickerToolbarDropdown
        pluginKey={MARK_BG_COLOR}
        icon={<FontDownload />}
        selectedIcon={<Check />}
        tooltip={{ content: 'Highlight color' }}
      />
    </HeadingToolbar>

    <CopyContent />

    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={fontValue}
      plugins={plugins}
    />
  </>
);
