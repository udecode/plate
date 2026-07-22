import { BaseBlockquotePlugin } from '@platejs/basic-nodes';
import { BaseCodeBlockPlugin, BaseCodeLinePlugin } from '@platejs/code-block';
import { createBaseEditor } from '@platejs/core';
import { BaseFootnoteDefinitionPlugin } from '@platejs/footnote';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@platejs/layout';
import {
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseListPlugin,
} from '@platejs/list-classic';
import { ElementApi } from '@platejs/plite';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';

const structuralPlugins = [
  BaseTableRowPlugin,
  BaseTableCellPlugin,
  BaseTableCellHeaderPlugin,
  BaseListItemPlugin,
  BaseListItemContentPlugin,
  BaseCodeLinePlugin,
  BaseColumnItemPlugin,
] as const;

const normalFlowContainerPlugins = [
  BaseTableCellPlugin,
  BaseTableCellHeaderPlugin,
  BaseBlockquotePlugin,
  BaseFootnoteDefinitionPlugin,
  BaseColumnItemPlugin,
] as const;

describe('Plate block-content eligibility', () => {
  it('keeps structural elements as Plite blocks without admitting them to roots or normal-flow containers', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseBlockquotePlugin,
        BaseCodeBlockPlugin,
        BaseFootnoteDefinitionPlugin,
        BaseColumnPlugin,
        BaseListPlugin,
        BaseTablePlugin,
      ],
    });
    const structuralTypes = structuralPlugins.map((plugin) =>
      editor.getType(plugin.key)
    );

    for (const plugin of structuralPlugins) {
      const element = editor.read.schema.createAndFill(plugin);

      expect(editor.read.schema.element(plugin)?.groups).toContain('block');

      if (!ElementApi.isElement(element)) {
        throw new Error(`Expected ${plugin.key} to construct an element.`);
      }

      expect(() =>
        editor.read.schema.validateDocument({ children: [element] })
      ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    }

    for (const containerPlugin of normalFlowContainerPlugins) {
      const container = editor.read.schema.createAndFill(containerPlugin);
      const allowedTypes =
        editor.read.schema.element(containerPlugin)?.content
          ?.allowedElementTypes;

      expect(allowedTypes).toBeDefined();

      for (const type of structuralTypes) {
        expect(allowedTypes).not.toContain(type);
      }

      if (!ElementApi.isElement(container)) {
        throw new Error(
          `Expected ${containerPlugin.key} to construct an element.`
        );
      }

      const structuralChild =
        editor.read.schema.createAndFill(BaseTableRowPlugin);

      if (!ElementApi.isElement(structuralChild)) {
        throw new Error(
          'Expected the table-row schema to construct an element.'
        );
      }

      expect(() =>
        editor.read.schema.validateFragment([
          { ...container, children: [structuralChild] },
        ])
      ).toThrow(/cannot contain/i);
    }
  });
});
