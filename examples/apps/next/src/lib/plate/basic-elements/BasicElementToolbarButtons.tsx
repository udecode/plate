import React from 'react';
import {
  BlockToolbarButton,
  CodeBlockToolbarButton,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  getPluginType,
  useEventPlateId,
} from '@udecode/plate';
import { Icons } from '../common/icons';
import { useMyPlateEditorRef } from '../../apps/next/src/lib/plate/typescript/plateTypes';

const tooltip = (content: string) => ({
  content,
});
export function BasicElementToolbarButtons() {
  const editor = useMyPlateEditorRef(useEventPlateId());

  return (
    <>
      <BlockToolbarButton
        tooltip={tooltip('Heading 1')}
        type={getPluginType(editor, ELEMENT_H1)}
        icon={<Icons.h1 />}
      />
      <BlockToolbarButton
        tooltip={tooltip('Heading 2')}
        type={getPluginType(editor, ELEMENT_H2)}
        icon={<Icons.h2 />}
      />
      <BlockToolbarButton
        tooltip={tooltip('Heading 3')}
        type={getPluginType(editor, ELEMENT_H3)}
        icon={<Icons.h3 />}
      />
      <BlockToolbarButton
        tooltip={tooltip('Heading 4')}
        type={getPluginType(editor, ELEMENT_H4)}
        icon={<Icons.h4 />}
      />
      <BlockToolbarButton
        tooltip={tooltip('Heading 5')}
        type={getPluginType(editor, ELEMENT_H5)}
        icon={<Icons.h5 />}
      />
      <BlockToolbarButton
        tooltip={tooltip('Heading 6')}
        type={getPluginType(editor, ELEMENT_H6)}
        icon={<Icons.h6 />}
      />
      <BlockToolbarButton
        tooltip={tooltip('Block Quote (⌘+⇧+.)')}
        type={getPluginType(editor, ELEMENT_BLOCKQUOTE)}
        icon={<Icons.blockquote />}
      />
      <CodeBlockToolbarButton icon={<Icons.codeblock />} />
    </>
  );
}
