import React from 'react';
import { describe, expect, it } from 'bun:test';
import { render } from '@testing-library/react';
import type { TTableCellElement, TTableElement } from 'platejs';

import {
  TableCellElementStatic,
  TableCellHeaderElementStatic,
  TableElementStatic,
  TableRowElementStatic,
} from './table-node-static';

const createMockEditor = (options = {}) => ({
  getOptions: () => ({ disableMarginLeft: false, ...options }),
  getPlugin: () => ({
    api: {
      table: {
        getCellSize: () => ({ width: 120, minHeight: 40 }),
        getCellBorders: () => null,
        getColSpan: () => 1,
        getRowSpan: () => 1,
      },
    },
  }),
});

describe('TableElementStatic', () => {
  it('should render table with correct structure', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: (
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      ),
      editor: createMockEditor() as any,
      element: { type: 'table', children: [], marginLeft: 0 } as TTableElement,
    };

    const { container } = render(<TableElementStatic {...mockProps} />);
    const table = container.querySelector('table');

    expect(table).not.toBeNull();
    expect(table?.style.borderCollapse).toBe('collapse');
  });

  it('should apply marginLeft when not disabled', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: (
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      ),
      editor: createMockEditor({ disableMarginLeft: false }) as any,
      element: { type: 'table', children: [], marginLeft: 20 } as TTableElement,
    };

    const { container } = render(<TableElementStatic {...mockProps} />);
    const wrapper = container.querySelector('[data-slate-node="element"]');

    expect(wrapper?.getAttribute('style')).toContain('padding-left: 20');
  });

  it('should not apply marginLeft when disabled', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: (
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      ),
      editor: createMockEditor({ disableMarginLeft: true }) as any,
      element: { type: 'table', children: [], marginLeft: 20 } as TTableElement,
    };

    const { container } = render(<TableElementStatic {...mockProps} />);
    const wrapper = container.querySelector('[data-slate-node="element"]');

    expect(wrapper?.getAttribute('style')).toContain('padding-left: 0');
  });

  it('should render with overflow-x-auto class', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: (
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      ),
      editor: createMockEditor() as any,
      element: { type: 'table', children: [], marginLeft: 0 } as TTableElement,
    };

    const { container } = render(<TableElementStatic {...mockProps} />);
    const wrapper = container.querySelector('[data-slate-node="element"]');

    expect(wrapper?.className).toContain('overflow-x-auto');
  });
});

describe('TableRowElementStatic', () => {
  it('should render as tr element', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: <td>Cell</td>,
      editor: {} as any,
      element: { type: 'tr', children: [] },
    };

    const { container } = render(<TableRowElementStatic {...mockProps} />);
    const tr = container.querySelector('tr');

    expect(tr).not.toBeNull();
  });

  it('should have h-full class', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: <td>Cell</td>,
      editor: {} as any,
      element: { type: 'tr', children: [] },
    };

    const { container } = render(<TableRowElementStatic {...mockProps} />);
    const tr = container.querySelector('tr');

    expect(tr?.className).toContain('h-full');
  });
});

