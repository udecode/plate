import { createCodeMirrorAdapter } from 'platejs/code-block/codemirror';
import type {
  CodeBlockPlugin,
  ExternalTextAdapter,
  ExternalTextState,
  PlateElementProps,
} from 'platejs/react';

const adapter: ExternalTextAdapter<{ language: string }> = {
  mount({ state }) {
    state.config.language.toUpperCase();

    return {
      destroy() {},
      focus() {},
      update({ state: next }) {
        next.config.language.toUpperCase();
      },
    };
  },
};

declare const props: PlateElementProps<typeof CodeBlockPlugin>;
declare const state: ExternalTextState<{ language: string }>;

state.config.language.toUpperCase();
void props.slots.externalText({
  adapter,
  ariaLabel: 'Code block',
  config: { language: 'typescript' },
});

// @ts-expect-error Required adapter config must remain required through Plate.
void props.slots.externalText({ adapter, ariaLabel: 'Code block' });

const codeMirror = createCodeMirrorAdapter({
  loadLanguage(language) {
    language.toUpperCase();

    return [];
  },
});

void props.slots.externalText({
  adapter: codeMirror,
  ariaLabel: 'Code block',
  config: { language: 'typescript' },
});
void props.slots.externalText({
  adapter: codeMirror,
  ariaLabel: 'Code block',
  // @ts-expect-error CodeMirror language config retains the adapter's inferred string type.
  config: { language: 42 },
});
