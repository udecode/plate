import { createEditor } from '../../create-editor';
import { deselectDOM } from '../dom-editor/deselectDOM';
import { deselect } from './deselect';

jest.mock('slate', () => ({
  ...jest.requireActual('slate'),
  deselect: jest.fn(),
}));

jest.mock('slate-dom', () => ({
  ...jest.requireActual('slate-dom'),
  DOMEditor: {
    ...jest.requireActual('slate-dom').DOMEditor,
    deselect: jest.fn(),
  },
}));

describe('deselect', () => {
  const editor = createEditor();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deselect()', () => {
    it('should call slate deselect with editor', () => {
      const { deselect: slateDeselect } = require('slate');

      deselect(editor);

      expect(slateDeselect).toHaveBeenCalledTimes(1);
    });
  });

  describe('deselectDOM()', () => {
    it('should call DOMEditor.deselect with editor', () => {
      const { DOMEditor } = require('slate-dom');

      deselectDOM(editor);

      expect(DOMEditor.deselect).toHaveBeenCalledTimes(1);
    });
  });
});
