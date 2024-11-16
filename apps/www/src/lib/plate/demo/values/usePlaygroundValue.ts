import { useMemo } from 'react';

import type { Value } from '@udecode/slate';

import { settingsStore } from '@/components/context/settings-store';
import { type ValueId, customizerPlugins } from '@/config/customizer-plugins';
import { aiValue } from '@/registry/default/example/values/ai-value';
import { alignValue } from '@/registry/default/example/values/align-value';
import { autoformatValue } from '@/registry/default/example/values/autoformat-value';
import { basicElementsValue } from '@/registry/default/example/values/basic-elements-value';
import { basicMarksValue } from '@/registry/default/example/values/basic-marks-value';
import { blockMenuValue } from '@/registry/default/example/values/block-menu-value';
import { blockSelectionValue } from '@/registry/default/example/values/block-selection-value';
import { columnValue } from '@/registry/default/example/values/column-value';
import { commentsValue } from '@/registry/default/example/values/comments-value';
import { copilotValue } from '@/registry/default/example/values/copilot-value';
import { cursorOverlayValue } from '@/registry/default/example/values/cursor-overlay-value';
import { dateValue } from '@/registry/default/example/values/date-value';
import { deserializeCsvValue } from '@/registry/default/example/values/deserialize-csv-value';
import { deserializeDocxValue } from '@/registry/default/example/values/deserialize-docx-value';
import { deserializeHtmlValue } from '@/registry/default/example/values/deserialize-html-value';
import { deserializeMdValue } from '@/registry/default/example/values/deserialize-md-value';
import { emojiValue } from '@/registry/default/example/values/emoji-value';
import {
  exitBreakValue,
  trailingBlockValue,
} from '@/registry/default/example/values/exit-break-value';
import { fontValue } from '@/registry/default/example/values/font-value';
import { highlightValue } from '@/registry/default/example/values/highlight-value';
import { horizontalRuleValue } from '@/registry/default/example/values/horizontal-rule-value';
import { indentListValue } from '@/registry/default/example/values/indent-list-value';
import { indentValue } from '@/registry/default/example/values/indent-value';
import { kbdValue } from '@/registry/default/example/values/kbd-value';
import { lineHeightValue } from '@/registry/default/example/values/line-height-value';
import { linkValue } from '@/registry/default/example/values/link-value';
import {
  listValue,
  todoListValue,
} from '@/registry/default/example/values/list-value';
import { mediaValue } from '@/registry/default/example/values/media-value';
import { mentionValue } from '@/registry/default/example/values/mention-value';
import { slashCommandValue } from '@/registry/default/example/values/slash-command-value';
import { softBreakValue } from '@/registry/default/example/values/soft-break-value';
import { tabbableValue } from '@/registry/default/example/values/tabbable-value';
import {
  tableMergeValue,
  tableValue,
} from '@/registry/default/example/values/table-value';
import { tocPlaygroundValue } from '@/registry/default/example/values/toc-value';
import { toggleValue } from '@/registry/default/example/values/toggle-value';

export const usePlaygroundValue = (id?: ValueId): Value => {
  let valueId = settingsStore.use.valueId();

  if (id) {
    valueId = id;
  }

  const version = settingsStore.use.version();

  return useMemo(() => {
    const enabled = settingsStore.get.checkedPlugins();

    let value: any[] = [...basicElementsValue, ...basicMarksValue];

    if (!version) return value;
    if (valueId === 'tableMerge') {
      return tableMergeValue;
    }
    if (valueId === 'tabbable' && enabled.tabbable) {
      return tabbableValue;
    }
    if (valueId !== customizerPlugins.playground.id) {
      let newValue = (customizerPlugins as any)[valueId]?.value ?? value;

      if (newValue.length === 0) {
        newValue = value;
      }

      return newValue;
    }

    value = [{ children: [{ text: 'Playground' }], type: 'h1' }];

    // TOC
    if (enabled.toc) value.push(...tocPlaygroundValue);

    // AI
    value.push({ children: [{ text: 'AI' }], type: 'h1' });

    if (enabled.ai) value.push(...aiValue);
    if (enabled.copilot) value.push(...copilotValue);

    // Standard Markdown nodes
    value.push(
      { children: [{ text: 'Nodes' }], type: 'h1' },
      ...basicElementsValue,
      ...basicMarksValue
    );

    if (enabled.list) value.push(...listValue);
    if (enabled.action_item) value.push(...todoListValue);
    if (enabled.a) value.push(...linkValue);
    if (enabled.hr) value.push(...horizontalRuleValue);
    if (enabled.table) value.push(...tableValue);
    if (enabled.img || enabled.media_embed) value.push(...mediaValue);
    if (enabled.column) value.push(...columnValue);
    if (enabled.mention) value.push(...mentionValue);
    if (enabled.date) value.push(...dateValue);
    if (enabled.emoji) value.push(...emojiValue);
    if (enabled.color || enabled.backgroundColor) value.push(...fontValue);
    if (enabled.highlight) value.push(...highlightValue);
    if (enabled.kbd) value.push(...kbdValue);
    if (enabled.comment) value.push(...commentsValue);

    // Layout and structure
    value.push({ children: [{ text: 'Layout' }], type: 'h1' });

    if (enabled.align) value.push(...alignValue);
    if (enabled.lineHeight) value.push(...lineHeightValue);
    if (enabled.indent) value.push(...indentValue);
    if (enabled.listStyleType) value.push(...indentListValue);
    if (enabled.toggle) value.push(...toggleValue);

    // Functionality
    value.push({ children: [{ text: 'Functionality' }], type: 'h1' });

    if (enabled.slash_command) value.push(...slashCommandValue);
    if (enabled.blockSelection) value.push(...blockSelectionValue);
    if (enabled.blockMenu) value.push(...blockMenuValue);
    if (enabled.autoformat) value.push(...autoformatValue);
    if (enabled.softBreak) value.push(...softBreakValue);
    if (enabled.exitBreak) value.push(...exitBreakValue);
    if (enabled.cursorOverlay) value.push(...cursorOverlayValue);
    if (enabled.trailingBlock) value.push(...trailingBlockValue);

    // Deserialization
    value.push({ children: [{ text: 'Deserialization' }], type: 'h1' });

    if (enabled.html) value.push(...deserializeHtmlValue);
    if (enabled.markdown) value.push(...deserializeMdValue);
    if (enabled.docx) value.push(...deserializeDocxValue);
    if (enabled.csv) value.push(...deserializeCsvValue);

    return value;
  }, [valueId, version]);
};
