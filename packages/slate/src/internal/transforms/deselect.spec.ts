import { createEditor } from '../../create-editor';
import { deselectDOM } from '../dom-editor/deselectDOM';
import { deselect } from './deselect';

describe('deselect', () => {
  const editor = createEditor();
  let slateDeselectSpy: ReturnType<typeof spyOn>;
  let domEditorDeselectSpy: ReturnType<typeof spyOn>;

  beforeEach(async () => {
    const slate = await import('slate');
    const slateDom = await import('slate-dom');

    slateDeselectSpy = spyOn(slate, 'deselect').mockImplementation(mock());
    domEditorDeselectSpy = spyOn(
      slateDom.DOMEditor,
      'deselect'
    ).mockImplementation(mock());
  });

  afterEach(() => {
    slateDeselectSpy?.mockRestore();
    domEditorDeselectSpy?.mockRestore();
  });

  describe('deselect()', () => {
    it('should call slate deselect with editor', () => {
      deselect(editor);

      expect(slateDeselectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('deselectDOM()', () => {
    it('should call DOMEditor.deselect with editor', () => {
      deselectDOM(editor);

      expect(domEditorDeselectSpy).toHaveBeenCalledTimes(1);
    });
  });
});
