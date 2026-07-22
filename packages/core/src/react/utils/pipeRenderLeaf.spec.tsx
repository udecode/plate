/// <reference types="@testing-library/jest-dom" />

import { property } from '@platejs/plite';
import React from 'react';

import { render } from '@testing-library/react';

import { createBasePlugin } from '../../lib/plugin';
import { createPlateEditor } from '../editor/withPlate';
import { pipeRenderLeaf } from './pipeRenderLeaf';
import { pipeRenderText } from './pipeRenderText';

const attributes = { 'data-plite-leaf': true, 'data-testid': 'Leaf' } as any;

const text = { test: true, text: 'test' };

const getHookOrderErrors = (errorSpy: any) =>
  errorSpy.mock.calls.filter(([message]: [unknown]) => {
    if (typeof message !== 'string') return false;

    return (
      message.includes('change in the order of Hooks') ||
      message.includes('Rendered more hooks') ||
      message.includes('Rendered fewer hooks')
    );
  });

type ChildrenProps = {
  children: React.ReactNode;
};

it('render the default leaf', () => {
  const Leaf = pipeRenderLeaf(
    createPlateEditor({
      plugins: [],
    })
  )!;

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
    'data-plite-leaf',
    'true'
  );
  expect(getByTestId('Leaf').tagName).toBe('SPAN');
});

it('returns the custom leaf renderer unchanged when no plugin work exists', () => {
  const renderLeaf = (() => null) as any;

  expect(
    pipeRenderLeaf(
      createPlateEditor({
        navigationFeedback: false,
        plugins: [],
      }),
      renderLeaf
    )
  ).toBe(renderLeaf);
});

