/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { createTSlatePlugin } from '../../lib/plugin';
import { createPlateEditor } from '../editor/withPlate';
import { pipeRenderLeaf } from './pipeRenderLeaf';
import { pipeRenderText } from './pipeRenderText';

const attributes = { 'data-slate-leaf': true, 'data-testid': 'Leaf' } as any;

const text = { test: true, text: 'test' };

it('render the default leaf', () => {
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
  expect(getByTestId('Leaf').tagName).toBe('SPAN');
});

it('returns the custom leaf renderer unchanged when no plugin work exists', () => {
  const renderLeaf = (() => null) as any;

  expect(pipeRenderLeaf(createPlateEditor({ plugins: [] }), renderLeaf)).toBe(
    renderLeaf
  );
});

it('render with render.leaf and isDecoration=false', () => {
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

it('render with render.leaf and isDecoration=true', () => {
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

it('keeps the outer leaf attributes for render.as leaf plugins', () => {
  const testPlugin = createTSlatePlugin({
    key: 'test',
    node: {
      isLeaf: true,
      type: 'test',
    },
    render: {
      as: 'strong',
    },
  });

  const editor = createPlateEditor({
    plugins: [testPlugin],
  });

  const Leaf = pipeRenderLeaf(editor)!;

  const { container, getByTestId } = render(
    <Leaf
      attributes={attributes}
      leaf={text}
      leafPosition={{ end: 0, start: 4 }}
      text={text}
    >
      test content
    </Leaf>
  );

  (expect(getByTestId('Leaf')) as any).toHaveAttribute(
    'data-slate-leaf',
    'true'
  );
  expect(container.querySelector('strong')).not.toBeNull();
});

it('nests multiple simple render.as leaf plugins without losing outer attributes', () => {
  const boldPlugin = createTSlatePlugin({
    key: 'bold',
    node: {
      isLeaf: true,
      type: 'bold',
    },
    render: {
      as: 'strong',
    },
  });
  const italicPlugin = createTSlatePlugin({
    key: 'italic',
    node: {
      isLeaf: true,
      type: 'italic',
    },
    render: {
      as: 'em',
    },
  });

  const editor = createPlateEditor({
    plugins: [boldPlugin, italicPlugin],
  });

  const Leaf = pipeRenderLeaf(editor)!;

  const { container, getByTestId } = render(
    <Leaf
      attributes={attributes}
      leaf={{ bold: true, italic: true, text: 'test' } as any}
      leafPosition={{ end: 0, start: 4 }}
      text={{ bold: true, italic: true, text: 'test' } as any}
    >
      test content
    </Leaf>
  );

  (expect(getByTestId('Leaf')) as any).toHaveAttribute(
    'data-slate-leaf',
    'true'
  );
  expect(container.querySelector('strong')).not.toBeNull();
  expect(container.querySelector('em')).not.toBeNull();
  expect(container.querySelector('strong em, em strong')).not.toBeNull();
});

it('skips inactive leaf renderers', () => {
  let activeCalls = 0;
  let inactiveCalls = 0;

  const boldPlugin = createTSlatePlugin({
    key: 'bold',
    node: {
      isLeaf: true,
      type: 'bold',
    },
    render: {
      leaf: ({ children }) => {
        activeCalls += 1;

        return <strong data-testid="active-leaf">{children}</strong>;
      },
    },
  });
  const italicPlugin = createTSlatePlugin({
    key: 'italic',
    node: {
      isLeaf: true,
      type: 'italic',
    },
    render: {
      leaf: ({ children }) => {
        inactiveCalls += 1;

        return <em data-testid="inactive-leaf">{children}</em>;
      },
    },
  });

  const editor = createPlateEditor({
    plugins: [boldPlugin, italicPlugin],
  });

  const Leaf = pipeRenderLeaf(editor)!;

  const { getByTestId, queryByTestId } = render(
    <Leaf
      attributes={attributes}
      leaf={{ bold: true, text: 'test' } as any}
      leafPosition={{ end: 0, start: 4 }}
      text={{ bold: true, text: 'test' } as any}
    >
      test content
    </Leaf>
  );

  expect(activeCalls).toBe(1);
  expect(inactiveCalls).toBe(0);
  expect(getByTestId('active-leaf')).toBeInTheDocument();
  expect(queryByTestId('inactive-leaf')).toBeNull();
});

it('keeps plugin leafProps behavior', () => {
  const testPlugin = createTSlatePlugin({
    key: 'test',
    node: {
      isLeaf: true,
      leafProps: {
        'data-leaf-probe': 'yes',
      },
      type: 'test',
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

  (expect(getByTestId('Leaf')) as any).toHaveAttribute(
    'data-leaf-probe',
    'yes'
  );
});

it('render with render.node', () => {
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
  expect(getByTestId('Leaf').tagName).toBe('SPAN');
});

it('returns the custom text renderer unchanged when no plugin work exists', () => {
  const renderText = (() => null) as any;

  expect(pipeRenderText(createPlateEditor({ plugins: [] }), renderText)).toBe(
    renderText
  );
});

it('keeps the outer text attributes for render.as text plugins', () => {
  const testPlugin = createTSlatePlugin({
    key: 'test',
    node: {
      isDecoration: false,
      isLeaf: true,
      type: 'test',
    },
    render: {
      as: 'strong',
    },
  });

  const editor = createPlateEditor({
    plugins: [testPlugin],
  });

  const Text = pipeRenderText(editor)!;

  const { container, getByTestId } = render(
    <Text attributes={attributes} text={text}>
      test content
    </Text>
  );

  (expect(getByTestId('Leaf')) as any).toHaveAttribute(
    'data-slate-leaf',
    'true'
  );
  expect(container.querySelector('strong')).not.toBeNull();
});

it('skips inactive text renderers', () => {
  let activeCalls = 0;
  let inactiveCalls = 0;

  const boldPlugin = createTSlatePlugin({
    key: 'bold',
    node: {
      isDecoration: false,
      isLeaf: true,
      type: 'bold',
    },
    render: {
      node: ({ children }) => {
        activeCalls += 1;

        return <strong data-testid="active-text">{children}</strong>;
      },
    },
  });
  const italicPlugin = createTSlatePlugin({
    key: 'italic',
    node: {
      isDecoration: false,
      isLeaf: true,
      type: 'italic',
    },
    render: {
      node: ({ children }) => {
        inactiveCalls += 1;

        return <em data-testid="inactive-text">{children}</em>;
      },
    },
  });

  const editor = createPlateEditor({
    plugins: [boldPlugin, italicPlugin],
  });

  const Text = pipeRenderText(editor)!;

  const { getByTestId, queryByTestId } = render(
    <Text attributes={attributes} text={{ bold: true, text: 'test' } as any}>
      test content
    </Text>
  );

  expect(activeCalls).toBe(1);
  expect(inactiveCalls).toBe(0);
  expect(getByTestId('active-text')).toBeInTheDocument();
  expect(queryByTestId('inactive-text')).toBeNull();
});

it('keeps plugin textProps behavior', () => {
  const testPlugin = createTSlatePlugin({
    key: 'test',
    node: {
      isDecoration: false,
      isLeaf: true,
      textProps: {
        'data-text-probe': 'yes',
      },
      type: 'test',
    },
  });

  const editor = createPlateEditor({
    plugins: [testPlugin],
  });

  const Text = pipeRenderText(editor)!;

  const { container } = render(
    <Text attributes={attributes} text={text}>
      test content
    </Text>
  );

  (
    expect(container.querySelector('[data-text-probe="yes"]')) as any
  ).toHaveAttribute('data-text-probe', 'yes');
});
