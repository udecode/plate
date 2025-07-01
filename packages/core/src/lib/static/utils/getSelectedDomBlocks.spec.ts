import { getSelectedDomBlocks } from './getSelectedDomBlocks';

describe('getSelectedDomBlocks', () => {
  const mockGetSelection = jest.fn();
  const mockGetRangeAt = jest.fn();
  const mockCloneContents = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.window.getSelection = mockGetSelection;
  });

  it('should return undefined if no selection', () => {
    mockGetSelection.mockReturnValue(null);

    const result = getSelectedDomBlocks();

    expect(result).toBeUndefined();
  });

  it('should return undefined if selection has no ranges', () => {
    mockGetSelection.mockReturnValue({ rangeCount: 0 });

    const result = getSelectedDomBlocks();

    expect(result).toBeUndefined();
  });

  it('should return array of DOM blocks from selection', () => {
    const mockBlock1 = document.createElement('div');
    mockBlock1.setAttribute('data-slate-node', 'element');
    mockBlock1.setAttribute('data-slate-id', '1');

    const mockBlock2 = document.createElement('div');
    mockBlock2.setAttribute('data-slate-node', 'element');
    mockBlock2.setAttribute('data-slate-id', '2');

    const mockFragment = document.createDocumentFragment();
    mockFragment.appendChild(mockBlock1);
    mockFragment.appendChild(mockBlock2);

    mockCloneContents.mockReturnValue(mockFragment);
    mockGetRangeAt.mockReturnValue({ cloneContents: mockCloneContents });
    mockGetSelection.mockReturnValue({
      rangeCount: 1,
      getRangeAt: mockGetRangeAt,
    });

    const result = getSelectedDomBlocks();

    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(result?.[0]).toBe(mockBlock1);
    expect(result?.[1]).toBe(mockBlock2);
  });

  it('should only return elements with both data-slate-node="element" and data-slate-id', () => {
    const mockBlock1 = document.createElement('div');
    mockBlock1.setAttribute('data-slate-node', 'element');
    mockBlock1.setAttribute('data-slate-id', '1');

    const mockBlock2 = document.createElement('div');
    mockBlock2.setAttribute('data-slate-node', 'text'); // Not an element
    mockBlock2.setAttribute('data-slate-id', '2');

    const mockBlock3 = document.createElement('div');
    mockBlock3.setAttribute('data-slate-node', 'element');
    // No data-slate-id

    const mockFragment = document.createDocumentFragment();
    mockFragment.appendChild(mockBlock1);
    mockFragment.appendChild(mockBlock2);
    mockFragment.appendChild(mockBlock3);

    mockCloneContents.mockReturnValue(mockFragment);
    mockGetRangeAt.mockReturnValue({ cloneContents: mockCloneContents });
    mockGetSelection.mockReturnValue({
      rangeCount: 1,
      getRangeAt: mockGetRangeAt,
    });

    const result = getSelectedDomBlocks();

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result?.[0]).toBe(mockBlock1);
  });

  it('should return empty array if no matching blocks found', () => {
    const mockFragment = document.createDocumentFragment();
    const mockDiv = document.createElement('div');
    mockDiv.textContent = 'Some text';
    mockFragment.appendChild(mockDiv);

    mockCloneContents.mockReturnValue(mockFragment);
    mockGetRangeAt.mockReturnValue({ cloneContents: mockCloneContents });
    mockGetSelection.mockReturnValue({
      rangeCount: 1,
      getRangeAt: mockGetRangeAt,
    });

    const result = getSelectedDomBlocks();

    expect(result).toBeDefined();
    expect(result).toHaveLength(0);
  });
});