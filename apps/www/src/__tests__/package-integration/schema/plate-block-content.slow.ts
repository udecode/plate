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
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';

const structuralPlugins = [
  BaseTableRowPlugin,
  BaseTableCellPlugin,
  BaseListItemPlugin,
  BaseListItemContentPlugin,
  BaseCodeLinePlugin,
  BaseColumnItemPlugin,
] as const;

const normalFlowContainerPlugins = [
  BaseTableCellPlugin,
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
    const structuralTypes = structuralPlugins.map(
      (plugin) => editor.plugin(plugin).schema.type
    );

    for (const plugin of structuralPlugins) {
      const element = editor.read.schema.create(plugin);

      expect(editor.read.schema.element(plugin)?.groups).toContain('block');

      if (!ElementApi.isElement(element)) {
        throw new Error(`Expected ${plugin.name} to construct an element.`);
      }

      expect(() =>
        editor.read.schema.assertDocument({ children: [element] })
      ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    }

    for (const containerPlugin of normalFlowContainerPlugins) {
      const container = editor.read.schema.create(containerPlugin);
      const allowedTypes =
        editor.read.schema.element(containerPlugin)?.content
          ?.allowedElementTypes;

      expect(allowedTypes).toBeDefined();

      for (const type of structuralTypes) {
        expect(allowedTypes).not.toContain(type);
      }

      if (!ElementApi.isElement(container)) {
        throw new Error(
          `Expected ${containerPlugin.name} to construct an element.`
        );
      }

      const structuralChild = editor.read.schema.create(BaseTableRowPlugin);

      if (!ElementApi.isElement(structuralChild)) {
        throw new Error(
          'Expected the table-row schema to construct an element.'
        );
      }

      expect(() =>
        editor.read.schema.assertFragment([
          { ...container, children: [structuralChild] },
        ])
      ).toThrow(/cannot contain/i);
    }
  });
});
