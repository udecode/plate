/// <reference types="@testing-library/jest-dom" />

import { render } from '@testing-library/react';
import React from 'react';

import { property } from '../../core';
import { BaseSuggestionPlugin } from '../../features/suggestion/BaseSuggestionPlugin';
import { definePlugin as defineHeadlessPlugin } from '../../lib/plugin';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph/BaseParagraphPlugin';
import { createEditor } from '../editor/withPlate';
import {
  setDOMTextSyncRendererCapability,
  setRetainedTextFlowRendererCapability,
} from '../plite-react';
import { definePlugin } from '../plugin/definePlugin';
import { pipeRenderLeaf } from './pipeRenderLeaf.internal';
import { pipeRenderText } from './pipeRenderText.internal';

const attributes = { 'data-editor-leaf': true, 'data-testid': 'Leaf' } as any;

const text = { test: true, text: 'test' };

const keyWrittenBy = (
  setCapability: typeof setDOMTextSyncRendererCapability
): symbol =>
  Object.getOwnPropertySymbols(
    setCapability(
      () => null,
      () => true
    )
  )[0];
const domTextSyncKey = keyWrittenBy(setDOMTextSyncRendererCapability);
const retainedTextFlowKey = keyWrittenBy(setRetainedTextFlowRendererCapability);

const getDOMTextSyncCapability = (renderer: object) =>
  Reflect.get(renderer, domTextSyncKey) as (context: {
    marks: object;
  }) => boolean;
const getRetainedTextFlowCapability = (renderer: object) =>
  Reflect.get(renderer, retainedTextFlowKey) as
    | ((context: { marks: Readonly<Record<string, unknown>> }) => boolean)
    | undefined;

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
    createEditor({
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
    'data-editor-leaf',
    'true'
  );
  expect(getByTestId('Leaf').tagName).toBe('SPAN');
  expect(getRetainedTextFlowCapability(Leaf)?.({ marks: {} })).toBe(true);
});

it('returns the custom leaf renderer unchanged when no plugin work exists', () => {
  const renderLeaf = (() => null) as any;

  expect(
    pipeRenderLeaf(
      createEditor({
        navigationFeedback: false,
        plugins: [],
      }),
      renderLeaf
    )
  ).toBe(renderLeaf);
  expect(getRetainedTextFlowCapability(renderLeaf)).toBeUndefined();
});

it('keeps element-targeted injection transforms out of leaf capability', () => {
  const injectionPlugin = defineHeadlessPlugin('injection', {
    targetPlugins: [BaseParagraphPlugin],
    inject: {
      nodeProps: {
        transformProps: ({ props }) => props,
      },
    },
  });
  const renderLeaf = pipeRenderLeaf(
    createEditor({
      navigationFeedback: false,
      plugins: [BaseParagraphPlugin, injectionPlugin],
    })
  )!;
  const resolveDOMTextSyncCapability = getDOMTextSyncCapability(renderLeaf);

  expect(resolveDOMTextSyncCapability({ marks: {} })).toBe(true);
  expect(getRetainedTextFlowCapability(renderLeaf)?.({ marks: {} })).toBe(true);
});

it('fails DOM text sync closed for untargeted text injection transforms', () => {
  const injectionPlugin = defineHeadlessPlugin('injection', {
    inject: {
      nodeProps: {
        transformProps: ({ props }) => props,
      },
    },
  });
  const renderLeaf = pipeRenderLeaf(
    createEditor({
      navigationFeedback: false,
      plugins: [injectionPlugin],
    })
  )!;
  const resolveDOMTextSyncCapability = getDOMTextSyncCapability(renderLeaf);

  expect(resolveDOMTextSyncCapability({ marks: {} })).toBe(false);
  expect(getRetainedTextFlowCapability(renderLeaf)?.({ marks: {} })).toBe(
    false
  );
});

it('fails DOM text sync closed for untargeted text style transforms', () => {
  const injectionPlugin = defineHeadlessPlugin('styleInjection', {
    inject: {
      nodeProps: {
        transformStyle: ({ value }) => ({ color: String(value) }),
      },
    },
  });
  const renderLeaf = pipeRenderLeaf(
    createEditor({
      navigationFeedback: false,
      plugins: [injectionPlugin],
    })
  )!;
  const resolveDOMTextSyncCapability = getDOMTextSyncCapability(renderLeaf);

  expect(resolveDOMTextSyncCapability({ marks: {} })).toBe(false);
  expect(getRetainedTextFlowCapability(renderLeaf)?.({ marks: {} })).toBe(
    false
  );
});

