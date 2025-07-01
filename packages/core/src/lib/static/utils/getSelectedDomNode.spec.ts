import { getSelectedDomNode } from './getSelectedDomNode';

describe('getSelectedDomNode', () => {
  const mockGetSelection = jest.fn();
  const mockGetRangeAt = jest.fn();
  const mockCloneContents = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.window.getSelection = mockGetSelection;
  });

  it('should return undefined if no selection', () => {
    mockGetSelection.mockReturnValue(null);

    const result = getSelectedDomNode();

    expect(result).toBeUndefined();
  });

  it('should return undefined if selection has no ranges', () => {
    mockGetSelection.mockReturnValue({ rangeCount: 0 });

    const result = getSelectedDomNode();

    expect(result).toBeUndefined();
  });

  it('should return a div containing the cloned range contents', () => {
    const mockFragment = document.createDocumentFragment();
    const mockParagraph = document.createElement('p');
    mockParagraph.textContent = 'Selected text';
    mockFragment.appendChild(mockParagraph);

    mockCloneContents.mockReturnValue(mockFragment);
    mockGetRangeAt.mockReturnValue({ cloneContents: mockCloneContents });
    mockGetSelection.mockReturnValue({
      rangeCount: 1,
      getRangeAt: mockGetRangeAt,
    });

    const result = getSelectedDomNode();

    expect(result).toBeDefined();
    expect(result?.tagName).toBe('DIV');
    expect(result?.innerHTML).toBe('<p>Selected text</p>');
  });

  it('should handle empty selection', () => {
    const mockFragment = document.createDocumentFragment();

    mockCloneContents.mockReturnValue(mockFragment);
    mockGetRangeAt.mockReturnValue({ cloneContents: mockCloneContents });
    mockGetSelection.mockReturnValue({
      rangeCount: 1,
      getRangeAt: mockGetRangeAt,
    });

    const result = getSelectedDomNode();

    expect(result).toBeDefined();
    expect(result?.tagName).toBe('DIV');
    expect(result?.innerHTML).toBe('');
  });

  it('should handle complex HTML content', () => {
    const mockFragment = document.createDocumentFragment();
    
    const mockDiv = document.createElement('div');
    mockDiv.innerHTML = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text</p>';
    
    // Append children to fragment
    while (mockDiv.firstChild) {
      mockFragment.appendChild(mockDiv.firstChild);
    }

    mockCloneContents.mockReturnValue(mockFragment);
    mockGetRangeAt.mockReturnValue({ cloneContents: mockCloneContents });
    mockGetSelection.mockReturnValue({
      rangeCount: 1,
      getRangeAt: mockGetRangeAt,
    });

    const result = getSelectedDomNode();

    expect(result).toBeDefined();
    expect(result?.tagName).toBe('DIV');
    expect(result?.innerHTML).toBe('<h1>Title</h1><p>Paragraph with <strong>bold</strong> text</p>');
  });
});