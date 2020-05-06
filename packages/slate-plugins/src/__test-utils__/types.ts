import { Editor } from 'slate';

export interface FixtureEditor {
  module: {
    run: Function;
    input: Editor;
    output: Editor;
  };
}
