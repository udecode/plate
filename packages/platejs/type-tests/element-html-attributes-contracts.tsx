import type { AnchorHTMLAttributes } from 'react';

import type { BaseParagraphPlugin } from '../src';
import type { ParagraphPlugin, EditorElementProps } from '../src/react';
import { EditorElement } from '../src/react';
import type { EditorElementProps as StaticEditorElementProps } from '../src/static';
import { EditorElement as StaticEditorElement } from '../src/static';

const anchorAttributes: AnchorHTMLAttributes<HTMLAnchorElement> = {
  dir: 'auto',
  href: 'https://platejs.org',
};

export const renderLiveAnchor = (
  props: EditorElementProps<typeof ParagraphPlugin>
) => (
  <EditorElement
    {...props}
    as="a"
    attributes={{ ...props.attributes, ...anchorAttributes }}
  />
);

export const renderStaticAnchor = (
  props: StaticEditorElementProps<typeof BaseParagraphPlugin>
) => (
  <StaticEditorElement
    {...props}
    as="a"
    attributes={{ ...props.attributes, ...anchorAttributes }}
  />
);
