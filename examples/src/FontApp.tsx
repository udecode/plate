import React, { CSSProperties } from 'react';
import {
  ColorPickerToolbarDropdown,
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
  MARK_BG_COLOR,
  MARK_COLOR,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { Icons } from './common/icons';
import { plateUI } from './common/plateUI';
import { fontValue } from './font/fontValue';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const styles: Record<string, CSSProperties> = {
  copyWrapper: {
    borderBottom: '1px solid #eee',
    margin: '0 -16px',
    padding: '0 16px 16px',
  },
  copy: {
    color: '#f92672',
  },
};

const tooltips = {
  color: { content: 'Text color' },
  bg: { content: 'Highlight color' },
};

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createFontColorPlugin(),
    createFontBackgroundColorPlugin(),
    createFontSizePlugin(),
  ],
  {
    components: plateUI,
  }
);

function CopyContent() {
  return (
    <div style={styles.copyWrapper}>
      <span style={styles.copy}>Copy Me in the editor</span>
    </div>
  );
}

export default function FontApp() {
  return (
    <PlateProvider<MyValue> initialValue={fontValue} plugins={plugins}>
      <Toolbar>
        <ColorPickerToolbarDropdown
          pluginKey={MARK_COLOR}
          icon={<Icons.color />}
          selectedIcon={<Icons.check />}
          tooltip={tooltips.color}
        />
        <ColorPickerToolbarDropdown
          pluginKey={MARK_BG_COLOR}
          icon={<Icons.bg />}
          selectedIcon={<Icons.check />}
          tooltip={tooltips.bg}
        />
      </Toolbar>

      <CopyContent />

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
