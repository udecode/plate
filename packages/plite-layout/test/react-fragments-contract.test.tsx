import { afterAll, describe, expect, it } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { render } from '@testing-library/react';
import {
  createReactEditor,
  type RenderElementProps,
  Plite,
} from '@platejs/plite-react';

import {
  createEstimatedPageLayoutEngine,
  createPlitePage,
  createPlitePageLayout,
} from '../src';
import { PagedEditable, usePliteLayoutFragments } from '../src/react';

const registeredDom = typeof document === 'undefined';

if (registeredDom) {
  GlobalRegistrator.register();
}

afterAll(() => {
  if (registeredDom) {
    GlobalRegistrator.unregister();
  }
});

describe('usePliteLayoutFragments', () => {
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
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'table',
          children: rows,
        },
      ],
    });
    const page = { margins: 96, preset: 'a4' } as const;
    const layout = createPlitePageLayout(editor, () => ({
      engine: createEstimatedPageLayoutEngine(),
      nodeLayout({ defaults, element, path, pageSettings }) {
        if (element.type !== 'table') {
          return { boxes: defaults.boxes, type: 'text' };
        }

        const pageRect = createPlitePage(pageSettings);

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
    }));
    const renderElement = (props: RenderElementProps) => {
      if (props.element.type !== 'table') {
        return <div {...props.attributes}>{props.children}</div>;
      }

      return <TableProbe {...props} />;
    };

    const { getByTestId } = render(
      <Plite editor={editor}>
        <PagedEditable layout={layout} renderElement={renderElement} />
      </Plite>
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
});

const TableProbe = ({ attributes, children }: RenderElementProps) => {
  const fragments = usePliteLayoutFragments();

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