describe('TableCellElementStatic', () => {
  it('should render as td by default', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: 'Cell content',
      editor: createMockEditor() as any,
      element: {
        type: 'td',
        children: [],
      } as TTableCellElement,
    };

    const { container } = render(<TableCellElementStatic {...mockProps} />);
    const td = container.querySelector('td');

    expect(td).not.toBeNull();
    expect(container.textContent).toBe('Cell content');
  });

  it('should apply cell width from getCellSize', () => {
    const mockEditor = {
      getOptions: () => ({ disableMarginLeft: false }),
      getPlugin: () => ({
        api: {
          table: {
            getCellSize: () => ({ width: 200, minHeight: 50 }),
            getCellBorders: () => null,
            getColSpan: () => 1,
            getRowSpan: () => 1,
          },
        },
      }),
    };

    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: 'Cell',
      editor: mockEditor as any,
      element: {
        type: 'td',
        children: [],
      } as TTableCellElement,
    };

    const { container } = render(<TableCellElementStatic {...mockProps} />);
    const td = container.querySelector('td');

    expect(td?.style.maxWidth).toBe('200px');
    expect(td?.style.minWidth).toBe('200px');
  });

  it('should apply background color when provided', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: 'Cell',
      editor: createMockEditor() as any,
      element: {
        type: 'td',
        children: [],
        background: '#ff0000',
      } as TTableCellElement,
    };

    const { container } = render(<TableCellElementStatic {...mockProps} />);
    const td = container.querySelector('td');

    expect(td?.style.backgroundColor).toMatch(/^(#ff0000|rgb\(255,\s*0,\s*0\))$/);
  });

  it('should apply border styles when borders are provided', () => {
    const mockEditor = {
      getOptions: () => ({ disableMarginLeft: false }),
      getPlugin: () => ({
        api: {
          table: {
            getCellSize: () => ({ width: 120, minHeight: 40 }),
            getCellBorders: () => ({
              top: { size: 1, style: 'solid', color: '#000' },
              right: { size: 2, style: 'dashed', color: '#f00' },
              bottom: { size: 1, style: 'solid', color: '#000' },
              left: { size: 1, style: 'solid', color: '#000' },
            }),
            getColSpan: () => 1,
            getRowSpan: () => 1,
          },
        },
      }),
    };

    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: 'Cell',
      editor: mockEditor as any,
      element: {
        type: 'td',
        children: [],
        borders: {
          top: { size: 1, style: 'solid', color: '#000' },
          right: { size: 2, style: 'dashed', color: '#f00' },
          bottom: { size: 1, style: 'solid', color: '#000' },
          left: { size: 1, style: 'solid', color: '#000' },
        },
      } as TTableCellElement,
    };

    const { container } = render(<TableCellElementStatic {...mockProps} />);
    const td = container.querySelector('td');

    expect(td?.style.borderTop).toContain('1px solid');
    expect(td?.style.borderRight).toContain('2px dashed');
    expect(td?.style.borderBottom).toContain('1px solid');
    expect(td?.style.borderLeft).toContain('1px solid');
  });

  it('should handle colSpan and rowSpan attributes', () => {
    const mockEditor = {
      getOptions: () => ({ disableMarginLeft: false }),
      getPlugin: () => ({
        api: {
          table: {
            getCellSize: () => ({ width: 120, minHeight: 40 }),
            getCellBorders: () => null,
            getColSpan: () => 2,
            getRowSpan: () => 3,
          },
        },
      }),
    };

    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: 'Merged cell',
      editor: mockEditor as any,
      element: {
        type: 'td',
        children: [],
      } as TTableCellElement,
    };

    const { container } = render(<TableCellElementStatic {...mockProps} />);
    const td = container.querySelector('td');

    expect(td?.getAttribute('colSpan')).toBe('2');
    expect(td?.getAttribute('rowSpan')).toBe('3');
  });

  it('should render inner div with padding', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: 'Cell content',
      editor: createMockEditor() as any,
      element: {
        type: 'td',
        children: [],
      } as TTableCellElement,
    };

    const { container } = render(<TableCellElementStatic {...mockProps} />);
    const innerDiv = container.querySelector('td > div');

    expect(innerDiv).not.toBeNull();
    expect(innerDiv?.className).toContain('px-4');
    expect(innerDiv?.className).toContain('py-2');
  });
});

describe('TableCellHeaderElementStatic', () => {
  it('should render as th element', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: 'Header',
      editor: createMockEditor() as any,
      element: {
        type: 'th',
        children: [],
      } as TTableCellElement,
    };

    const { container } = render(
      <TableCellHeaderElementStatic {...mockProps} />
    );
    const th = container.querySelector('th');

    expect(th).not.toBeNull();
    expect(container.textContent).toBe('Header');
  });

  it('should apply header-specific styles', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: 'Header',
      editor: createMockEditor() as any,
      element: {
        type: 'th',
        children: [],
      } as TTableCellElement,
    };

    const { container } = render(
      <TableCellHeaderElementStatic {...mockProps} />
    );
    const th = container.querySelector('th');

    expect(th?.className).toContain('text-left');
    expect(th?.className).toContain('font-normal');
  });
});

describe('cellBorderStyles edge cases', () => {
  it('should handle missing borders gracefully', () => {
    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: 'Cell',
      editor: createMockEditor() as any,
      element: {
        type: 'td',
        children: [],
      } as TTableCellElement,
    };

    const { container } = render(<TableCellElementStatic {...mockProps} />);
    const td = container.querySelector('td');

    // Should render without errors even with no borders
    expect(td).not.toBeNull();
  });

  it('should handle partial border definitions', () => {
    const mockEditor = {
      getOptions: () => ({ disableMarginLeft: false }),
      getPlugin: () => ({
        api: {
          table: {
            getCellSize: () => ({ width: 120, minHeight: 40 }),
            getCellBorders: () => ({
              top: { size: 1, style: 'solid', color: '#000' },
              // Only top border defined
            }),
            getColSpan: () => 1,
            getRowSpan: () => 1,
          },
        },
      }),
    };

    const mockProps = {
      attributes: { 'data-slate-node': 'element' },
      children: 'Cell',
      editor: mockEditor as any,
      element: {
        type: 'td',
        children: [],
        borders: {
          top: { size: 1, style: 'solid', color: '#000' },
        },
      } as TTableCellElement,
    };

    const { container } = render(<TableCellElementStatic {...mockProps} />);
    const td = container.querySelector('td');

    expect(td?.style.borderTop).toContain('1px solid');
    // Other borders should not be set
    expect(td?.style.borderRight).toBe('');
  });
});
