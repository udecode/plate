import { createSlateEditor } from '../../editor';
import { setFragmentDataStatic } from './setFragmentDataStatic';

// Mock the utility modules
jest.mock('./getSelectedDomBlocks', () => ({
  getSelectedDomBlocks: jest.fn(),
  getSelectedDomNode: jest.fn(),
}));

jest.mock('../internal/getPlainText', () => ({
  getPlainText: jest.fn(),
}));

import { getSelectedDomBlocks, getSelectedDomNode } from './getSelectedDomBlocks';
import { getPlainText } from '../internal/getPlainText';

describe('setFragmentDataStatic', () => {
  let editor: ReturnType<typeof createSlateEditor>;
  let mockDataTransfer: Pick<DataTransfer, 'getData' | 'setData'>;
  
  beforeEach(() => {
    // Create an editor with test data
    editor = createSlateEditor({
      value: [
        {
          id: '1',
          type: 'paragraph',
          children: [{ text: 'First paragraph' }],
        },
        {
          id: '2',
          type: 'paragraph',
          children: [{ text: 'Second paragraph' }],
        },
        {
          id: '3',
          type: 'link',
          url: 'https://example.com',
          children: [{ text: 'Link text' }],
        },
      ],
    });

    // Mock DataTransfer
    mockDataTransfer = {
      getData: jest.fn(),
      setData: jest.fn(),
    };

    // Mock window.btoa
    (global as any).window = {
      btoa: jest.fn((str: string) => Buffer.from(str).toString('base64')),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when no DOM blocks are selected', () => {
    (getSelectedDomBlocks as jest.Mock).mockReturnValue(null);
    
    const result = setFragmentDataStatic(editor, mockDataTransfer);
    
    expect(result).toBe(false);
    expect(mockDataTransfer.setData).not.toHaveBeenCalled();
  });

  it('should return false when empty array of DOM blocks', () => {
    (getSelectedDomBlocks as jest.Mock).mockReturnValue([]);
    
    const result = setFragmentDataStatic(editor, mockDataTransfer);
    
    expect(result).toBe(false);
    expect(mockDataTransfer.setData).not.toHaveBeenCalled();
  });

  it('should set fragment data for single block selection', () => {
    const mockDomBlock = {
      dataset: { slateId: '1' },
    };
    
    (getSelectedDomBlocks as jest.Mock).mockReturnValue([mockDomBlock]);
    
    const mockHtmlNode = {
      innerHTML: '<p>First paragraph</p>',
    };
    (getSelectedDomNode as jest.Mock).mockReturnValue(mockHtmlNode);
    (getPlainText as jest.Mock).mockReturnValue('First paragraph');
    
    const result = setFragmentDataStatic(editor, mockDataTransfer);
    
    expect(result).toBe(true);
    
    // Verify application/x-slate-fragment was set
    const expectedFragment = [
      {
        id: '1',
        type: 'paragraph',
        children: [{ text: 'First paragraph' }],
      },
    ];
    const expectedString = JSON.stringify(expectedFragment);
    const expectedEncoded = Buffer.from(encodeURIComponent(expectedString)).toString('base64');
    
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/x-slate-fragment',
      expectedEncoded
    );
    
    // Verify text/html was set
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'text/html',
      '<p>First paragraph</p>'
    );
    
    // Verify text/plain was set
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'text/plain',
      'First paragraph'
    );
  });

  it('should handle multiple block selection', () => {
    const mockDomBlocks = [
      { dataset: { slateId: '1' } },
      { dataset: { slateId: '2' } },
    ];
    
    (getSelectedDomBlocks as jest.Mock).mockReturnValue(mockDomBlocks);
    
    const mockHtmlNode = {
      innerHTML: '<p>First paragraph</p><p>Second paragraph</p>',
    };
    (getSelectedDomNode as jest.Mock).mockReturnValue(mockHtmlNode);
    (getPlainText as jest.Mock).mockReturnValue('First paragraph\nSecond paragraph');
    
    const result = setFragmentDataStatic(editor, mockDataTransfer);
    
    expect(result).toBe(true);
    
    // Verify the fragment contains both blocks
    const setDataCalls = (mockDataTransfer.setData as jest.Mock).mock.calls;
    const fragmentCall = setDataCalls.find(call => call[0] === 'application/x-slate-fragment');
    
    const encodedFragment = fragmentCall[1];
    const decodedFragment = JSON.parse(
      decodeURIComponent(Buffer.from(encodedFragment, 'base64').toString())
    );
    
    expect(decodedFragment).toHaveLength(2);
    expect(decodedFragment[0].id).toBe('1');
    expect(decodedFragment[1].id).toBe('2');
  });

  it('should skip inline elements with nested paths', () => {
    const mockDomBlocks = [
      { dataset: { slateId: '1' } },
      { dataset: { slateId: '3' } }, // Link element (inline)
    ];
    
    (getSelectedDomBlocks as jest.Mock).mockReturnValue(mockDomBlocks);
    
    const mockHtmlNode = {
      innerHTML: '<p>First paragraph</p><a href="https://example.com">Link text</a>',
    };
    (getSelectedDomNode as jest.Mock).mockReturnValue(mockHtmlNode);
    (getPlainText as jest.Mock).mockReturnValue('First paragraph\nLink text');
    
    const result = setFragmentDataStatic(editor, mockDataTransfer);
    
    expect(result).toBe(true);
    
    // Verify only the paragraph was included (not the inline link)
    const setDataCalls = (mockDataTransfer.setData as jest.Mock).mock.calls;
    const fragmentCall = setDataCalls.find(call => call[0] === 'application/x-slate-fragment');
    
    const encodedFragment = fragmentCall[1];
    const decodedFragment = JSON.parse(
      decodeURIComponent(Buffer.from(encodedFragment, 'base64').toString())
    );
    
    expect(decodedFragment).toHaveLength(1);
    expect(decodedFragment[0].id).toBe('1');
  });

  it('should handle blocks without slate ID', () => {
    const mockDomBlocks = [
      { dataset: { slateId: '1' } },
      { dataset: {} }, // No slateId
      { dataset: { slateId: '2' } },
    ];
    
    (getSelectedDomBlocks as jest.Mock).mockReturnValue(mockDomBlocks);
    
    const mockHtmlNode = {
      innerHTML: '<p>First paragraph</p><p>Second paragraph</p>',
    };
    (getSelectedDomNode as jest.Mock).mockReturnValue(mockHtmlNode);
    (getPlainText as jest.Mock).mockReturnValue('First paragraph\nSecond paragraph');
    
    const result = setFragmentDataStatic(editor, mockDataTransfer);
    
    expect(result).toBe(true);
    
    // Verify only blocks with IDs were included
    const setDataCalls = (mockDataTransfer.setData as jest.Mock).mock.calls;
    const fragmentCall = setDataCalls.find(call => call[0] === 'application/x-slate-fragment');
    
    const encodedFragment = fragmentCall[1];
    const decodedFragment = JSON.parse(
      decodeURIComponent(Buffer.from(encodedFragment, 'base64').toString())
    );
    
    expect(decodedFragment).toHaveLength(2);
    expect(decodedFragment[0].id).toBe('1');
    expect(decodedFragment[1].id).toBe('2');
  });

  it('should handle missing HTML node', () => {
    const mockDomBlock = {
      dataset: { slateId: '1' },
    };
    
    (getSelectedDomBlocks as jest.Mock).mockReturnValue([mockDomBlock]);
    (getSelectedDomNode as jest.Mock).mockReturnValue(null);
    
    const result = setFragmentDataStatic(editor, mockDataTransfer);
    
    expect(result).toBe(true);
    
    // Should still set the slate fragment
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/x-slate-fragment',
      expect.any(String)
    );
    
    // But not HTML or plain text
    expect(mockDataTransfer.setData).toHaveBeenCalledTimes(1);
  });

  it('should handle non-existent node IDs', () => {
    const mockDomBlocks = [
      { dataset: { slateId: '1' } },
      { dataset: { slateId: 'non-existent' } },
    ];
    
    (getSelectedDomBlocks as jest.Mock).mockReturnValue(mockDomBlocks);
    
    const mockHtmlNode = {
      innerHTML: '<p>First paragraph</p>',
    };
    (getSelectedDomNode as jest.Mock).mockReturnValue(mockHtmlNode);
    (getPlainText as jest.Mock).mockReturnValue('First paragraph');
    
    const result = setFragmentDataStatic(editor, mockDataTransfer);
    
    expect(result).toBe(true);
    
    // Verify only existing blocks were included
    const setDataCalls = (mockDataTransfer.setData as jest.Mock).mock.calls;
    const fragmentCall = setDataCalls.find(call => call[0] === 'application/x-slate-fragment');
    
    const encodedFragment = fragmentCall[1];
    const decodedFragment = JSON.parse(
      decodeURIComponent(Buffer.from(encodedFragment, 'base64').toString())
    );
    
    expect(decodedFragment).toHaveLength(1);
    expect(decodedFragment[0].id).toBe('1');
  });
});