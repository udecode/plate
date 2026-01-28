import { Extension } from '@core/index.js';
import { getMarksFromSelection } from '@/core/helpers/getMarksFromSelection.js';

export const FormatCommands = Extension.create({
  name: 'formatCommands',

  addOptions() {
    return {};
  },

  addStorage() {
    return {
      storedStyle: null,
    };
  },

  addCommands() {
    return {
      clearFormat:
        () =>
        ({ chain }) => {
          return chain().clearNodes().unsetAllMarks().run();
        },

      clearMarksFormat:
        () =>
        ({ chain }) => {
          return chain().unsetAllMarks().run();
        },

      clearNodesFormat:
        () =>
        ({ chain }) => {
          return chain().clearNodes().run();
        },

      copyFormat:
        () =>
        ({ chain }) => {
          // If we don't have a saved style, save the current one
          if (!this.storage.storedStyle) {
            const marks = getMarksFromSelection(this.editor.state);
            this.storage.storedStyle = marks;
            return true;
          }

          // Special case: if there are no stored marks, but this is still an apply action
          // We just clear the format
          if (!this.storage.storedStyle.length) {
            this.storage.storedStyle = null;
            return chain().clearFormat().run();
          }

          // If we do have a stored style, apply it
          const storedMarks = this.storage.storedStyle;
          const processedMarks = [];
          storedMarks.forEach((mark) => {
            const { type, attrs } = mark;
            const { name } = type;

            if (name === 'textStyle') {
              Object.keys(attrs).forEach((key) => {
                if (!attrs[key]) return;
                const attributes = {};
                attributes[key] = attrs[key];
                processedMarks.push({ name: key, attrs: attributes });
              });
            } else {
              processedMarks.push({ name, attrs });
            }
          });

          const marksToCommands = {
            bold: ['setBold', 'unsetBold'],
            italic: ['setItalic', 'unsetItalic'],
            underline: ['setUnderline', 'unsetUnderline'],
            color: ['setColor', 'setColor', null],
            fontSize: ['setFontSize', 'unsetFontSize'],
            fontFamily: ['setFontFamily', 'unsetFontFamily'],
          };

          // Apply marks present, clear ones that are not, by chaining commands
          let result = chain();
          Object.keys(marksToCommands).forEach((key) => {
            const [setCommand, unsetCommand, defaultParam] = marksToCommands[key];
            const markToApply = processedMarks.find((mark) => mark.name === key);
            const hasEmptyAttrs = markToApply?.attrs && markToApply?.attrs[key];

            let cmd = {};
            if (!markToApply && !hasEmptyAttrs) cmd = { command: unsetCommand, argument: defaultParam };
            else cmd = { command: setCommand, argument: markToApply.attrs[key] || defaultParam };
            result = result[cmd.command](cmd.argument);
          });

          this.storage.storedStyle = null;
          return result;
        },
    };
  },

  addShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.clearFormat(),
    };
  },
});