it('render with render.leaf and isDecoration=false', () => {
  const testPlugin = createBasePlugin({
    key: 'test',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      isDecoration: false,
      leaf: ({ children }: ChildrenProps) => (
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
  const testPlugin = createBasePlugin({
    key: 'test',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      isDecoration: true,
      leaf: ({ children }: ChildrenProps) => (
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
  const testPlugin = createBasePlugin({
    key: 'test',
    type: 'test',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
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
    'data-plite-leaf',
    'true'
  );
  expect(container.querySelector('strong')).not.toBeNull();
});

it('nests multiple simple render.as leaf plugins without losing outer attributes', () => {
  const boldPlugin = createBasePlugin({
    key: 'bold',
    type: 'bold',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      as: 'strong',
    },
  });
  const italicPlugin = createBasePlugin({
    key: 'italic',
    type: 'italic',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
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
    'data-plite-leaf',
    'true'
  );
  expect(container.querySelector('strong')).not.toBeNull();
  expect(container.querySelector('em')).not.toBeNull();
  expect(container.querySelector('strong em, em strong')).not.toBeNull();
});

it('skips inactive leaf renderers', () => {
  let activeCalls = 0;
  let inactiveCalls = 0;

  const boldPlugin = createBasePlugin({
    key: 'bold',
    type: 'bold',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      leaf: ({ children }: ChildrenProps) => {
        activeCalls += 1;

        return <strong data-testid="active-leaf">{children}</strong>;
      },
    },
  });
  const italicPlugin = createBasePlugin({
    key: 'italic',
    type: 'italic',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      leaf: ({ children }: ChildrenProps) => {
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

it('keeps complex leaf renderer hooks stable when a mark activates', () => {
  const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

  try {
    const testPlugin = createBasePlugin({
      key: 'test',
      type: 'test',
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
      render: {
        leaf: ({ children }: ChildrenProps) => (
          <span data-testid="complex-leaf">{children}</span>
        ),
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    const Leaf = pipeRenderLeaf(editor)!;
    const inactiveText = { text: 'test' } as any;
    const activeText = { test: true, text: 'test' } as any;

    const { getByTestId, queryByTestId, rerender } = render(
      <Leaf
        attributes={attributes}
        leaf={inactiveText}
        leafPosition={{ end: 0, start: 4 }}
        text={inactiveText}
      >
        test content
      </Leaf>
    );

    expect(queryByTestId('complex-leaf')).toBeNull();

    rerender(
      <Leaf
        attributes={attributes}
        leaf={activeText}
        leafPosition={{ end: 0, start: 4 }}
        text={activeText}
      >
        test content
      </Leaf>
    );

    expect(getByTestId('complex-leaf')).toBeInTheDocument();
    expect(getHookOrderErrors(errorSpy)).toEqual([]);
  } finally {
    errorSpy.mockRestore();
  }
});

it('keeps hooks stable when the projection segment count changes', () => {
  const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

  try {
    const testPlugin = createBasePlugin({
      key: 'test',
      type: 'test',
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    });
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [testPlugin],
    });
    const renderLeaf = pipeRenderLeaf(editor)!;

    const ProjectedLeaves = ({ count }: { count: number }) => (
      <>
        {Array.from({ length: count }, (_, index) =>
          renderLeaf({
            attributes: {
              ...attributes,
              'data-testid': `Leaf-${index}`,
            },
            children: `segment ${index}`,
            leaf: text,
            leafPosition: { end: index + 1, start: index },
            text,
          } as any)
        )}
      </>
    );

    const { rerender } = render(<ProjectedLeaves count={2} />);

    expect(() => rerender(<ProjectedLeaves count={1} />)).not.toThrow();
    expect(getHookOrderErrors(errorSpy)).toEqual([]);
  } finally {
    errorSpy.mockRestore();
  }
});

it('uses node.type to activate leaf renderers when key differs', () => {
  const simplePlugin = createBasePlugin({
    key: 'simple',
    type: 'simpleMark',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      as: 'strong',
    },
  });
  const complexPlugin = createBasePlugin({
    key: 'complex',
    type: 'complexMark',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      leaf: ({ children }: ChildrenProps) => (
        <span data-testid="complex-leaf">{children}</span>
      ),
    },
  });

  const editor = createPlateEditor({
    navigationFeedback: false,
    plugins: [simplePlugin, complexPlugin],
  } as any);

  const Leaf = pipeRenderLeaf(editor)!;
  const activeText = {
    complexMark: true,
    simpleMark: true,
    text: 'test',
  } as any;

  const { container, getByTestId } = render(
    <Leaf
      attributes={attributes}
      leaf={activeText}
      leafPosition={{ end: 0, start: 4 }}
      text={activeText}
    >
      test content
    </Leaf>
  );

  expect(container.querySelector('strong')).not.toBeNull();
  expect(getByTestId('complex-leaf')).toBeInTheDocument();
});

it('renders legacy decoration data from projection slices', () => {
  const searchPlugin = createBasePlugin({
    key: 'searchHighlight',
    type: 'search_highlight',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      leaf: ({ children }: ChildrenProps) => (
        <span data-testid="search-highlight">{children}</span>
      ),
    },
  });
  const editor = createPlateEditor({
    navigationFeedback: false,
    plugins: [searchPlugin],
  });
  const Leaf = pipeRenderLeaf(editor)! as any;
  const undecoratedText = { text: 'editable' } as any;

  const { getByTestId } = render(
    <Leaf
      attributes={attributes}
      leaf={undecoratedText}
      segment={{
        end: 8,
        marks: {},
        slices: [
          {
            data: { search_highlight: true },
            end: 8,
            key: 'search:0',
            start: 0,
          },
        ],
        start: 0,
        text: 'editable',
      }}
      text={undecoratedText}
    >
      editable
    </Leaf>
  );

  expect(getByTestId('search-highlight')).toBeInTheDocument();
});

it('keeps plugin leafProps behavior', () => {
  const testPlugin = createBasePlugin({
    key: 'test',
    type: 'test',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      leafProps: {
        className: 'plugin-leaf',
        'data-leaf-probe': 'yes',
      },
    },
  });

  const editor = createPlateEditor({
    plugins: [testPlugin],
  });

  const Leaf = pipeRenderLeaf(editor)!;
  const publishedLeafProps = editor.getPlugin(testPlugin).render.leafProps;

  expect(Object.isFrozen(publishedLeafProps)).toBe(true);

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
  expect(getByTestId('Leaf')).toHaveClass('plugin-leaf');
  expect(publishedLeafProps).toEqual({
    className: 'plugin-leaf',
    'data-leaf-probe': 'yes',
  });
});

it('render with render.node', () => {
  const testPlugin = createBasePlugin({
    key: 'test',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: { isDecoration: false },
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
    'data-plite-leaf',
    'true'
  );
  expect(getByTestId('Leaf').tagName).toBe('SPAN');
});

it('returns the custom text renderer unchanged when no plugin work exists', () => {
  const renderText = (() => null) as any;

  expect(
    pipeRenderText(
      createPlateEditor({
        navigationFeedback: false,
        plugins: [],
      }),
      renderText
    )
  ).toBe(renderText);
});

it('keeps text hooks stable when the projection segment count changes', () => {
  const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

  try {
    const testPlugin = createBasePlugin({
      key: 'test',
      type: 'test',
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
      render: { isDecoration: false },
    });
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [testPlugin],
    });
    const renderText = pipeRenderText(editor)!;
    const activeText = { test: true, text: 'test' } as any;

    const ProjectedTexts = ({ count }: { count: number }) => (
      <>
        {Array.from({ length: count }, (_, index) =>
          renderText({
            attributes: {
              ...attributes,
              'data-testid': `Text-${index}`,
            },
            children: `segment ${index}`,
            text: activeText,
          } as any)
        )}
      </>
    );

    const { rerender } = render(<ProjectedTexts count={2} />);

    expect(() => rerender(<ProjectedTexts count={1} />)).not.toThrow();
    expect(getHookOrderErrors(errorSpy)).toEqual([]);
  } finally {
    errorSpy.mockRestore();
  }
});

it('keeps the outer text attributes for render.as text plugins', () => {
  const testPlugin = createBasePlugin({
    key: 'test',
    type: 'test',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: { isDecoration: false, as: 'strong' },
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
    'data-plite-leaf',
    'true'
  );
  expect(container.querySelector('strong')).not.toBeNull();
});

it('skips inactive text renderers', () => {
  let activeCalls = 0;
  let inactiveCalls = 0;

  const boldPlugin = createBasePlugin({
    key: 'bold',
    type: 'bold',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      isDecoration: false,
      node: ({ children }: ChildrenProps) => {
        activeCalls += 1;

        return <strong data-testid="active-text">{children}</strong>;
      },
    },
  });
  const italicPlugin = createBasePlugin({
    key: 'italic',
    type: 'italic',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      isDecoration: false,
      node: ({ children }: ChildrenProps) => {
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

it('keeps complex text renderer hooks stable when a mark activates', () => {
  const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

  try {
    const testPlugin = createBasePlugin({
      key: 'test',
      type: 'test',
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
      render: {
        isDecoration: false,
        node: ({ children }: ChildrenProps) => (
          <span data-testid="complex-text">{children}</span>
        ),
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    const Text = pipeRenderText(editor)!;
    const inactiveText = { text: 'test' } as any;
    const activeText = { test: true, text: 'test' } as any;

    const { getByTestId, queryByTestId, rerender } = render(
      <Text attributes={attributes} text={inactiveText}>
        test content
      </Text>
    );

    expect(queryByTestId('complex-text')).toBeNull();

    rerender(
      <Text attributes={attributes} text={activeText}>
        test content
      </Text>
    );

    expect(getByTestId('complex-text')).toBeInTheDocument();
    expect(getHookOrderErrors(errorSpy)).toEqual([]);
  } finally {
    errorSpy.mockRestore();
  }
});

it('keeps plugin textProps behavior', () => {
  const testPlugin = createBasePlugin({
    key: 'test',
    type: 'test',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      isDecoration: false,
      textProps: {
        className: 'plugin-text',
        'data-text-probe': 'yes',
      },
    },
  });

  const editor = createPlateEditor({
    plugins: [testPlugin],
  });

  const Text = pipeRenderText(editor)!;
  const publishedTextProps = editor.getPlugin(testPlugin).render.textProps;

  expect(Object.isFrozen(publishedTextProps)).toBe(true);

  const { container } = render(
    <Text attributes={attributes} text={text}>
      test content
    </Text>
  );

  (
    expect(container.querySelector('[data-text-probe="yes"]')) as any
  ).toHaveAttribute('data-text-probe', 'yes');
  expect(container.querySelector('[data-text-probe="yes"]')).toHaveClass(
    'plugin-text'
  );
  expect(publishedTextProps).toEqual({
    className: 'plugin-text',
    'data-text-probe': 'yes',
  });
});
