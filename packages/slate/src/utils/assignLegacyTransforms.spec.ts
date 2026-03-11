import { createEditor } from '../create-editor';
import {
  assignLegacyApi,
  assignLegacyTransforms,
  syncLegacyMethods,
} from './assignLegacyTransforms';

describe('legacy method sync', () => {
  it('assignLegacyTransforms keeps only whitelisted transform names', () => {
    const editor = createEditor();
    const insertText = mock();

    assignLegacyTransforms(editor, {
      insertText,
      notReal: mock(),
    });

    expect(editor.insertText).toBe(insertText);
    expect((editor as any).notReal).toBeUndefined();
  });

  it('assignLegacyApi maps marks to getMarks and ignores unknown keys', () => {
    const editor = createEditor();
    const marks = mock();
    const point = mock();

    assignLegacyApi(editor, {
      marks,
      point,
      notReal: mock(),
    });

    expect(editor.getMarks).toBe(marks);
    expect(editor.point).toBe(point);
    expect((editor as any).notReal).toBeUndefined();
  });

  it('syncLegacyMethods copies legacy methods into editor.api and editor.tf', () => {
    const editor = createEditor();
    const getMarks = mock(() => null) as typeof editor.getMarks;
    const point = mock(() => {}) as typeof editor.point;
    const insertText = mock(() => {}) as typeof editor.insertText;

    Object.assign(editor, {
      getMarks,
      insertText,
      point,
    });

    syncLegacyMethods(editor);

    expect(editor.api.marks as any).toBe(getMarks as any);
    expect(editor.api.point as any).toBe(point as any);
    expect(editor.tf.insertText as any).toBe(insertText as any);
  });
});
