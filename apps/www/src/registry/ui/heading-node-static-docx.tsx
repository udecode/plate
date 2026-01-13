import * as React from 'react';

import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

/**
 * DOCX-compatible heading components.
 * Includes anchor bookmarks for TOC internal navigation.
 */

const headingStyles: Record<string, React.CSSProperties> = {
  h1: {
    fontSize: '24pt',
    fontWeight: 'bold',
    marginTop: '24pt',
    marginBottom: '6pt',
  },
  h2: {
    fontSize: '18pt',
    fontWeight: 'bold',
    marginTop: '18pt',
    marginBottom: '6pt',
  },
  h3: {
    fontSize: '14pt',
    fontWeight: 'bold',
    marginTop: '14pt',
    marginBottom: '4pt',
  },
  h4: {
    fontSize: '12pt',
    fontWeight: 'bold',
    marginTop: '12pt',
    marginBottom: '4pt',
  },
  h5: {
    fontSize: '11pt',
    fontWeight: 'bold',
    marginTop: '10pt',
    marginBottom: '4pt',
  },
  h6: {
    fontSize: '10pt',
    fontWeight: 'bold',
    marginTop: '10pt',
    marginBottom: '4pt',
  },
};

interface HeadingStaticDocxProps extends SlateElementProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function HeadingElementStaticDocx({
  variant = 'h1',
  ...props
}: HeadingStaticDocxProps) {
  const id = props.element.id as string | undefined;

  return (
    <SlateElement as={variant} style={headingStyles[variant]} {...props}>
      {/* biome-ignore lint/a11y/useAnchorContent: Bookmark anchor for DOCX TOC internal links */}
      {/* biome-ignore lint/a11y/useValidAnchor: Bookmark anchor for DOCX TOC internal links */}
      {id && <a id={id} />}
      {props.children}
    </SlateElement>
  );
}

export function H1ElementStaticDocx(props: SlateElementProps) {
  return <HeadingElementStaticDocx variant="h1" {...props} />;
}

export function H2ElementStaticDocx(props: SlateElementProps) {
  return <HeadingElementStaticDocx variant="h2" {...props} />;
}

export function H3ElementStaticDocx(props: SlateElementProps) {
  return <HeadingElementStaticDocx variant="h3" {...props} />;
}

export function H4ElementStaticDocx(props: SlateElementProps) {
  return <HeadingElementStaticDocx variant="h4" {...props} />;
}

export function H5ElementStaticDocx(props: SlateElementProps) {
  return <HeadingElementStaticDocx variant="h5" {...props} />;
}

export function H6ElementStaticDocx(props: SlateElementProps) {
  return <HeadingElementStaticDocx variant="h6" {...props} />;
}