it('keeps native text paths for text without a suggestion', () => {
  const editor = createEditor({
    navigationFeedback: false,
    plugins: [BaseSuggestionPlugin],
  });
  const authored = {
    authored: [{ author: 'alice', change: 'c1', kind: 'insert' }],
  };

  for (const renderer of [pipeRenderLeaf(editor)!, pipeRenderText(editor)!]) {
    const resolveDOMTextSyncCapability = getDOMTextSyncCapability(renderer);
    const retained = getRetainedTextFlowCapability(renderer);

    expect(resolveDOMTextSyncCapability({ marks: {} })).toBe(true);
    expect(retained?.({ marks: {} })).toBe(true);
    expect(resolveDOMTextSyncCapability({ marks: authored })).toBe(false);
    expect(retained?.({ marks: authored })).toBe(false);
  }
});

it('fails DOM text sync closed for every text under a content-keyed scoped transform', () => {
  const contentPlugin = defineHeadlessPlugin('content', {
    inject: {
      nodeProps: {
        nodeKey: 'text',
        textScope: 'nodeKey',
        transformProps: ({ props }) => props,
      },
    },
  });
  const editor = createEditor({
    navigationFeedback: false,
    plugins: [contentPlugin],
  });

  for (const renderer of [pipeRenderLeaf(editor)!, pipeRenderText(editor)!]) {
    expect(getDOMTextSyncCapability(renderer)({ marks: {} })).toBe(false);
    expect(getRetainedTextFlowCapability(renderer)?.({ marks: {} })).toBe(
      false
    );
  }
});

it.each([
  ['a query and the all scope', { query: () => true, textScope: 'all' }],
  [
    'a query and the nodeKey scope',
    { query: () => true, textScope: 'nodeKey' },
  ],
  ['no query', {}],
] as const)(
  'fails DOM text sync closed for every text under a content-keyed injection with %s',
  (_, options) => {
    const contentPlugin = defineHeadlessPlugin('content', {
      inject: {
        nodeProps: {
          classNames: { a: 'short', ab: 'long' },
          nodeKey: 'text',
          styleKey: '',
          ...options,
        },
      },
    });
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [contentPlugin],
    });

    for (const renderer of [pipeRenderLeaf(editor)!, pipeRenderText(editor)!]) {
      expect(getDOMTextSyncCapability(renderer)({ marks: {} })).toBe(false);
      expect(getRetainedTextFlowCapability(renderer)?.({ marks: {} })).toBe(
        false
      );
    }
  }
);

it('fails DOM text sync closed only for text a query injection can paint', () => {
  const tonePlugin = defineHeadlessPlugin('tone', {
    inject: {
      nodeProps: {
        nodeKey: 'tone',
        query: () => true,
      },
    },
  });
  const editor = createEditor({
    navigationFeedback: false,
    plugins: [tonePlugin],
  });

  for (const renderer of [pipeRenderLeaf(editor)!, pipeRenderText(editor)!]) {
    const resolveDOMTextSyncCapability = getDOMTextSyncCapability(renderer);

    expect(resolveDOMTextSyncCapability({ marks: {} })).toBe(true);
    expect(resolveDOMTextSyncCapability({ marks: { tone: null } })).toBe(true);
    expect(resolveDOMTextSyncCapability({ marks: { tone: 'red' } })).toBe(
      false
    );
    expect(resolveDOMTextSyncCapability({ marks: { tone: 0 } })).toBe(false);
    expect(getRetainedTextFlowCapability(renderer)?.({ marks: {} })).toBe(true);
  }
});

it('fails DOM text sync closed for active custom plugin components', () => {
  const componentPlugin = definePlugin('componentMark', {
    component: ({ children }: ChildrenProps) => <>{children}</>,
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });
  const renderLeaf = pipeRenderLeaf(
    createEditor({
      navigationFeedback: false,
      plugins: [componentPlugin],
    })
  )!;
  const resolveDOMTextSyncCapability = getDOMTextSyncCapability(renderLeaf);

  expect(
    resolveDOMTextSyncCapability({
      marks: { componentMark: true },
    })
  ).toBe(false);
  const retained = getRetainedTextFlowCapability(renderLeaf);

  expect(retained?.({ marks: {} })).toBe(true);
  expect(retained?.({ marks: { componentMark: true } })).toBe(false);
});

