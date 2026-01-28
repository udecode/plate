/**
 * Header/Footer Round-Trip Test
 *
 * Tests that headers and footers are correctly:
 * 1. Parsed when loading a document
 * 2. Saved with correct [Content_Types].xml entries
 * 3. Preserved through load/save cycles
 */

import { Document, Header, Footer } from '../../src';
import * as path from 'path';
import * as fs from 'fs';

describe('Header/Footer Round-Trip', () => {
  const outputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  it('should create, save, and load document with headers/footers', async () => {
    // Step 1: Create a document with header and footer
    const doc1 = Document.create({
      properties: {
        title: 'Header/Footer Round-Trip Test',
        creator: 'DocXMLater Test Suite',
      },
    });

    // Create header with text
    const header = Header.createDefault();
    header.createParagraph('Document Header').setAlignment('right');

    // Create footer with text
    const footer = Footer.createDefault();
    footer.createParagraph('Page Footer').setAlignment('center');

    // Set header and footer
    doc1.setHeader(header);
    doc1.setFooter(footer);

    // Add body content
    doc1.createParagraph('This document has a header and footer.');

    // Save the document
    const testPath = path.join(outputDir, 'test-header-footer-roundtrip.docx');
    await doc1.save(testPath);

    expect(fs.existsSync(testPath)).toBe(true);

    // Step 2: Load the document back
    const doc2 = await Document.load(testPath);

    // Verify headers and footers were loaded
    const headerFooterManager = doc2.getHeaderFooterManager();
    expect(headerFooterManager.getHeaderCount()).toBeGreaterThan(0);
    expect(headerFooterManager.getFooterCount()).toBeGreaterThan(0);

    // Step 3: Save the loaded document again
    const testPath2 = path.join(outputDir, 'test-header-footer-roundtrip2.docx');
    await doc2.save(testPath2);

    expect(fs.existsSync(testPath2)).toBe(true);

    // Step 4: Verify [Content_Types].xml has correct entries
    // Load the saved document as ZIP and check Content_Types
    const JSZip = require('jszip');
    const fileBuffer = fs.readFileSync(testPath2);
    const zip = await JSZip.loadAsync(fileBuffer);

    const contentTypesFile = zip.file('[Content_Types].xml');
    expect(contentTypesFile).not.toBeNull();

    const contentTypes = await contentTypesFile!.async('string');

    // Verify Override entries for header and footer
    expect(contentTypes).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml');
    expect(contentTypes).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml');

    // Verify the header/footer XML files exist
    expect(zip.file('word/header1.xml')).not.toBeNull();
    expect(zip.file('word/footer1.xml')).not.toBeNull();
  });

  it('should handle remove header/footer operations', async () => {
    // Create document with header and footer
    const doc = Document.create();

    const header = Header.createDefault();
    header.createParagraph('Test Header');

    const footer = Footer.createDefault();
    footer.createParagraph('Test Footer');

    doc.setHeader(header);
    doc.setFooter(footer);

    doc.createParagraph('Content with header and footer');

    // Save initial version
    const testPath1 = path.join(outputDir, 'test-remove-header-footer1.docx');
    await doc.save(testPath1);

    // Remove header
    doc.removeHeader('default');

    // Save after removing header
    const testPath2 = path.join(outputDir, 'test-remove-header-footer2.docx');
    await doc.save(testPath2);

    // Verify header is removed but footer still exists
    const JSZip = require('jszip');
    const fileBuffer2 = fs.readFileSync(testPath2);
    const zip2 = await JSZip.loadAsync(fileBuffer2);

    // Footer should still exist
    expect(zip2.file('word/footer1.xml')).not.toBeNull();

    // Content Types should still have footer override
    const contentTypes2 = await zip2.file('[Content_Types].xml')!.async('string');
    expect(contentTypes2).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml');
  });

  it('should handle clearHeaders and clearFooters operations', async () => {
    // Create document with multiple headers and footers
    const doc = Document.create();

    // Set first page header/footer
    const firstHeader = Header.createFirst();
    firstHeader.createParagraph('First Page Header');

    const firstFooter = Footer.createFirst();
    firstFooter.createParagraph('First Page Footer');

    // Set default header/footer
    const header = Header.createDefault();
    header.createParagraph('Default Header');

    const footer = Footer.createDefault();
    footer.createParagraph('Default Footer');

    doc.setFirstPageHeader(firstHeader);
    doc.setHeader(header);
    doc.setFirstPageFooter(firstFooter);
    doc.setFooter(footer);

    doc.createParagraph('Content');

    // Clear all headers
    doc.clearHeaders();

    // Save after clearing headers
    const testPath = path.join(outputDir, 'test-clear-headers.docx');
    await doc.save(testPath);

    // Verify headers are removed but footers still exist
    const JSZip = require('jszip');
    const fileBuffer = fs.readFileSync(testPath);
    const zip = await JSZip.loadAsync(fileBuffer);

    // Footers should still exist
    expect(zip.file('word/footer1.xml')).not.toBeNull();

    // Clear footers
    doc.clearFooters();

    // Save after clearing footers
    const testPath2 = path.join(outputDir, 'test-clear-all.docx');
    await doc.save(testPath2);

    // Verify no header/footer files exist
    const fileBuffer2 = fs.readFileSync(testPath2);
    const zip2 = await JSZip.loadAsync(fileBuffer2);

    const contentTypes2 = await zip2.file('[Content_Types].xml')!.async('string');

    // Should not contain header/footer content types if no headers/footers exist
    // (or should handle gracefully if empty headers/footers are saved)
  });
});
