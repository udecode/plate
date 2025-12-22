import type { ChatMessage } from '@/registry/components/editor/use-chat';
import type { SlateEditor } from 'platejs';

/** Replace <br/> with \n\n inside <Selection> tags */
// const normalizeSelectionLineBreaks = (text: string): string =>
//   text.replace(
//     /(<Selection>)([\s\S]*?)(<\/Selection>)/g,
//     (_, start, content, end) =>
//       start + content.replace(/<br\s*\/?>/gi, '\n\n') + end
// )

// function buildEditTableSingleCellPrompt(
//   editor: SlateEditor,
//   messages: ChatMessage[]
// ) {
//   addSelection(editor);

//   const selectingMarkdown = normalizeSelectionLineBreaks(
//     getMarkdownWithSelection(editor)
//   );

//   return buildStructuredPrompt({
//     context: selectingMarkdown,
//     examples: [
//       dedent`
//         <instruction>
//         Fix capitalization.
//         </instruction>

//         <context>
//         | Feature | Plate | Tiptap |
//         |---------|-------|--------|
//         | Drag    | ✅    | <Selection>paid extension</Selection> |
//         </context>

//         <output>
//         Paid Extension
//         </output>
//       `,
//       dedent`
//         <instruction>
//         Improve spelling and grammar without changing meaning.
//         </instruction>

//         <context>
//         | Role | Responsibility |
//         |------|----------------|
//         | PM   | <Selection>define product requriements</Selection> |
//         </context>

//         <output>
//         Define product requirements
//         </output>
//       `,
//       dedent`
//         <instruction>
//         Improve word choice.
//         </instruction>

//         <context>
//         This is a <Selection>nice</Selection> person.
//         </context>

//         <output>
//         great
//         </output>
//       `,
//       dedent`
//         <instruction>
//         Make it sound more natural.
//         </instruction>

//         <context>
//         She <Selection>did a party</Selection> yesterday.
//         </context>

//         <output>
//         had a party
//         </output>
//       `,
//     ],

//     history: formatTextFromMessages(messages),
//     instruction: getLastUserInstruction(messages),
//     outputFormatting: 'markdown',
//     rules: dedent`
//       ${commonEditRules}
//       - Preserve the block count, line breaks, and all existing Markdown syntax exactly; only modify the textual content inside each block.
//       - NEVER include the pipe character "|" or any table structure in the output.
//     `,
//     task: dedent`
//     The following <context> is text from inside a single table cell. The editable range is wrapped in <Selection>.
//     Modify ONLY the text inside <Selection>.
//     Return plain text that directly replaces <Selection>.
//     Do NOT output any "|" characters, table syntax, markdown, or surrounding context—only the replacement text.
//   `,
//   });
// }

// TODO: Implement multi-cell table editing
function buildEditTableMultiCellPrompt(
  _editor: SlateEditor,
  _messages: ChatMessage[]
): string {
  throw new Error('Multi-cell table editing is not yet supported');
}

export function buildEditTablePrompt(
  editor: SlateEditor,
  messages: ChatMessage[]
) {
  // if (isSingleCellSelection(editor)) {
  //   return buildEditTableSingleCellPrompt(editor, messages);
  // }

  return buildEditTableMultiCellPrompt(editor, messages);
}
