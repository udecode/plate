import React, { useMemo, useState } from 'react';
import { FormatBold, FormatItalic, FormatUnderlined } from '@material-ui/icons';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  BoldPlugin,
  EditablePlugins,
  HoveringToolbar,
  ItalicPlugin,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  ToolbarMark,
  UnderlinePlugin,
} from '../../packages/slate-plugins/src';
import { initialValueHoveringToolbar } from '../config/initialValues';

export default {
  title: 'Basic/HoveringToolbar',
};

const plugins = [BoldPlugin(), ItalicPlugin(), UnderlinePlugin()];

export const HoveringMenu = () => {
  const [value, setValue] = useState(initialValueHoveringToolbar);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <HoveringToolbar>
        <ToolbarMark reversed format={MARK_BOLD} icon={<FormatBold />} />
        <ToolbarMark reversed format={MARK_ITALIC} icon={<FormatItalic />} />
        <ToolbarMark
          reversed
          format={MARK_UNDERLINE}
          icon={<FormatUnderlined />}
        />
      </HoveringToolbar>
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
