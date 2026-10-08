import { createEditor as createPliteEditor } from '../../facade';
import { createEditor } from './withPlate';

describe('createEditor', () => {
  it('refuses an existing editor that the options hold as a hidden key', () => {
    const options = {};

    Object.defineProperty(options, 'editor', { value: createPliteEditor() });

    expect(() => createEditor(options)).toThrow(
      'Plate editor constructors always create a new editor'
    );
  });

  it('allocates with the options that the options object inherits', () => {
    const reports: unknown[] = [];
    const viewOnly = createEditor(
      Object.create({ id: 'inherited', readOnly: true })
    );
    const limited = createEditor(
      Object.create({
        lifecycleErrorSink: (error: unknown) => {
          reports.push(error);
        },
        maxLength: 2,
      })
    );

    limited.subscribeCommit(() => {
      throw new Error('commit listener failed');
    });
    limited.update.text.insert('abc', { at: { offset: 0, path: [0, 0] } });

    expect({
      id: viewOnly.id,
      readOnly: viewOnly.read.view.isReadOnly(),
      reports: reports.length,
      text: limited.read.text.string([]),
    }).toEqual({ id: 'inherited', readOnly: true, reports: 1, text: 'ab' });
  });
});
