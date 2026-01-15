import * as React from 'react';

import type { TEquationElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

/**
 * DOCX-compatible block equation component.
 * Displays LaTeX source code with styling.
 */
export function EquationElementStaticDocx(
  props: SlateElementProps<TEquationElement>
) {
  const { element } = props;

  if (!element.texExpression || element.texExpression.length === 0) {
    return (
      <SlateElement {...props}>
        <p style={{ color: '#888', fontStyle: 'italic' }}>[Empty equation]</p>
        {props.children}
      </SlateElement>
    );
  }

  return (
    <SlateElement {...props}>
      <p
        style={{
          fontFamily: 'Cambria Math, Consolas, monospace',
          fontSize: '12pt',
          margin: '8pt 0',
          textAlign: 'center',
        }}
      >
        {element.texExpression}
      </p>
      {props.children}
    </SlateElement>
  );
}

/**
 * DOCX-compatible inline equation component.
 * Displays LaTeX source code inline.
 */
export function InlineEquationElementStaticDocx(
  props: SlateElementProps<TEquationElement>
) {
  const { element } = props;

  if (!element.texExpression || element.texExpression.length === 0) {
    return (
      <SlateElement {...props} as="span">
        <span style={{ color: '#888', fontStyle: 'italic' }}>[equation]</span>
        {props.children}
      </SlateElement>
    );
  }

  return (
    <SlateElement {...props} as="span">
      <span
        style={{
          fontFamily: 'Cambria Math, Consolas, monospace',
        }}
      >
        {element.texExpression}
      </span>
      {props.children}
    </SlateElement>
  );
}