it('renders a secondary leaf component for a text-placed mark', () => {
  const testPlugin = defineHeadlessPlugin('test', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      mark: {
        leafComponent: ({ children }: ChildrenProps) => (
          <span data-testid="leaf-wrapper">{children}</span>
        ),
        placement: 'text',
      },
    },
  });

  const editor = createEditor({
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

it('renders the primary component at leaf placement', () => {
  const testPlugin = defineHeadlessPlugin('test', {
    component: ({ children }: ChildrenProps) => (
      <span data-testid="leaf-wrapper">{children}</span>
    ),
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });

  const editor = createEditor({
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

it('keeps the outer leaf attributes for intrinsic leaf components', () => {
  const testPlugin = defineHeadlessPlugin('test', {
    component: 'strong',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });

  const editor = createEditor({
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
    'data-editor-leaf',
    'true'
  );
  expect(container.querySelector('strong')).toHaveClass('editor-test');
});

it('nests multiple intrinsic leaf components without losing outer attributes', () => {
  const boldPlugin = defineHeadlessPlugin('bold', {
    component: 'strong',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });
  const italicPlugin = defineHeadlessPlugin('italic', {
    component: 'em',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });

  const editor = createEditor({
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
    'data-editor-leaf',
    'true'
  );
  expect(container.querySelector('strong')).not.toBeNull();
  expect(container.querySelector('em')).not.toBeNull();
  expect(container.querySelector('strong em, em strong')).not.toBeNull();
});

it('skips inactive leaf renderers', () => {
  let activeCalls = 0;
  let inactiveCalls = 0;

  const boldPlugin = defineHeadlessPlugin('bold', {
    component: ({ children }: ChildrenProps) => {
      activeCalls += 1;

      return <strong data-testid="active-leaf">{children}</strong>;
    },
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });
  const italicPlugin = defineHeadlessPlugin('italic', {
    component: ({ children }: ChildrenProps) => {
      inactiveCalls += 1;

      return <em data-testid="inactive-leaf">{children}</em>;
    },
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });

  const editor = createEditor({
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
    const testPlugin = defineHeadlessPlugin('test', {
      component: ({ children }: ChildrenProps) => (
        <span data-testid="complex-leaf">{children}</span>
      ),
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    });

    const editor = createEditor({
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

it('keeps hooks stable when the rendered leaf count changes', () => {
  const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

  try {
    const testPlugin = defineHeadlessPlugin('test', {
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    });
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [testPlugin],
    });
    const renderLeaf = pipeRenderLeaf(editor)!;

    const Leaves = ({ count }: { count: number }) => (
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

    const { rerender } = render(<Leaves count={2} />);

    expect(() => rerender(<Leaves count={1} />)).not.toThrow();
    expect(getHookOrderErrors(errorSpy)).toEqual([]);
  } finally {
    errorSpy.mockRestore();
  }
});

it('uses plugin names to activate leaf renderers', () => {
  const simplePlugin = definePlugin('simple', {
    component: 'strong',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });
  const complexPlugin = definePlugin('complex', {
    component: ({ children }: ChildrenProps) => (
      <span data-testid="complex-leaf">{children}</span>
    ),
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });

  const editor = createEditor({
    navigationFeedback: false,
    plugins: [simplePlugin, complexPlugin],
  });

  const Leaf = pipeRenderLeaf(editor)!;
  const activeText = {
    complex: true,
    simple: true,
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

it('keeps plugin leafAttributes behavior', () => {
  const testPlugin = definePlugin('test', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      mark: {
        leafAttributes: {
          className: 'plugin-leaf',
          'data-leaf-probe': 'yes',
        },
      },
    },
  });

  const editor = createEditor({
    plugins: [testPlugin],
  });

  const Leaf = pipeRenderLeaf(editor)!;
  const publishedLeafProps =
    editor.plugin(testPlugin).render.mark?.leafAttributes;

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

it('renders a mark at text placement', () => {
  const testPlugin = definePlugin('test', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: { mark: { placement: 'text' } },
  });

  const editor = createEditor({
    plugins: [testPlugin],
  });

  const Text = pipeRenderText(editor)!;

  const { getByTestId } = render(
    <Text attributes={attributes} text={text}>
      test content
    </Text>
  );

  (expect(getByTestId('Leaf')) as any).toHaveAttribute(
    'data-editor-leaf',
    'true'
  );
  expect(getByTestId('Leaf').tagName).toBe('SPAN');
  const retained = getRetainedTextFlowCapability(Text);

  expect(retained?.({ marks: {} })).toBe(true);
  expect(retained?.({ marks: { test: true } })).toBe(false);
});

it('returns the custom text renderer unchanged when no plugin work exists', () => {
  const renderText = (() => null) as any;

  expect(
    pipeRenderText(
      createEditor({
        navigationFeedback: false,
        plugins: [],
      }),
      renderText
    )
  ).toBe(renderText);
  expect(getRetainedTextFlowCapability(renderText)).toBeUndefined();
});

it('keeps text hooks stable when the rendered text count changes', () => {
  const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

  try {
    const testPlugin = definePlugin('test', {
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
      render: { mark: { placement: 'text' } },
    });
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [testPlugin],
    });
    const renderText = pipeRenderText(editor)!;
    const activeText = { test: true, text: 'test' } as any;

    const Texts = ({ count }: { count: number }) => (
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

    const { rerender } = render(<Texts count={2} />);

    expect(() => rerender(<Texts count={1} />)).not.toThrow();
    expect(getHookOrderErrors(errorSpy)).toEqual([]);
  } finally {
    errorSpy.mockRestore();
  }
});

it('keeps the outer text attributes for intrinsic text components', () => {
  const testPlugin = definePlugin('test', {
    component: 'strong',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: { mark: { placement: 'text' } },
  });

  const editor = createEditor({
    plugins: [testPlugin],
  });

  const Text = pipeRenderText(editor)!;

  const { container, getByTestId } = render(
    <Text attributes={attributes} text={text}>
      test content
    </Text>
  );

  (expect(getByTestId('Leaf')) as any).toHaveAttribute(
    'data-editor-leaf',
    'true'
  );
  expect(container.querySelector('strong')).not.toBeNull();
});

it('skips inactive text renderers', () => {
  let activeCalls = 0;
  let inactiveCalls = 0;

  const boldPlugin = definePlugin('bold', {
    component: ({ children }: ChildrenProps) => {
      activeCalls += 1;

      return <strong data-testid="active-text">{children}</strong>;
    },
    render: { mark: { placement: 'text' } },
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });
  const italicPlugin = definePlugin('italic', {
    component: ({ children }: ChildrenProps) => {
      inactiveCalls += 1;

      return <em data-testid="inactive-text">{children}</em>;
    },
    render: { mark: { placement: 'text' } },
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });

  const editor = createEditor({
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
    const testPlugin = definePlugin('test', {
      component: ({ children }: ChildrenProps) => (
        <span data-testid="complex-text">{children}</span>
      ),
      render: { mark: { placement: 'text' } },
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    });

    const editor = createEditor({
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

it('renders present falsy mark values and keeps DOM text sync closed', () => {
  const booleanPlugin = definePlugin('booleanMark', {
    component: 'u',
    render: { mark: { placement: 'text' } },
    schema: { mark: property.boolean({ default: false }) },
  });
  const numericPlugin = definePlugin('numericMark', {
    component: 'strong',
    render: {
      mark: {
        placement: 'text',
        textAttributes: { 'data-numeric-mark': 'present' },
      },
    },
    schema: { mark: property.number() },
  });
  const editor = createEditor({ plugins: [booleanPlugin, numericPlugin] });
  const Text = pipeRenderText(editor)!;
  const resolveDOMTextSyncCapability = getDOMTextSyncCapability(Text);
  const { container } = render(
    <Text
      attributes={attributes}
      text={{ booleanMark: false, numericMark: 0, text: 'test' } as any}
    >
      test content
    </Text>
  );

  expect(container.querySelector('strong')).not.toBeNull();
  expect(container.querySelector('u')).toBeNull();
  expect(
    container.querySelector('[data-numeric-mark="present"]')
  ).not.toBeNull();
  expect(
    resolveDOMTextSyncCapability({
      marks: { numericMark: 0 },
    })
  ).toBe(false);
});

it('keeps plugin textAttributes behavior', () => {
  const testPlugin = definePlugin('test', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      mark: {
        placement: 'text',
        textAttributes: {
          className: 'plugin-text',
          'data-text-probe': 'yes',
        },
      },
    },
  });

  const editor = createEditor({
    plugins: [testPlugin],
  });

  const Text = pipeRenderText(editor)!;
  const publishedTextProps =
    editor.plugin(testPlugin).render.mark?.textAttributes;

  expect(Object.isFrozen(publishedTextProps)).toBe(true);

  const { container } = render(
    <Text attributes={{ ...attributes, className: 'base-text' }} text={text}>
      test content
    </Text>
  );

  (
    expect(container.querySelector('[data-text-probe="yes"]')) as any
  ).toHaveAttribute('data-text-probe', 'yes');
  expect(container.querySelector('[data-text-probe="yes"]')).toHaveClass(
    'base-text',
    'plugin-text'
  );
  expect(publishedTextProps).toEqual({
    className: 'plugin-text',
    'data-text-probe': 'yes',
  });
});
