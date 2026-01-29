import { describe, it, expect, vi } from 'vitest';
import { parseDocxComments, isValidDocxFile } from './docxParser';
import type JSZip from 'jszip';

// Mock JSZip
vi.mock('jszip', () => {
  return {
    default: {
      loadAsync: vi.fn()
    }
  };
});

// Mock File.prototype.arrayBuffer for Node.js environment
Object.defineProperty(File.prototype, 'arrayBuffer', {
  value: function() {
    return Promise.resolve(new ArrayBuffer(0));
  },
  writable: true
});

describe('docxParser', () => {
  describe('isValidDocxFile', () => {
    it('accepts valid .docx files', () => {
      const validFile = new File(['content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      expect(isValidDocxFile(validFile)).toBe(true);
    });
    
    it('accepts .docx files with empty mime type', () => {
      const validFile = new File(['content'], 'test.docx', {
        type: ''
      });
      
      expect(isValidDocxFile(validFile)).toBe(true);
    });
    
    it('rejects non-.docx files', () => {
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'text/plain'
      });
      
      expect(isValidDocxFile(invalidFile)).toBe(false);
    });
    
    it('rejects files with wrong extension but correct mime type', () => {
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      expect(isValidDocxFile(invalidFile)).toBe(false);
    });
  });

  describe('parseDocxComments', () => {
    it('returns empty comments when no comments file exists', async () => {
      const { default: JSZip } = await import('jszip');
      
      // Mock a basic document.xml to satisfy the requirement
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockDocumentFile = {
        async: vi.fn().mockResolvedValue(mockDocumentXml)
      };
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          if (path === 'word/document.xml') {
            return mockDocumentFile;
          }
          return null; // All other files return null
        })
      } as unknown as JSZip;
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip);
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toEqual([]);
      expect(result.error).toBeUndefined();
      expect(result.documentXml).toBeDefined();
      expect(result.stylesXml).toBeUndefined();
      expect(result.numberingXml).toBeUndefined();
      expect(result.commentsXml).toBeUndefined();
      expect(result.commentsExtendedXml).toBeUndefined();
    });
    
    it('returns error when required document.xml is missing', async () => {
      const { default: JSZip } = await import('jszip');
      const mockZip = {
        file: vi.fn().mockReturnValue(null) // All files return null
      } as unknown as JSZip;
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip);
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toEqual([]);
      expect(result.error).toBe('Required document.xml not found in .docx file');
    });
    
    it('handles parsing errors gracefully', async () => {
      const { default: JSZip } = await import('jszip');
      
      vi.mocked(JSZip.loadAsync).mockRejectedValue(new Error('Invalid zip file'));
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toEqual([]);
      expect(result.error).toBe('Invalid zip file');
    });
    
    it('parses comments from valid XML', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockCommentsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:comment w:id="0" w:author="John Doe" w:initials="JD" w:date="2023-01-01T10:00:00Z">
            <w:p><w:r><w:t>This is a test comment</w:t></w:r></w:p>
          </w:comment>
        </w:comments>`;
      
      const mockStylesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:type="paragraph" w:styleId="Normal">
            <w:name w:val="Normal"/>
          </w:style>
        </w:styles>`;
      
      const mockDocumentFile = {
        async: vi.fn().mockResolvedValue(mockDocumentXml)
      };
      
      const mockCommentsFile = {
        async: vi.fn().mockResolvedValue(mockCommentsXml)
      };
      
      const mockStylesFile = {
        async: vi.fn().mockResolvedValue(mockStylesXml)
      };
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          switch (path) {
            case 'word/document.xml':
              return mockDocumentFile;
            case 'word/comments.xml':
              return mockCommentsFile;
            case 'word/styles.xml':
              return mockStylesFile;
            default:
              return null;
          }
        })
      } as unknown as JSZip;
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip);
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0]).toMatchObject({
        id: 'doc-1-0',
        author: 'John Doe',
        initial: 'JD',
        plainText: 'This is a test comment',
        content: '<p>This is a test comment</p>',
        documentId: 'doc-1',
        reference: 'Comment 0'
      });
      expect(result.error).toBeUndefined();
      expect(result.documentXml).toBeDefined();
      expect(result.commentsXml).toBeDefined();
      expect(result.stylesXml).toBeDefined();
      expect(result.numberingXml).toBeUndefined();
      expect(result.commentsExtendedXml).toBeUndefined();
    });
    
    it('parses all XML files including optional ones', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockNumberingXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="bullet"/>
            </w:lvl>
          </w:abstractNum>
        </w:numbering>`;
      
      const mockCommentsExtendedXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w15:commentsEx xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml">
          <w15:commentEx w15:paraId="00000001" w15:paraIdParent="00000000" w15:done="0">
          </w15:commentEx>
        </w15:commentsEx>`;
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          const xmlContent = {
            'word/document.xml': mockDocumentXml,
            'word/numbering.xml': mockNumberingXml,
            'word/commentsExtended.xml': mockCommentsExtendedXml
          }[path];
          
          return xmlContent ? {
            async: vi.fn().mockResolvedValue(xmlContent)
          } : null;
        })
      } as unknown as JSZip;
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip);
      
      const file = new File(['content'], 'test.docx');
      const result = await parseDocxComments(file, 'doc-1');
      
      expect(result.comments).toEqual([]);
      expect(result.error).toBeUndefined();
      expect(result.documentXml).toBeDefined();
      expect(result.numberingXml).toBeDefined();
      expect(result.commentsExtendedXml).toBeDefined();
      expect(result.stylesXml).toBeUndefined();
      expect(result.commentsXml).toBeUndefined();
    });

    it('parses footnotes from valid XML', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockFootnotesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:footnote w:type="separator" w:id="-1">
            <w:p><w:r><w:separator/></w:r></w:p>
          </w:footnote>
          <w:footnote w:type="normal" w:id="1">
            <w:p><w:r><w:t>This is a footnote content.</w:t></w:r></w:p>
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
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZip);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.footnotes).toHaveLength(1);
      expect(result.footnotes[0]).toMatchObject({
        id: 'doc-1-footnote-1',
        type: 'footnote',
        content: '<p>This is a footnote content.</p>',
        plainText: 'This is a footnote content.',
        documentId: 'doc-1',
        noteType: 'normal'
      });
      expect(result.footnotesXml).toBeDefined();
    });

    it('parses endnotes from valid XML', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockEndnotesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:endnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:endnote w:type="separator" w:id="-1">
            <w:p><w:r><w:separator/></w:r></w:p>
          </w:endnote>
          <w:endnote w:type="normal" w:id="1">
            <w:p><w:r><w:t>This is an endnote content.</w:t></w:r></w:p>
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
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZip);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.endnotes).toHaveLength(1);
      expect(result.endnotes[0]).toMatchObject({
        id: 'doc-1-endnote-1',
        type: 'endnote',
        content: '<p>This is an endnote content.</p>',
        plainText: 'This is an endnote content.',
        documentId: 'doc-1',
        noteType: 'normal'
      });
      expect(result.endnotesXml).toBeDefined();
    });

    it('skips separator footnotes and endnotes', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockFootnotesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:footnote w:type="separator" w:id="-1">
            <w:p><w:r><w:separator/></w:r></w:p>
          </w:footnote>
          <w:footnote w:type="continuationSeparator" w:id="0">
            <w:p><w:r><w:continuationSeparator/></w:r></w:p>
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
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZip);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.footnotes).toHaveLength(0); // Should skip separator footnotes
      expect(result.footnotesXml).toBeDefined();
    });

    it('parses extended comments with done status and threading', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockCommentsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
          <w:comment w:id="0" w:author="John Doe" w:initials="JD" w:date="2023-12-01T10:00:00Z">
            <w:p w14:paraId="0"><w:r><w:t>This is a main comment</w:t></w:r></w:p>
          </w:comment>
          <w:comment w:id="1" w:author="Jane Smith" w:initials="JS" w:date="2023-12-01T11:00:00Z">
            <w:p w14:paraId="1"><w:r><w:t>This is a reply comment</w:t></w:r></w:p>
          </w:comment>
          <w:comment w:id="2" w:author="Bob Johnson" w:initials="BJ" w:date="2023-12-01T12:00:00Z">
            <w:p w14:paraId="2"><w:r><w:t>This is a done comment</w:t></w:r></w:p>
          </w:comment>
        </w:comments>`;
      
      const mockCommentsExtendedXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w15:commentsEx xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml">
          <w15:commentEx w15:paraId="1" w15:paraIdParent="0">
          </w15:commentEx>
          <w15:commentEx w15:paraId="2" w15:done="1">
          </w15:commentEx>
        </w15:commentsEx>`;
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          const xmlContent = {
            'word/document.xml': mockDocumentXml,
            'word/comments.xml': mockCommentsXml,
            'word/commentsExtended.xml': mockCommentsExtendedXml
          };
          
          if (path in xmlContent) {
            return {
              async: vi.fn().mockResolvedValue(xmlContent[path as keyof typeof xmlContent])
            };
          }
          return null;
        })
      };
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZip);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.comments).toHaveLength(3);
      
      // Check main comment (no extended data)
      const mainComment = result.comments.find(c => c.id === 'doc-1-0');
      expect(mainComment).toBeDefined();
      expect(mainComment?.paraId).toBe('0');
      expect(mainComment?.done).toBe(false);
      expect(mainComment?.parentId).toBeUndefined();
      expect(mainComment?.children).toEqual(['1']); // Children now stores paraIds
      
      // Check reply comment (has parent)
      const replyComment = result.comments.find(c => c.id === 'doc-1-1');
      expect(replyComment).toBeDefined();
      expect(replyComment?.paraId).toBe('1');
      expect(replyComment?.done).toBe(false);
      expect(replyComment?.parentId).toBe('0'); // parentId now stores parent's paraId
      expect(replyComment?.children).toEqual([]);
      
      // Check done comment (marked as resolved)
      const doneComment = result.comments.find(c => c.id === 'doc-1-2');
      expect(doneComment).toBeDefined();
      expect(doneComment?.paraId).toBe('2');
      expect(doneComment?.done).toBe(true);
      expect(doneComment?.parentId).toBeUndefined();
      expect(doneComment?.children).toEqual([]);
      
      expect(result.commentsXml).toBeDefined();
      expect(result.commentsExtendedXml).toBeDefined();
    });

    it('parses commentsIds.xml and extracts durable IDs', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockCommentsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
          <w:comment w:id="0" w:author="John Doe" w:initials="JD" w:date="2023-12-01T10:00:00Z">
            <w:p w14:paraId="12345678"><w:r><w:t>This is a comment with durable ID</w:t></w:r></w:p>
          </w:comment>
        </w:comments>`;
      
      const mockCommentsIdsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w16cid:commentsIds xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid">
          <w16cid:commentId w16cid:paraId="12345678" w16cid:durableId="{ABCD1234-5678-90AB-CDEF-1234567890AB}">
          </w16cid:commentId>
        </w16cid:commentsIds>`;
      
      const mockZip = {
        file: vi.fn().mockImplementation((path: string) => {
          const xmlContent = {
            'word/document.xml': mockDocumentXml,
            'word/comments.xml': mockCommentsXml,
            'word/commentsIds.xml': mockCommentsIdsXml
          };
          
          if (path in xmlContent) {
            return {
              async: vi.fn().mockResolvedValue(xmlContent[path as keyof typeof xmlContent])
            };
          }
          return null;
        })
      };
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZip);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.comments).toHaveLength(1);
      
      const comment = result.comments[0];
      expect(comment).toBeDefined();
      expect(comment?.id).toBe('doc-1-0');
      expect(comment?.paraId).toBe('12345678');
      expect(comment?.durableId).toBe('{ABCD1234-5678-90AB-CDEF-1234567890AB}');
      
      expect(result.commentsXml).toBeDefined();
      expect(result.commentsIdsXml).toBeDefined();
    });

    it('extracts paraId from last paragraph in multi-paragraph comments', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>Test document</w:t></w:r></w:p></w:body>
        </w:document>`;
      
      const mockCommentsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
          <w:comment w:id="0" w:author="John Doe" w:initials="JD" w:date="2023-12-01T10:00:00Z">
            <w:p w14:paraId="11111111"><w:r><w:t>First paragraph of comment</w:t></w:r></w:p>
            <w:p w14:paraId="22222222"><w:r><w:t>Second paragraph of comment</w:t></w:r></w:p>
            <w:p w14:paraId="33333333"><w:r><w:t>Third paragraph of comment</w:t></w:r></w:p>
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
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZip);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.comments).toHaveLength(1);
      
      const comment = result.comments[0];
      expect(comment).toBeDefined();
      expect(comment?.id).toBe('doc-1-0');
      // Should extract paraId from the LAST paragraph (33333333), not the first (11111111)
      expect(comment?.paraId).toBe('33333333');
      expect(comment?.plainText).toContain('First paragraph');
      expect(comment?.plainText).toContain('Second paragraph');
      expect(comment?.plainText).toContain('Third paragraph');
    });

    it('maps comments to paragraphs using commentReference elements', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
          <w:body>
            <w:p>
              <w:pPr><w14:paraId w14:val="PARA001"/></w:pPr>
              <w:r><w:t>First paragraph with comment</w:t></w:r>
              <w:commentRangeStart w:id="0"/>
              <w:r><w:t> highlighted text</w:t></w:r>
              <w:commentRangeEnd w:id="0"/>
              <w:r><w:commentReference w:id="0"/></w:r>
            </w:p>
            <w:p>
              <w:pPr><w14:paraId w14:val="PARA002"/></w:pPr>
              <w:r><w:t>Second paragraph without comment</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr><w14:paraId w14:val="PARA003"/></w:pPr>
              <w:r><w:t>Third paragraph with comment</w:t></w:r>
              <w:commentRangeStart w:id="1"/>
              <w:r><w:t> highlighted text</w:t></w:r>
              <w:commentRangeEnd w:id="1"/>
              <w:r><w:commentReference w:id="1"/></w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const mockCommentsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
          <w:comment w:id="0" w:author="John Doe" w:initials="JD" w:date="2023-12-01T10:00:00Z">
            <w:p w14:paraId="11111111"><w:r><w:t>Comment on first paragraph</w:t></w:r></w:p>
          </w:comment>
          <w:comment w:id="1" w:author="Jane Smith" w:initials="JS" w:date="2023-12-02T10:00:00Z">
            <w:p w14:paraId="22222222"><w:r><w:t>Comment on third paragraph</w:t></w:r></w:p>
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
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZip);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.comments).toHaveLength(2);
      
      const comment0 = result.comments.find(c => c.id === 'doc-1-0');
      expect(comment0).toBeDefined();
      expect(comment0?.paragraphIds).toBeDefined();
      expect(comment0?.paragraphIds).toEqual([0]); // First paragraph index
      
      const comment1 = result.comments.find(c => c.id === 'doc-1-1');
      expect(comment1).toBeDefined();
      expect(comment1?.paragraphIds).toBeDefined();
      expect(comment1?.paragraphIds).toEqual([2]); // Third paragraph index
    });

    it('parses comment ranges from commentRangeStart and commentRangeEnd markers', async () => {
      const { default: JSZip } = await import('jszip');
      
      const mockDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:commentRangeStart w:id="0"/>
              <w:r><w:t>First span</w:t></w:r>
              <w:r><w:t>Second span</w:t></w:r>
              <w:commentRangeEnd w:id="0"/>
              <w:r>
                <w:commentReference w:id="0"/>
                <w:t>Comment marker</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:r><w:t>Another paragraph</w:t></w:r>
            </w:p>
            <w:p>
              <w:commentRangeStart w:id="1"/>
              <w:r><w:t>Para3 Span1</w:t></w:r>
              <w:r><w:t>Para3 Span2</w:t></w:r>
              <w:r><w:t>Para3 Span3</w:t></w:r>
              <w:commentRangeEnd w:id="1"/>
              <w:r>
                <w:commentReference w:id="1"/>
                <w:t>Comment 2</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const mockCommentsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:comment w:id="0" w:author="John Doe" w:date="2023-01-01T10:00:00Z">
            <w:p><w:r><w:t>Comment on first two spans</w:t></w:r></w:p>
          </w:comment>
          <w:comment w:id="1" w:author="Jane Smith" w:date="2023-01-01T11:00:00Z">
            <w:p><w:r><w:t>Comment on three spans in para 3</w:t></w:r></w:p>
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
      
      vi.mocked(JSZip.loadAsync).mockResolvedValue(mockZip as unknown as JSZip);
      
      const result = await parseDocxComments(new File(['test'], 'test.docx'), 'doc-1');
      
      expect(result.comments).toHaveLength(2);
      
      // Check first comment has ranges
      const comment0 = result.comments.find(c => c.id === 'doc-1-0');
      expect(comment0).toBeDefined();
      expect(comment0?.ranges).toBeDefined();
      expect(comment0?.ranges).toHaveLength(1);
      expect(comment0?.ranges?.[0]).toMatchObject({
        paragraphIndex: 0,
        startSpanIndex: 0,
        endSpanIndex: 2 // Spans at indices 0 and 1
      });
      
      // Check second comment has ranges
      const comment1 = result.comments.find(c => c.id === 'doc-1-1');
      expect(comment1).toBeDefined();
      expect(comment1?.ranges).toBeDefined();
      expect(comment1?.ranges).toHaveLength(1);
      expect(comment1?.ranges?.[0]).toMatchObject({
        paragraphIndex: 2, // Third paragraph
        startSpanIndex: 0,
        endSpanIndex: 3 // All three spans
      });
    });
  });
});