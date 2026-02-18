import { describe, expect, it } from 'bun:test';
import { KEYS } from 'platejs';

import { DocxExportKit } from './docx-export-kit';

const getConfiguredComponents = (plugin: any) =>
  plugin.__configuration?.({})?.override?.components;

describe('DocxExportKit', () => {
  it('should be an array with one plugin', () => {
    expect(DocxExportKit).toBeInstanceOf(Array);
    expect(DocxExportKit.length).toBe(1);
  });

  it('should configure DocxExportPlugin with custom components', () => {
    const plugin = DocxExportKit[0] as any;

    expect(plugin).toBeDefined();
    expect(plugin.__configuration).toBeDefined();
    expect(getConfiguredComponents(plugin)).toBeDefined();
  });

  it('should override code block components', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components).toHaveProperty(KEYS.codeBlock);
    expect(components).toHaveProperty(KEYS.codeLine);
    expect(components).toHaveProperty(KEYS.codeSyntax);
  });

  it('should override column components', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components).toHaveProperty(KEYS.column);
    expect(components).toHaveProperty(KEYS.columnGroup);
  });

  it('should override equation components', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components).toHaveProperty(KEYS.equation);
    expect(components).toHaveProperty(KEYS.inlineEquation);
  });

  it('should override callout component', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components).toHaveProperty(KEYS.callout);
  });

  it('should override toc component', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components).toHaveProperty(KEYS.toc);
  });

  it('should override suggestion component', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components).toHaveProperty(KEYS.suggestion);
  });

  it('should have all documented component overrides', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    const expectedKeys = [
      KEYS.codeBlock,
      KEYS.codeLine,
      KEYS.codeSyntax,
      KEYS.column,
      KEYS.columnGroup,
      KEYS.equation,
      KEYS.inlineEquation,
      KEYS.callout,
      KEYS.toc,
      KEYS.suggestion,
    ];

    expectedKeys.forEach((key) => {
      expect(components).toHaveProperty(key);
      expect(components?.[key]).toBeDefined();
    });
  });

  it('should use function components for overrides', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(typeof components?.[KEYS.codeBlock]).toBe('function');
    expect(typeof components?.[KEYS.column]).toBe('function');
    expect(typeof components?.[KEYS.equation]).toBe('function');
    expect(typeof components?.[KEYS.callout]).toBe('function');
    expect(typeof components?.[KEYS.toc]).toBe('function');
    expect(typeof components?.[KEYS.suggestion]).toBe('function');
  });
});

describe('DocxExportKit purpose', () => {
  it('should be optimized for DOCX export with inline styles', () => {
    const plugin = DocxExportKit[0] as any;

    expect(plugin).toBeDefined();
    expect(plugin.__configuration).toBeDefined();
  });

  it('should handle elements requiring special DOCX handling', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components?.[KEYS.codeBlock]).toBeDefined();
    expect(components?.[KEYS.column]).toBeDefined();
    expect(components?.[KEYS.equation]).toBeDefined();
    expect(components?.[KEYS.callout]).toBeDefined();
    expect(components?.[KEYS.toc]).toBeDefined();
    expect(components?.[KEYS.suggestion]).toBeDefined();
  });
});

describe('DocxExportKit component references', () => {
  it('should reference SuggestionLeafDocx for suggestions', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);
    const suggestionComponent = components?.[KEYS.suggestion];

    expect(suggestionComponent).toBeDefined();
    expect(suggestionComponent?.name).toBe('SuggestionLeafDocx');
  });

  it('should reference static DOCX components for code blocks', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components?.[KEYS.codeBlock]?.name).toBe('CodeBlockElementDocx');
    expect(components?.[KEYS.codeLine]?.name).toBe('CodeLineElementDocx');
    expect(components?.[KEYS.codeSyntax]?.name).toBe('CodeSyntaxLeafDocx');
  });

  it('should reference static DOCX components for columns', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components?.[KEYS.column]?.name).toBe('ColumnElementDocx');
    expect(components?.[KEYS.columnGroup]?.name).toBe('ColumnGroupElementDocx');
  });

  it('should reference static DOCX components for equations', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components?.[KEYS.equation]?.name).toBe('EquationElementDocx');
    expect(components?.[KEYS.inlineEquation]?.name).toBe(
      'InlineEquationElementDocx'
    );
  });

  it('should reference CalloutElementDocx for callouts', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components?.[KEYS.callout]?.name).toBe('CalloutElementDocx');
  });

  it('should reference TocElementDocx for TOC', () => {
    const plugin = DocxExportKit[0] as any;
    const components = getConfiguredComponents(plugin);

    expect(components?.[KEYS.toc]?.name).toBe('TocElementDocx');
  });
});
