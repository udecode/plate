import { afterAll, describe, expect, it } from 'bun:test';

import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { render } from '@testing-library/react';
import {
  createEditor,
  type RenderElementProps,
  EditorRoot,
  useElementPath,
} from 'plitejs/react';
import React from 'react';

import {
  createEstimatedPageLayoutEngine,
  createPage,
  createLayout,
} from '../../src/pagination';
import {
  PagedEditable,
  useLayoutFragmentsAtPath,
} from '../../src/pagination/react';

const registeredDom = typeof document === 'undefined';

if (registeredDom) {
  GlobalRegistrator.register();
}

afterAll(() => {
  if (registeredDom) {
    void GlobalRegistrator.unregister();
  }
});

describe('useLayoutFragmentsAtPath', () => {
  it('reads current element fragments without a render-prop path', () => {
    const rows = Array.from({ length: 4 }, (_, rowIndex) => ({
      type: 'table-row',
      children: [
        {
          type: 'table-cell',
          children: [{ text: `Row ${rowIndex + 1}` }],
        },
      ],
    }));
    const editor = createEditor({
      initialValue: [
        {
          type: 'table',
          children: rows,
        },
      ],
    });
    const page = { margins: 96, preset: 'a4' } as const;
    const layout = createLayout(editor, {
      engine: createEstimatedPageLayoutEngine(),
      nodeLayout({ defaults, element, path, pageSettings }) {
        if (element.type !== 'table') {
          return { boxes: defaults.boxes, type: 'text' };
        }

        const pageRect = createPage(pageSettings);

        return {
          boxes: defaults.boxes,
          type: 'units',
          units: rows.map((_, rowIndex) => ({
            key: `row-${rowIndex}`,
            kind: 'table-row',
            path: [...path, rowIndex],
            rect: {
              height: 340,
              left: 0,
              top: rowIndex * 340,
              width: pageRect.content.width,
            },
            split: 'avoid',
          })),
        };
      },
      page,
    });
    const renderElement = (props: RenderElementProps) => {
      if (props.element.type !== 'table') {
        return <div {...props.attributes}>{props.children}</div>;
      }

      return <TableProbe {...props} />;
    };

    const { getByTestId } = render(
      <EditorRoot editor={editor}>
        <PagedEditable layout={layout} renderElement={renderElement} />
      </EditorRoot>
    );

    expect(
      getByTestId('table-fragment-probe').getAttribute('data-fragment-pages')
    ).toBe('0,1');
    expect(
      getByTestId('table-fragment-probe').getAttribute(
        'data-fragment-has-local-top'
      )
    ).toBe('false');
    expect(
      getByTestId('table-fragment-probe').getAttribute(
        'data-fragment-unit-origin'
      )
    ).toBe('true,true');

    layout.destroy();
  });

  it('retains the editable host when page virtualization changes', () => {
    const editor = createEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'Persistent host' }] },
      ],
    });
    const layout = createLayout(editor, {
      engine: createEstimatedPageLayoutEngine(),
      page: { margins: 96, preset: 'a4' },
    });
    const tree = (virtualize: boolean) => (
      <EditorRoot editor={editor}>
        <PagedEditable
          aria-label="Document"
          layout={layout}
          virtualize={virtualize}
        />
      </EditorRoot>
    );
    const mounted = render(tree(false));
    const host = mounted.getByRole('textbox', { name: 'Document' });

    mounted.rerender(tree(true));
    expect(mounted.getByRole('textbox', { name: 'Document' })).toBe(host);

    mounted.rerender(tree(false));
    expect(mounted.getByRole('textbox', { name: 'Document' })).toBe(host);

    mounted.unmount();
    layout.destroy();
  });
});

const TableProbe = ({ attributes, children }: RenderElementProps) => {
  const fragments = useLayoutFragmentsAtPath(useElementPath());

  return (
    <div
      {...attributes}
      data-fragment-has-local-top={String(
        fragments.some((fragment) => 'top' in fragment)
      )}
      data-fragment-pages={fragments
        .map((fragment) => fragment.pageIndex)
        .join(',')}
      data-fragment-unit-origin={fragments
        .map((fragment) =>
          String(fragment.units?.[0]?.rect.top === fragment.rect.top)
        )
        .join(',')}
      data-testid="table-fragment-probe"
    >
      {children}
    </div>
  );
};
