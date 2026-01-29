import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseDocxComments } from './docxParser';

// Mock JSZip
vi.mock('jszip');

// Mock File.prototype.arrayBuffer for Node.js environment
Object.defineProperty(File.prototype, 'arrayBuffer', {
  value: function() {
    return Promise.resolve(new ArrayBuffer(0));
  },
  writable: true
});

describe('Note and Comment Content Styling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Footnote styling', () => {
    it('should apply paragraph formatting to footnote content', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockFootnotesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:pPr>
                <w:jc w:val="center"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:b/>
                  <w:i/>
                </w:rPr>
                <w:t>This is a bold italic centered footnote.</w:t>
              </w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          const xmlContent = {
            'word/document.xml': mockDocumentXml,
            'word/footnotes.xml': mockFootnotesXml
          };
          
          if (path in xmlContent) {
            return {
              async: vi.fn().mockResolvedValue(xmlContent[path as keyof typeof xmlContent])
            };
          }
          return null;
        })
      };
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as InstanceType<typeof JSZip>);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.footnotes).toHaveLength(1);
      const footnote = result.footnotes[0];
      
      // Check that content has been transformed with styling
      expect(footnote.content).toBeTruthy();
      expect(footnote.content).toContain('text-align: center'); // Center alignment
      expect(footnote.content).toContain('font-weight: bold'); // Bold styling
      expect(footnote.content).toContain('font-style: italic'); // Italic styling
      expect(footnote.content).toContain('This is a bold italic centered footnote.');
    });

    it('should apply numbering to footnote content with separate counters', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockNumberingXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="1">
            <w:lvl w:ilvl="0">
              <w:start w:val="1"/>
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="1"/>
          </w:num>
        </w:numbering>`;
      
      const mockFootnotesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>First numbered item in footnote</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Second numbered item in footnote</w:t></w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          const xmlContent = {
            'word/document.xml': mockDocumentXml,
            'word/footnotes.xml': mockFootnotesXml,
            'word/numbering.xml': mockNumberingXml
          };
          
          if (path in xmlContent) {
            return {
              async: vi.fn().mockResolvedValue(xmlContent[path as keyof typeof xmlContent])
            };
          }
          return null;
        })
      };
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as InstanceType<typeof JSZip>);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.footnotes).toHaveLength(1);
      const footnote = result.footnotes[0];
      
      // Check that content has numbering
      expect(footnote.content).toContain('numbering-text');
      expect(footnote.content).toContain('1.'); // First item
      expect(footnote.content).toContain('2.'); // Second item (separate counter)
    });
  });

  describe('Endnote styling', () => {
    it('should apply paragraph formatting to endnote content', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockEndnotesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:endnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:endnote w:type="normal" w:id="1">
            <w:p>
              <w:pPr>
                <w:jc w:val="right"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:u w:val="single"/>
                </w:rPr>
                <w:t>This is an underlined right-aligned endnote.</w:t>
              </w:r>
            </w:p>
          </w:endnote>
        </w:endnotes>`;
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          const xmlContent = {
            'word/document.xml': mockDocumentXml,
            'word/endnotes.xml': mockEndnotesXml
          };
          
          if (path in xmlContent) {
            return {
              async: vi.fn().mockResolvedValue(xmlContent[path as keyof typeof xmlContent])
            };
          }
          return null;
        })
      };
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as InstanceType<typeof JSZip>);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.endnotes).toHaveLength(1);
      const endnote = result.endnotes[0];
      
      // Check that content has been transformed with styling
      expect(endnote.content).toBeTruthy();
      expect(endnote.content).toContain('text-align: right'); // Right alignment
      expect(endnote.content).toContain('text-decoration: underline'); // Underline styling
      expect(endnote.content).toContain('This is an underlined right-aligned endnote.');
    });

    it('should have separate numbering counters from footnotes', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockNumberingXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="1">
            <w:lvl w:ilvl="0">
              <w:start w:val="1"/>
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="1"/>
          </w:num>
        </w:numbering>`;
      
      const mockFootnotesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:footnote w:type="normal" w:id="1">
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>First item in footnote</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Second item in footnote</w:t></w:r>
            </w:p>
          </w:footnote>
        </w:footnotes>`;
      
      const mockEndnotesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:endnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:endnote w:type="normal" w:id="1">
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>First item in endnote</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Second item in endnote</w:t></w:r>
            </w:p>
          </w:endnote>
        </w:endnotes>`;
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          const xmlContent = {
            'word/document.xml': mockDocumentXml,
            'word/footnotes.xml': mockFootnotesXml,
            'word/endnotes.xml': mockEndnotesXml,
            'word/numbering.xml': mockNumberingXml
          };
          
          if (path in xmlContent) {
            return {
              async: vi.fn().mockResolvedValue(xmlContent[path as keyof typeof xmlContent])
            };
          }
          return null;
        })
      };
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as InstanceType<typeof JSZip>);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.footnotes).toHaveLength(1);
      expect(result.endnotes).toHaveLength(1);
      
      // Both should have numbering starting from 1
      // This verifies they have separate counters
      const footnote = result.footnotes[0];
      const endnote = result.endnotes[0];
      
      // Count occurrences of "1." in each - should both start at 1
      const footnote1Count = (footnote.content.match(/1\./g) || []).length;
      const endnote1Count = (endnote.content.match(/1\./g) || []).length;
      
      expect(footnote1Count).toBeGreaterThan(0);
      expect(endnote1Count).toBeGreaterThan(0);
    });
  });

  describe('Comment styling', () => {
    it('should apply paragraph formatting to comment content', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockCommentsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:comment w:id="1" w:author="Test Author" w:date="2024-01-01T00:00:00Z">
            <w:p>
              <w:pPr>
                <w:jc w:val="both"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:color w:val="FF0000"/>
                </w:rPr>
                <w:t>This is a red justified comment.</w:t>
              </w:r>
            </w:p>
          </w:comment>
        </w:comments>`;
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          const xmlContent = {
            'word/document.xml': mockDocumentXml,
            'word/comments.xml': mockCommentsXml
          };
          
          if (path in xmlContent) {
            return {
              async: vi.fn().mockResolvedValue(xmlContent[path as keyof typeof xmlContent])
            };
          }
          return null;
        })
      };
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as InstanceType<typeof JSZip>);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.comments).toHaveLength(1);
      const comment = result.comments[0];
      
      // Check that content has been transformed with styling
      expect(comment.content).toBeTruthy();
      expect(comment.content).toContain('text-align: justify'); // Justify alignment
      expect(comment.content).toContain('color: #FF0000'); // Red color
      expect(comment.content).toContain('This is a red justified comment.');
    });

    it('should apply numbering to comment content with separate counters', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockNumberingXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="1">
            <w:lvl w:ilvl="0">
              <w:start w:val="1"/>
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="1"/>
          </w:num>
        </w:numbering>`;
      
      const mockCommentsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:comment w:id="1" w:author="Test Author" w:date="2024-01-01T00:00:00Z">
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>First numbered item in comment</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Second numbered item in comment</w:t></w:r>
            </w:p>
          </w:comment>
        </w:comments>`;
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          const xmlContent = {
            'word/document.xml': mockDocumentXml,
            'word/comments.xml': mockCommentsXml,
            'word/numbering.xml': mockNumberingXml
          };
          
          if (path in xmlContent) {
            return {
              async: vi.fn().mockResolvedValue(xmlContent[path as keyof typeof xmlContent])
            };
          }
          return null;
        })
      };
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as InstanceType<typeof JSZip>);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.comments).toHaveLength(1);
      const comment = result.comments[0];
      
      // Check that content has numbering
      expect(comment.content).toContain('numbering-text');
      expect(comment.content).toContain('1.'); // First item
      expect(comment.content).toContain('2.'); // Second item (separate counter)
    });
  });
});
