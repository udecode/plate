// Export-contract tests intentionally inspect namespace keys.
// Source-contract assertions keep patterns next to their claims.
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

import { act, render } from '@testing-library/react';
import * as PliteRoot from 'plitejs';
import { defineEditorSchema, schema } from 'plitejs';
import { type ComponentProps, useEffect } from 'react';

import * as PliteReact from '../../src/react';
import {
  createEditor,
  Editable,
  type EditableProps,
  Plite,
  type PliteCommitContext,
  type PliteSelectionChangeContext,
  type PliteValueChangeContext,
  type RenderElementProps,
  type RenderVoidProps,
} from '../../src/react';
import { createElementSelectedHistoryRenderElement } from './render-probes/element-selected-render-probes';

const cwd = process.cwd();
const packageRoot = cwd.endsWith(`${sep}packages${sep}plitejs`)
  ? cwd
  : resolve(cwd, 'packages/plitejs');
const repoRoot = resolve(packageRoot, '../..');
const reactSourceRoot = resolve(packageRoot, 'src/react');

const blockVoidSchema = defineEditorSchema('schema:react-surface-block-void', {
  elements: { image: { void: 'block' } },
  id: 'react-surface-block-void',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const formCardSchema = defineEditorSchema('schema:react-surface-form-card', {
  elements: {
    'editable-card': {
      void: 'block',
    },
  },
  id: 'react-surface-form-card',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const inlineVoidSchema = defineEditorSchema(
  'schema:react-surface-inline-void',
  {
    elements: { mention: { void: 'inline' } },
    id: 'react-surface-inline-void',
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  }
);

type ExpectFalse<T extends false> = T;
type ExpectTrue<T extends true> = T;
type RenderElementHasPath = 'path' extends keyof RenderElementProps
  ? true
  : false;
type RenderElementHasIndex = 'index' extends keyof RenderElementProps
  ? true
  : false;
type RenderVoidHasPath = 'path' extends keyof RenderVoidProps ? true : false;

type RenderElementDoesNotExposePath = ExpectFalse<RenderElementHasPath>;
type RenderElementDoesNotExposeIndex = ExpectFalse<RenderElementHasIndex>;
type RenderVoidDoesNotExposePath = ExpectFalse<RenderVoidHasPath>;
type EditableDOMBeforeInputProps = ComponentProps<
  typeof Editable
>['onDOMBeforeInput'];
type EditableHasDOMStrategy = 'domStrategy' extends keyof EditableProps
  ? true
  : false;
type EditableHasLayout = 'layout' extends keyof EditableProps ? true : false;
type EditableHasRenderingStrategy =
  'renderingStrategy' extends keyof EditableProps ? true : false;
type EditableHasOnDOMStrategyMetrics =
  'onDOMStrategyMetrics' extends keyof EditableProps ? true : false;
type EditableHasOnRenderingStrategyMetrics =
  'onRenderingStrategyMetrics' extends keyof EditableProps ? true : false;
type EditableHasOnCommand = 'onCommand' extends keyof ComponentProps<
  typeof Editable
>
  ? true
  : false;
type PliteHasWidgetStore = 'widgetStore' extends keyof ComponentProps<
  typeof Plite
>
  ? true
  : false;
type PliteHasOnCommit = 'onCommit' extends keyof ComponentProps<typeof Plite>
  ? true
  : false;
type PliteHasOnChange = 'onChange' extends keyof ComponentProps<typeof Plite>
  ? true
  : false;
type PliteCommitHasCommit = 'commit' extends keyof PliteCommitContext
  ? true
  : false;
type PliteCommitHasSnapshot = 'snapshot' extends keyof PliteCommitContext
  ? true
  : false;
type PliteValueChangeHasValue = 'value' extends keyof PliteValueChangeContext
  ? true
  : false;
type PliteSelectionChangeHasSelection =
  'selection' extends keyof PliteSelectionChangeContext ? true : false;
type EditableAutoCompleteAcceptsBoolean =
  boolean extends NonNullable<EditableProps['autoComplete']> ? true : false;
type EditableExposesDOMStrategy = ExpectTrue<EditableHasDOMStrategy>;
type EditableDoesNotExposeLayout = ExpectFalse<EditableHasLayout>;
type EditableDoesNotExposeRenderingStrategy =
  ExpectFalse<EditableHasRenderingStrategy>;
type EditableExposesOnDOMStrategyMetrics =
  ExpectTrue<EditableHasOnDOMStrategyMetrics>;
type EditableDoesNotExposeOnRenderingStrategyMetrics =
  ExpectFalse<EditableHasOnRenderingStrategyMetrics>;
type EditableDoesNotExposeOnCommand = ExpectFalse<EditableHasOnCommand>;
type PliteDoesNotExposeWidgetStore = ExpectFalse<PliteHasWidgetStore>;
type PliteExposesOnCommit = ExpectTrue<PliteHasOnCommit>;
type PliteDoesNotExposeOnChange = ExpectFalse<PliteHasOnChange>;
type PliteCommitExposesCommit = ExpectTrue<PliteCommitHasCommit>;
type PliteCommitExposesSnapshot = ExpectTrue<PliteCommitHasSnapshot>;
type PliteValueChangeExposesValue = ExpectTrue<PliteValueChangeHasValue>;
type PliteSelectionChangeExposesSelection =
  ExpectTrue<PliteSelectionChangeHasSelection>;
type EditableRejectsBooleanAutoComplete =
  ExpectFalse<EditableAutoCompleteAcceptsBoolean>;

void (null as unknown as RenderElementDoesNotExposePath);
void (null as unknown as RenderElementDoesNotExposeIndex);
void (null as unknown as RenderVoidDoesNotExposePath);
void (null as unknown as EditableDOMBeforeInputProps);
void (null as unknown as EditableExposesDOMStrategy);
void (null as unknown as EditableDoesNotExposeLayout);
void (null as unknown as EditableDoesNotExposeRenderingStrategy);
void (null as unknown as EditableExposesOnDOMStrategyMetrics);
void (null as unknown as EditableDoesNotExposeOnRenderingStrategyMetrics);
void (null as unknown as EditableDoesNotExposeOnCommand);
void (null as unknown as PliteDoesNotExposeWidgetStore);
void (null as unknown as PliteExposesOnCommit);
void (null as unknown as PliteDoesNotExposeOnChange);
void (null as unknown as PliteCommitExposesCommit);
void (null as unknown as PliteCommitExposesSnapshot);
void (null as unknown as PliteValueChangeExposesValue);
void (null as unknown as PliteSelectionChangeExposesSelection);
void (null as unknown as EditableRejectsBooleanAutoComplete);

const readPackageJson = () =>
  JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf-8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    exports?: Record<string, unknown>;
    peerDependencies?: Record<string, string>;
    version: string;
  };

const expectedPliteReactRuntimeRootExports = [
  'Editable',
  'EditorReadOnlyProvider',
  'Plite',
  'PliteAnnotationProvider',
  'PliteElement',
  'PliteLeaf',
  'PlitePlaceholder',
  'PliteReactUpdatePolicy',
  'PliteRuntime',
  'PliteText',
  'createEditor',
  'react',
  'setDOMTextSyncRendererCapability',
  'useClaimEditableDOMCommit',
  'useDOMStrategyVirtualOffset',
  'useEditorContext',
  'useEditorComposing',
  'useEditorEditableElement',
  'useEditorFocused',
  'useOptionalEditorReadOnly',
  'useEditorReadOnly',
  'useEditorRootElement',
  'useEditorRuntimeState',
  'useEditorScrollElement',
  'useEditorScrollElementRef',
  'useEditorSelection',
  'useEditorSelector',
  'useEditorState',
  'useEditorViewState',
  'useElement',
  'useOptionalElement',
  'useElementPath',
  'useElementSelected',
  'useNodeSelector',
  'useOptionalEditorContext',
  'useSetStateField',
  'usePliteActiveEditor',
  'usePliteActiveRoot',
  'usePliteAnnotation',
  'usePliteAnnotationStore',
  'usePliteAnnotations',
  'usePliteChildRoot',
  'usePliteCommand',
  'usePliteContentRoot',
  'useEditor',
  'usePliteHistory',
  'usePliteRootChrome',
  'usePliteRootEditor',
  'usePliteRootEffect',
  'usePliteRootState',
  'usePliteRuntime',
  'usePliteRuntimeState',
  'usePliteWidget',
  'usePliteWidgetGeometry',
  'usePliteWidgetIds',
  'usePliteWidgetStore',
  'usePliteWidgets',
  'useSelectionGeometry',
  'useStateFieldValue',
  'useTextSelector',
];

describe('plitejs/react surface contract', () => {
  test('public root runtime values stay exact', () => {
    expect(Object.keys(PliteReact).sort()).toEqual(
      [
        ...new Set([
          ...Object.keys(PliteRoot),
          ...expectedPliteReactRuntimeRootExports,
        ]),
      ].sort()
    );
  });

  test('Editable exposes native beforeinput context without public command handlers', () => {
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'test' }] }],
    });
    let beforeInputContext:
      | Parameters<NonNullable<EditableDOMBeforeInputProps>>[1]
      | null = null;

    render(
      <Plite editor={editor}>
        <Editable
          onDOMBeforeInput={(event, context) => {
            event.preventDefault();
            beforeInputContext = context;
            context.editor.update(() => {});
            return true;
          }}
        />
      </Plite>
    );

    expect(beforeInputContext).toBe(null);
  });

  test('subpaths are not package dependencies', () => {
    const packageJson = readPackageJson();
    const dependencyNames = Object.keys(packageJson.dependencies ?? {});

    expect(dependencyNames.some((name) => name.startsWith('plitejs/'))).toBe(
      false
    );
  });

  test('outer read-only provider supports shell consumers before Plite', () => {
    const Probe = () => (
      <span data-testid="read-only">
        {String(PliteReact.useOptionalEditorReadOnly())}/
        {String(PliteReact.useEditorReadOnly())}
      </span>
    );

    const { getByTestId, rerender } = render(<Probe />);

    expect(getByTestId('read-only').textContent).toBe('undefined/false');

    rerender(
      <PliteReact.EditorReadOnlyProvider readOnly>
        <Probe />
      </PliteReact.EditorReadOnlyProvider>
    );

    expect(getByTestId('read-only').textContent).toBe('true/true');

    rerender(
      <PliteReact.EditorReadOnlyProvider readOnly={false}>
        <Probe />
      </PliteReact.EditorReadOnlyProvider>
    );

    expect(getByTestId('read-only').textContent).toBe('false/false');
  });

  test('all public hook exports carry source JSDoc', () => {
    const indexSource = readFileSync(
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
    );
    const exportPattern = /export \{([^}]+)\} from '([^']+)'/g;
    const missing: string[] = [];

    for (const match of indexSource.matchAll(exportPattern)) {
      const [, rawNames, sourceSpecifier] = match;
      const hookNames = rawNames
        .split(',')
        .map((name) => name.trim().replace(/^type\s+/, ''))
        .map((name) => name.split(/\s+as\s+/)[0]?.trim() ?? '')
        .filter((name) => name.startsWith('use'));

      if (hookNames.length === 0) {
        continue;
      }

      const sourceBase = resolve(reactSourceRoot, sourceSpecifier);
      const sourcePath = existsSync(`${sourceBase}.tsx`)
        ? `${sourceBase}.tsx`
        : `${sourceBase}.ts`;
      const source = readFileSync(sourcePath, 'utf-8');

      for (const hookName of hookNames) {
        const declaration = new RegExp(
          `export\\s+(?:const|function)\\s+${hookName}\\b`
        );
        const declarationIndex = source.search(declaration);

        if (declarationIndex === -1) {
          missing.push(`${hookName}: missing public declaration`);
          continue;
        }

        const beforeDeclaration = source.slice(
          Math.max(0, declarationIndex - 600),
          declarationIndex
        );

        if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
          missing.push(
            `${hookName}: missing immediate source JSDoc in ${relative(
              repoRoot,
              sourcePath
            )}`
          );
        }
      }
    }

    expect(missing).toEqual([]);
  });

  test('public component value exports carry source JSDoc', () => {
    const indexSource = readFileSync(
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
    );
    const exportPattern = /export \{([^}]+)\} from '([^']+)'/g;
    const missing: string[] = [];

    for (const match of indexSource.matchAll(exportPattern)) {
      const [, rawNames, sourceSpecifier] = match;
      const valueNames = rawNames
        .split(',')
        .map((name) => name.trim().replace(/^type\s+/, ''))
        .map((name) => name.split(/\s+as\s+/)[0]?.trim() ?? '')
        .filter((name) => /^[A-Z]/.test(name));

      if (valueNames.length === 0) {
        continue;
      }

      const sourceBase = resolve(reactSourceRoot, sourceSpecifier);
      const sourcePath = existsSync(`${sourceBase}.tsx`)
        ? `${sourceBase}.tsx`
        : `${sourceBase}.ts`;
      const source = readFileSync(sourcePath, 'utf-8');

      for (const valueName of valueNames) {
        const declaration = new RegExp(
          `export\\s+(?:const|function|class)\\s+${valueName}\\b`
        );
        const declarationIndex = source.search(declaration);

        if (declarationIndex === -1) {
          continue;
        }

        const beforeDeclaration = source.slice(
          Math.max(0, declarationIndex - 600),
          declarationIndex
        );

        if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
          missing.push(
            `${valueName}: missing immediate source JSDoc in ${relative(
              repoRoot,
              sourcePath
            )}`
          );
        }
      }
    }

    expect(missing).toEqual([]);
  });

  test('public type exports carry source JSDoc', () => {
    const indexSource = readFileSync(
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
    );
    const exportPattern = /export \{([^}]+)\} from '([^']+)'/g;
    const missing: string[] = [];

    for (const match of indexSource.matchAll(exportPattern)) {
      const [, rawNames, sourceSpecifier] = match;
      const typeNames = rawNames
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name.startsWith('type '))
        .map((name) => name.replace(/^type\s+/, ''))
        .map((name) => name.split(/\s+as\s+/)[0]?.trim() ?? '');

      if (typeNames.length === 0) {
        continue;
      }

      const sourceBase = resolve(reactSourceRoot, sourceSpecifier);
      const sourcePath = existsSync(`${sourceBase}.tsx`)
        ? `${sourceBase}.tsx`
        : `${sourceBase}.ts`;
      const source = readFileSync(sourcePath, 'utf-8');

      for (const typeName of typeNames) {
        const declaration = new RegExp(
          `export\\s+(?:interface|type)\\s+${typeName}\\b`
        );
        const declarationIndex = source.search(declaration);

        if (declarationIndex === -1) {
          missing.push(`${typeName}: missing public type declaration`);
          continue;
        }

        const beforeDeclaration = source.slice(
          Math.max(0, declarationIndex - 600),
          declarationIndex
        );

        if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
          missing.push(
            `${typeName}: missing immediate source JSDoc in ${relative(
              repoRoot,
              sourcePath
            )}`
          );
        }
      }
    }

    expect(missing).toEqual([]);
  });

  test('Editable defaults translate="no" and allows override', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });

    const defaultRender = render(
      <Plite editor={editor}>
        <Editable />
      </Plite>
    );

    expect(
      defaultRender.container
        .querySelector('[data-plite-editor]')
        ?.getAttribute('translate')
    ).toBe('no');

    defaultRender.rerender(
      <Plite editor={editor}>
        <Editable translate="yes" />
      </Plite>
    );

    expect(
      defaultRender.container
        .querySelector('[data-plite-editor]')
        ?.getAttribute('translate')
    ).toBe('yes');
  });

  test('Editable consumes raw element, leaf, text, and void render props', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'code',
          children: [{ text: 'const answer = 42', bold: true }],
        },
        {
          type: 'image',
          url: 'about:blank',
          children: [{ text: '' }],
        },
      ],
    });

    editor.install(blockVoidSchema);

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          renderElement={({ attributes, children }) => (
            <pre {...attributes} data-renderer="code">
              <code>{children}</code>
            </pre>
          )}
          renderLeaf={({ children }) => (
            <strong data-renderer="bold">{children}</strong>
          )}
          renderText={({ attributes, children }) => (
            <span {...attributes} data-renderer="text">
              {children}
            </span>
          )}
          renderVoid={({ element }) => (
            <img
              alt=""
              data-renderer="image"
              height={1}
              src={typeof element.url === 'string' ? element.url : undefined}
              width={1}
            />
          )}
        />
      </Plite>
    );

    expect(
      rendered.container.querySelector('[data-renderer="code"]')
    ).toBeTruthy();
    expect(
      rendered.container.querySelector('[data-renderer="bold"]')
    ).toBeTruthy();
    expect(
      rendered.container.querySelector('[data-renderer="text"]')
    ).toBeTruthy();
    expect(
      rendered.container.querySelector('[data-renderer="image"]')
    ).toBeTruthy();
  });

  test('structured render surface keeps mount identity stable across split and merge', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const mounts = vi.fn();

    const RenderElement = ({ children }: RenderElementProps) => {
      useEffect(() => mounts(), []);
      return <div>{children}</div>;
    };

    const rendered = render(
      <Plite editor={editor}>
        <Editable renderElement={RenderElement} />
      </Plite>
    );

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.split({ at: { path: [0, 0], offset: 2 } });
      });
    });

    expect(mounts).toHaveBeenCalledTimes(2);
    rendered.unmount();

    const mergeEditor = createEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'te' }] },
        { type: 'block', children: [{ text: 'st' }] },
      ],
    });
    const mergeMounts = vi.fn();

    const MergeRenderElement = ({ children }: RenderElementProps) => {
      useEffect(() => mergeMounts(), []);
      return <div>{children}</div>;
    };

    render(
      <Plite editor={mergeEditor}>
        <Editable renderElement={MergeRenderElement} />
      </Plite>
    );

    await act(async () => {
      mergeEditor.update((tx) => {
        tx.nodes.merge({ at: { path: [0, 0], offset: 0 } });
      });
    });

    expect(mergeMounts).toHaveBeenCalledTimes(2);
  });

  test('parent attribute changes do not remount child element renderers', async () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'wrapper',
          status: 'draft',
          children: [{ type: 'child', children: [{ text: 'inside' }] }],
        },
      ],
    });
    const childMounts = vi.fn();
    const childUnmounts = vi.fn();

    const RenderElement = ({ children, element }: RenderElementProps) => {
      const { type } = element as { type?: string };

      useEffect(() => {
        if (type !== 'child') {
          return undefined;
        }

        childMounts();
        return () => childUnmounts();
      }, [type]);

      return <div data-type={type}>{children}</div>;
    };

    render(
      <Plite editor={editor}>
        <Editable renderElement={RenderElement} />
      </Plite>
    );

    expect(childMounts).toHaveBeenCalledTimes(1);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.set({ status: 'review' }, { at: [0] });
      });
    });

    expect(childMounts).toHaveBeenCalledTimes(1);
    expect(childUnmounts).not.toHaveBeenCalled();
  });

  test('useElementSelected remains stable when the selected element path shifts after structural edits', async () => {
    const editor = createEditor({
      initialValue: [
        {
          id: '0',
          children: [
            { id: '0.0', children: [{ text: '' }], type: 'paragraph' },
            { id: '0.1', children: [{ text: '' }], type: 'paragraph' },
            { id: '0.2', children: [{ text: '' }], type: 'paragraph' },
          ],
          type: 'section',
        },
        { id: '1', children: [{ text: '' }], type: 'paragraph' },
        { id: '2', children: [{ text: '' }], type: 'paragraph' },
      ],
    });
    const elementSelectedRenders: Record<string, boolean[] | undefined> = {};
    const latestElementSelected: Record<string, boolean | undefined> = {};

    const RenderElement = createElementSelectedHistoryRenderElement({
      history: elementSelectedRenders,
      latest: latestElementSelected,
    });

    render(
      <Plite editor={editor}>
        <Editable renderElement={RenderElement} />
      </Plite>
    );

    Object.values(elementSelectedRenders).forEach((selectedRenders) => {
      selectedRenders?.splice(0);
    });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [2, 0], offset: 0 });
      });
    });

    expect(elementSelectedRenders).toEqual({
      '0': [],
      '0.0': [],
      '0.1': [],
      '0.2': [],
      '1': [],
      '2': [true],
    });

    Object.values(elementSelectedRenders).forEach((selectedRenders) => {
      selectedRenders?.splice(0);
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert(
          { id: 'new', children: [{ text: '' }], type: 'paragraph' } as never,
          { at: [2] }
        );
      });
    });

    expect(elementSelectedRenders).toEqual({
      '0': [],
      '0.0': [],
      '0.1': [],
      '0.2': [],
      '1': [],
      new: [false],
      '2': [true],
    });
    expect(latestElementSelected['2']).toBe(true);
  });

  test('custom element handlers resolve the current path after leading inserts', async () => {
    const editor = createEditor({
      initialValue: [
        { id: 'first', children: [{ text: '' }], type: 'paragraph' },
        { id: 'target', children: [{ text: '' }], type: 'paragraph' },
      ],
    });
    const renderCounts: Record<string, number | undefined> = {};
    let readTargetPath = (): readonly number[] => {
      throw new Error('Target element did not render.');
    };

    const renderElement = ({
      attributes,
      children,
      element,
    }: RenderElementProps) => {
      const id = String(element.id);
      renderCounts[id] = (renderCounts[id] ?? 0) + 1;

      if (id === 'target') {
        readTargetPath = () => editor.api.dom.assertPath(element);
      }

      return <div {...attributes}>{children}</div>;
    };

    render(
      <Plite editor={editor}>
        <Editable renderElement={renderElement} />
      </Plite>
    );

    expect(readTargetPath()).toEqual([1]);
    renderCounts.first = 0;
    renderCounts.target = 0;

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert(
          {
            id: 'inserted',
            children: [{ text: '' }],
            type: 'paragraph',
          } as never,
          { at: [0] }
        );
      });
    });

    expect(renderCounts.target ?? 0).toBe(0);
    expect(readTargetPath()).toEqual([2]);
  });

  test('renderVoid receives content-only props and runtime owns block void shell', () => {
    const editor = createEditor({
      initialValue: [
        { type: 'image', url: 'about:blank', children: [{ text: '' }] },
      ],
    });
    const renderVoidProps: { current: RenderVoidProps | null } = {
      current: null,
    };
    const renderElement = vi.fn(({ children }: RenderElementProps) => (
      <p>{children}</p>
    ));

    editor.install(blockVoidSchema);

    const renderVoid = (props: RenderVoidProps) => {
      renderVoidProps.current = props;

      return <img alt="" height={1} src="about:blank" width={1} />;
    };

    const rendered = render(
      <Plite editor={editor}>
        <Editable renderElement={renderElement} renderVoid={renderVoid} />
      </Plite>
    );

    const voidElement = rendered.container.querySelector(
      '[data-plite-node="element"][data-plite-void="true"]'
    );
    const spacer = rendered.container.querySelector('[data-plite-spacer]');
    const image = rendered.container.querySelector('img');

    expect(renderElement).not.toHaveBeenCalled();
    expect(renderVoidProps.current).toBeTruthy();
    expect(renderVoidProps.current?.element.type).toBe('image');
    expect('path' in (renderVoidProps.current as object)).toBe(false);
    expect('target' in (renderVoidProps.current as object)).toBe(false);
    expect('actions' in (renderVoidProps.current as object)).toBe(false);
    expect('selected' in (renderVoidProps.current as object)).toBe(false);
    expect('focused' in (renderVoidProps.current as object)).toBe(false);
    expect('children' in (renderVoidProps.current as object)).toBe(false);
    expect('attributes' in (renderVoidProps.current as object)).toBe(false);
    expect(voidElement).toBeTruthy();
    expect(voidElement?.getAttribute('draggable')).toBe('true');
    expect(image).toBeTruthy();
    expect(image?.parentElement?.getAttribute('contenteditable')).toBe('false');
    const zeroWidth = spacer?.querySelector('[data-plite-zero-width]');

    expect(zeroWidth).toHaveAttribute('data-plite-zero-width', 'z');
    expect(zeroWidth?.querySelector('br')).toBeNull();
  });

  test('renderElement owns void nodes when renderVoid is omitted', () => {
    const editor = createEditor({
      initialValue: [
        { type: 'image', url: 'about:blank', children: [{ text: '' }] },
      ],
    });
    const renderElement = vi.fn(
      ({ attributes, children, element }: RenderElementProps) => (
        <figure {...attributes} data-renderer={element.type}>
          {children}
        </figure>
      )
    );

    editor.install(blockVoidSchema);

    const rendered = render(
      <Plite editor={editor}>
        <Editable renderElement={renderElement} />
      </Plite>
    );

    const image = rendered.container.querySelector('[data-renderer="image"]');
    const spacer = image?.querySelector('[data-plite-spacer]');

    expect(renderElement).toHaveBeenCalledTimes(1);
    expect(image).toHaveAttribute('data-plite-node', 'element');
    expect(image).toHaveAttribute('data-plite-void', 'true');
    expect(spacer).toHaveStyle({
      height: '0px',
      position: 'absolute',
    });
    const zeroWidth = spacer?.querySelector('[data-plite-zero-width]');

    expect(zeroWidth).toHaveAttribute('data-plite-zero-width', 'z');
    expect(zeroWidth?.querySelector('br')).toBeNull();
  });

  test('true voids preserve their empty spacer while nested editors stay focusable', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'editable-card',
          children: [{ text: '' }],
        },
      ],
    });

    editor.install(formCardSchema);

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          renderVoid={() => (
            <div data-renderer="editable-card">
              <div contentEditable={false}>Controls</div>
              <div contentEditable>Nested editor target</div>
            </div>
          )}
        />
      </Plite>
    );

    const card = rendered.container.querySelector(
      '[data-renderer="editable-card"]'
    );
    const spacer = rendered.container.querySelector('[data-plite-spacer]');

    expect(card?.parentElement?.getAttribute('contenteditable')).toBe('false');
    expect(
      card
        ?.closest('[data-plite-node="element"][data-plite-void="true"]')
        ?.getAttribute('draggable')
    ).toBe('true');
    expect(card?.querySelector('[contenteditable="false"]')?.textContent).toBe(
      'Controls'
    );
    expect(card?.querySelector('[contenteditable="true"]')).toBeTruthy();
    const zeroWidth = spacer?.querySelector('[data-plite-zero-width]');

    expect(zeroWidth).toHaveAttribute('data-plite-zero-width', 'z');
    expect(zeroWidth?.querySelector('br')).toBeNull();
  });

  test('renderVoid receives content-only props and runtime owns inline void anchor', () => {
    const editor = createEditor({
      extensions: [inlineVoidSchema],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'Before ' },
            {
              type: 'mention',
              character: 'R2-D2',
              children: [{ text: '' }],
            },
            { text: ' after' },
          ],
        },
      ],
    });
    const renderVoidProps: { current: RenderVoidProps | null } = {
      current: null,
    };

    const renderElement = vi.fn(({ children }: RenderElementProps) => (
      <p>{children}</p>
    ));

    const renderVoid = (props: RenderVoidProps) => {
      renderVoidProps.current = props;

      return <span data-cy="visible-mention">@R2-D2</span>;
    };

    const rendered = render(
      <Plite editor={editor}>
        <Editable renderElement={renderElement} renderVoid={renderVoid} />
      </Plite>
    );

    const mention = rendered.container.querySelector(
      '[data-plite-inline="true"][data-plite-void="true"]'
    );

    expect(renderElement).toHaveBeenCalledTimes(1);
    expect(renderVoidProps.current).toBeTruthy();
    expect(renderVoidProps.current?.element.type).toBe('mention');
    expect('path' in (renderVoidProps.current as object)).toBe(false);
    expect('target' in (renderVoidProps.current as object)).toBe(false);
    expect('actions' in (renderVoidProps.current as object)).toBe(false);
    expect('selected' in (renderVoidProps.current as object)).toBe(false);
    expect('focused' in (renderVoidProps.current as object)).toBe(false);
    expect('children' in (renderVoidProps.current as object)).toBe(false);
    expect('attributes' in (renderVoidProps.current as object)).toBe(false);
    expect(mention?.hasAttribute('draggable')).toBe(false);
    expect(mention?.querySelector('[data-cy="visible-mention"]')).toBeTruthy();
    expect(mention?.querySelector('[data-plite-zero-width]')).toBeTruthy();
  });

  test('nested wrappers preserve inline void anchor DOM point round trips', () => {
    const editor = createEditor({
      extensions: [inlineVoidSchema],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'a' },
            {
              type: 'mention',
              character: 'R2-D2',
              children: [{ text: '' }],
            },
            { text: 'b' },
          ],
        },
      ],
    });
    const rendered = render(
      <Plite editor={editor}>
        <Editable
          renderElement={({ attributes, children }) => (
            <article data-wrapper="outer">
              <section data-wrapper="inner">
                <p {...attributes}>{children}</p>
              </section>
            </article>
          )}
          renderVoid={() => <span data-visible-mention>@R2-D2</span>}
        />
      </Plite>
    );
    const outer = rendered.container.querySelector('[data-wrapper="outer"]');
    const inner = rendered.container.querySelector('[data-wrapper="inner"]');
    const paragraph = rendered.container.querySelector(
      '[data-plite-node="element"][data-plite-path="0"]'
    );
    const zeroWidth = rendered.container.querySelector(
      '[data-plite-node="element"][data-plite-path="0,1"] [data-plite-zero-width="z"]'
    );
    const zeroWidthText = zeroWidth?.firstChild;

    expect(outer?.contains(inner)).toBe(true);
    expect(inner?.contains(paragraph)).toBe(true);
    if (!(zeroWidthText instanceof Text)) {
      throw new Error('Expected the inline void anchor text node.');
    }

    const voidPoint = { path: [0, 1, 0], offset: 0 };
    const domPoint = editor.api.dom.assertDOMPoint(voidPoint);

    expect(domPoint).toEqual([zeroWidthText, 0]);
    expect(
      editor.api.dom.assertPlitePoint(domPoint, { exactMatch: false })
    ).toEqual(voidPoint);
    expect(
      editor.api.dom.assertPlitePoint([outer!, 0], { exactMatch: false })
    ).toEqual({ path: [0, 0], offset: 0 });
    expect(
      editor.api.dom.assertPlitePoint([inner!, inner!.childNodes.length], {
        exactMatch: false,
      })
    ).toEqual({ path: [0, 2], offset: 1 });
  });
});
