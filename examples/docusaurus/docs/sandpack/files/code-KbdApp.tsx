export const kbdAppCode = `import React from 'react';
import { Keyboard } from '@styled-icons/material/Keyboard';
import {
  createKbdPlugin,
  createPlateUI,
  getPluginType,
  HeadingToolbar,
  MARK_KBD,
  MarkToolbarButton,
  Plate,
  withPlateEventProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { kbdValue } from './kbd/kbdValue';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from './typescript/plateTypes';

const KbdToolbarButton = withPlateEventProvider(() => {
  const editor = useMyPlateEditorRef()!;

  return (
    <MarkToolbarButton
      type={getPluginType(editor, MARK_KBD)}
      icon={<Keyboard />}
    />
  );
});

const plugins = createMyPlugins([...basicNodesPlugins, createKbdPlugin()], {
  components: createPlateUI(),
});

export default () => (
  <>
    <HeadingToolbar>
      <KbdToolbarButton />
    </HeadingToolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={kbdValue}
    />
  </>
);
`;

export const kbdAppFile = {
  '/KbdApp.tsx': kbdAppCode,
};
