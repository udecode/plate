/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { createTSlatePlugin } from '../../lib/plugin';
import { createPlateEditor } from '../editor/withPlate';
import { pipeRenderLeaf } from './pipeRenderLeaf';
import { pipeRenderText } from './pipeRenderText';

const attributes = { 'data-slate-leaf': true, 'data-testid': 'Leaf' } as any;

const text = { test: true, text: 'test' };

it('should render the default leaf', () => {
  const Leaf = pipeRenderLeaf(createPlateEditor({ plugins: [] }))!;

  const { getByTestId } = render(
    <Leaf
      attributes={attributes}
      leaf={text}
      leafPosition={{ end: 0, start: 4 }}
      text={text}
    >
      text
    </Leaf>
  );

  (expect(getByTestId('Leaf')) as any).toHaveAttribute(
    'data-slate-leaf',
    'true'
  );
});

it('should render with render.leaf and isDecoration=false', () => {
  const testPlugin = createTSlatePlugin({
    key: 'test',
    node: {
      isDecoration: false,
      isLeaf: true,
    },
    render: {
      leaf: ({ children }) => (
        <span data-testid="leaf-wrapper">{children}</span>
      ),
    },
  });

  const editor = createPlateEditor({
    plugins: [testPlugin],
  });

  const Leaf = pipeRenderLeaf(editor)!;

  const { getByTestId } = render(
    <Leaf
      attributes={attributes}
      leaf={text}
      leafPosition={{ end: 0, start: 4 }}
      text={text}
    >
      test content
    </Leaf>
  );

  (expect(getByTestId('leaf-wrapper')) as any).toBeInTheDocument();
});

it('should render with render.leaf and isDecoration=true', () => {
  const testPlugin = createTSlatePlugin({
    key: 'test',
    node: {
      isDecoration: true,
      isLeaf: true,
    },
    render: {
      leaf: ({ children }) => (
        <span data-testid="leaf-wrapper">{children}</span>
      ),
    },
  });

  const editor = createPlateEditor({
    plugins: [testPlugin],
  });

  const Leaf = pipeRenderLeaf(editor)!;

  const { getByTestId } = render(
    <Leaf
      attributes={attributes}
      leaf={text}
      leafPosition={{ end: 0, start: 4 }}
      text={text}
    >
      test content
    </Leaf>
  );

  (expect(getByTestId('leaf-wrapper')) as any).toBeInTheDocument();
});

it('should render with render.node', () => {
  const testPlugin = createTSlatePlugin({
    key: 'test',
    node: {
      isDecoration: false,
      isLeaf: true,
    },
  });

  const editor = createPlateEditor({
    plugins: [testPlugin],
  });

  const Text = pipeRenderText(editor)!;

  const { getByTestId } = render(
    <Text attributes={attributes} text={text}>
      test content
    </Text>
  );

  (expect(getByTestId('Leaf')) as any).toHaveAttribute(
    'data-slate-leaf',
    'true'
  );
});
