/**
 * Tests for Phase 5.5 - Document Properties (Extended)
 *
 * Tests cover all 8 new extended properties:
 * 1. Category
 * 2. Content Status
 * 3. Language
 * 4. Application
 * 5. AppVersion
 * 6. Company
 * 7. Manager
 * 8. Custom Properties
 */

import { Document } from '../../src/core/Document';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 5.5 - Document Properties (Extended)', () => {
  const outputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  describe('Core Properties Extensions', () => {
    it('should set and retrieve category', async () => {
      const doc = Document.create();
      doc.setCategory('Technical Documentation');
      doc.createParagraph('Test content');

      const outputPath = path.join(outputDir, 'test-property-category.docx');
      await doc.save(outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();
      expect(props.category).toBe('Technical Documentation');
    });

    it('should set and retrieve content status', async () => {
      const doc = Document.create();
      doc.setContentStatus('Draft');
      doc.createParagraph('Draft content');

      const outputPath = path.join(outputDir, 'test-property-status.docx');
      await doc.save(outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();
      expect(props.contentStatus).toBe('Draft');
    });

    it('should set and retrieve language', async () => {
      const doc = Document.create();
      doc.setLanguage('en-US');
      doc.createParagraph('English content');

      const outputPath = path.join(outputDir, 'test-property-language.docx');
      await doc.save(outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();
      expect(props.language).toBe('en-US');
    });

    it('should handle multiple core properties', async () => {
      const doc = Document.create();
      doc
        .setTitle('Complete Document')
        .setSubject('Testing')
        .setCreator('Test Author')
        .setCategory('Unit Tests')
        .setContentStatus('Final')
        .setLanguage('fr-FR');

      doc.createParagraph('Multi-property test');

      const outputPath = path.join(outputDir, 'test-property-multi-core.docx');
      await doc.save(outputPath);

      // Load and verify all properties
      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();

      expect(props.title).toBe('Complete Document');
      expect(props.subject).toBe('Testing');
      expect(props.creator).toBe('Test Author');
      expect(props.category).toBe('Unit Tests');
      expect(props.contentStatus).toBe('Final');
      expect(props.language).toBe('fr-FR');
    });
  });

  describe('Extended Properties (App Properties)', () => {
    it('should set and retrieve application name', async () => {
      const doc = Document.create();
      doc.setApplication('My Custom App');
      doc.createParagraph('App test');

      const outputPath = path.join(outputDir, 'test-property-application.docx');
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();
      expect(props.application).toBe('My Custom App');
    });

    it('should set and retrieve app version', async () => {
      const doc = Document.create();
      doc.setAppVersion('2.5.1');
      doc.createParagraph('Version test');

      const outputPath = path.join(outputDir, 'test-property-appversion.docx');
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();
      expect(props.appVersion).toBe('2.5.1');
    });

    it('should set and retrieve company name', async () => {
      const doc = Document.create();
      doc.setCompany('ACME Corporation');
      doc.createParagraph('Company test');

      const outputPath = path.join(outputDir, 'test-property-company.docx');
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();
      expect(props.company).toBe('ACME Corporation');
    });

    it('should set and retrieve manager name', async () => {
      const doc = Document.create();
      doc.setManager('Jane Smith');
      doc.createParagraph('Manager test');

      const outputPath = path.join(outputDir, 'test-property-manager.docx');
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();
      expect(props.manager).toBe('Jane Smith');
    });

    it('should handle multiple extended properties', async () => {
      const doc = Document.create();
      doc
        .setApplication('DocXMLater Test Suite')
        .setAppVersion('1.0.0')
        .setCompany('Test Company Inc.')
        .setManager('Test Manager');

      doc.createParagraph('Multi-property extended test');

      const outputPath = path.join(outputDir, 'test-property-multi-extended.docx');
      await doc.save(outputPath);

      // Load and verify all properties
      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();

      expect(props.application).toBe('DocXMLater Test Suite');
      expect(props.appVersion).toBe('1.0.0');
      expect(props.company).toBe('Test Company Inc.');
      expect(props.manager).toBe('Test Manager');
    });
  });

  describe('Custom Properties', () => {
    it('should set and retrieve string custom property', async () => {
      const doc = Document.create();
      doc.setCustomProperty('Department', 'Engineering');
      doc.createParagraph('Custom string test');

      const outputPath = path.join(outputDir, 'test-property-custom-string.docx');
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      expect(loadedDoc.getCustomProperty('Department')).toBe('Engineering');
    });

    it('should set and retrieve number custom property', async () => {
      const doc = Document.create();
      doc.setCustomProperty('PageCount', 42);
      doc.createParagraph('Custom number test');

      const outputPath = path.join(outputDir, 'test-property-custom-number.docx');
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      expect(loadedDoc.getCustomProperty('PageCount')).toBe(42);
    });

    it('should set and retrieve boolean custom property', async () => {
      const doc = Document.create();
      doc.setCustomProperty('IsConfidential', true);
      doc.createParagraph('Custom boolean test');

      const outputPath = path.join(outputDir, 'test-property-custom-boolean.docx');
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      expect(loadedDoc.getCustomProperty('IsConfidential')).toBe(true);
    });

    it('should set and retrieve date custom property', async () => {
      const doc = Document.create();
      const testDate = new Date('2025-01-15T10:00:00Z');
      doc.setCustomProperty('ReviewDate', testDate);
      doc.createParagraph('Custom date test');

      const outputPath = path.join(outputDir, 'test-property-custom-date.docx');
      await doc.save(outputPath);

      // Load and verify (dates are stored as ISO strings)
      const loadedDoc = await Document.load(outputPath);
      const retrievedDate = loadedDoc.getCustomProperty('ReviewDate');
      expect(retrievedDate).toBeDefined();
    });

    it('should set multiple custom properties at once', async () => {
      const doc = Document.create();
      doc.setCustomProperties({
        Project: 'Phase 5.5',
        Version: '1.0',
        BuildNumber: 1234,
        IsRelease: true
      });
      doc.createParagraph('Multi custom properties test');

      const outputPath = path.join(outputDir, 'test-property-custom-multi.docx');
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      expect(loadedDoc.getCustomProperty('Project')).toBe('Phase 5.5');
      expect(loadedDoc.getCustomProperty('Version')).toBe('1.0');
      expect(loadedDoc.getCustomProperty('BuildNumber')).toBe(1234);
      expect(loadedDoc.getCustomProperty('IsRelease')).toBe(true);
    });

    it('should handle custom properties with special characters', async () => {
      const doc = Document.create();
      doc.setCustomProperty('Description', 'Text with <special> & "characters"');
      doc.createParagraph('Special chars test');

      const outputPath = path.join(outputDir, 'test-property-custom-special.docx');
      await doc.save(outputPath);

      // Load and verify XML escaping
      const loadedDoc = await Document.load(outputPath);
      expect(loadedDoc.getCustomProperty('Description')).toBe('Text with <special> & "characters"');
    });
  });

  describe('Combined Properties Test', () => {
    it('should handle all property types together', async () => {
      const doc = Document.create();

      // Core properties
      doc
        .setTitle('Complete Properties Test')
        .setSubject('Phase 5.5 Implementation')
        .setCreator('Test Suite')
        .setKeywords('properties, metadata, docx')
        .setDescription('Testing all document properties')
        .setCategory('Software Testing')
        .setContentStatus('Final')
        .setLanguage('en-GB');

      // Extended properties
      doc
        .setApplication('DocXMLater')
        .setAppVersion('0.43.0')
        .setCompany('DiaTech')
        .setManager('Project Lead');

      // Custom properties
      doc.setCustomProperties({
        Phase: '5.5',
        Feature: 'Document Properties',
        TestCount: 12,
        PassingTests: 12,
        AllPassed: true,
        TestDate: new Date('2025-10-23T18:00:00Z')
      });

      doc.createParagraph('Comprehensive property test document');

      const outputPath = path.join(outputDir, 'test-property-all-combined.docx');
      await doc.save(outputPath);

      // Load and verify ALL properties
      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();

      // Core
      expect(props.title).toBe('Complete Properties Test');
      expect(props.subject).toBe('Phase 5.5 Implementation');
      expect(props.creator).toBe('Test Suite');
      expect(props.category).toBe('Software Testing');
      expect(props.contentStatus).toBe('Final');
      expect(props.language).toBe('en-GB');

      // Extended
      expect(props.application).toBe('DocXMLater');
      expect(props.appVersion).toBe('0.43.0');
      expect(props.company).toBe('DiaTech');
      expect(props.manager).toBe('Project Lead');

      // Custom
      expect(loadedDoc.getCustomProperty('Phase')).toBe('5.5');
      expect(loadedDoc.getCustomProperty('TestCount')).toBe(12);
      expect(loadedDoc.getCustomProperty('AllPassed')).toBe(true);
    });
  });

  describe('Fluent API Chaining', () => {
    it('should support method chaining for all property setters', async () => {
      const doc = Document.create()
        .setTitle('Chained Title')
        .setSubject('Chained Subject')
        .setCreator('Chain Author')
        .setCategory('Chaining')
        .setContentStatus('Draft')
        .setLanguage('es-ES')
        .setApplication('Chain App')
        .setAppVersion('1.0.0')
        .setCompany('Chain Co')
        .setManager('Chain Manager')
        .setCustomProperty('ChainTest', true);

      doc.createParagraph('Method chaining test');

      const outputPath = path.join(outputDir, 'test-property-chaining.docx');
      await doc.save(outputPath);

      const loadedDoc = await Document.load(outputPath);
      const props = loadedDoc.getProperties();

      expect(props.title).toBe('Chained Title');
      expect(props.manager).toBe('Chain Manager');
      expect(loadedDoc.getCustomProperty('ChainTest')).toBe(true);
    });
  });
});
