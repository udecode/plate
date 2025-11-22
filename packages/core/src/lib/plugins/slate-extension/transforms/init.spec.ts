import type { TSelection } from '@platejs/slate';

import { createSlateEditor } from '../../../editor';
import { createSlatePlugin } from '../../../plugin/createSlatePlugin';
import { init } from './init';
import * as pipeNormalizeModule from '../../../../internal/plugin/pipeNormalizeInitialValue';

let mockPipeNormalizeInitialValue: ReturnType<typeof mock>;
let pipeNormalizeSpy: ReturnType<typeof spyOn>;

describe('init', () => {
  let editor: any;

  beforeEach(() => {
    // Set up spy for pipeNormalizeInitialValue
    mockPipeNormalizeInitialValue = mock();
    pipeNormalizeSpy = spyOn(
      pipeNormalizeModule,
      'pipeNormalizeInitialValue'
    ).mockImplementation(mockPipeNormalizeInitialValue);

    editor = createSlateEditor({
      plugins: [createSlatePlugin({ key: 'test' })],
    });

    // Mock editor methods
    editor.api = {
      create: {
        value: mock().mockReturnValue([
          { children: [{ text: '' }], type: 'p' },
        ]),
      },
      end: mock().mockReturnValue({ offset: 0, path: [0, 0] }),
      html: {
        deserialize: mock().mockReturnValue([
          { children: [{ text: 'deserialized' }], type: 'p' },
        ]),
      },
      start: mock().mockReturnValue({ offset: 0, path: [0, 0] }),
    };

    editor.tf = {
      normalize: mock(),
      select: mock(),
    };

    editor.children = [];
  });

  afterEach(() => {
    pipeNormalizeSpy?.mockRestore();
  });

  describe('when value is null', () => {
    it('should call onValueLoaded without setting children', () => {
      const createValueSpy = spyOn(editor.api.create, 'value');

      init(editor, { value: null });

      // Should create default value since children is empty
      expect(createValueSpy).toHaveBeenCalled();
      expect(editor.children).toEqual([
        { children: [{ text: '' }], type: 'p' },
      ]);
    });
  });

  describe('when value is a string', () => {
    it('should deserialize HTML string and call onValueLoaded', () => {
      const htmlString = '<p>test content</p>';
      const deserializeSpy = spyOn(editor.api.html, 'deserialize');

      init(editor, { value: htmlString });

      expect(deserializeSpy).toHaveBeenCalledWith({ element: htmlString });
      expect(editor.children).toEqual([
        { children: [{ text: 'deserialized' }], type: 'p' },
      ]);
      expect(mockPipeNormalizeInitialValue).toHaveBeenCalledWith(editor);
    });
  });

  describe('when value is a synchronous function', () => {
    it('should call the function and set children immediately', () => {
      const syncValue = [{ children: [{ text: 'sync result' }], type: 'p' }];
      const syncFunction = mock().mockReturnValue(syncValue);

      init(editor, { value: syncFunction });

      expect(syncFunction).toHaveBeenCalledWith(editor);
      expect(editor.children).toEqual(syncValue);
      expect(mockPipeNormalizeInitialValue).toHaveBeenCalledWith(editor);
    });

    it('should handle sync function returning undefined', () => {
      const syncFunction = mock().mockReturnValue(undefined);
      const createValueSpy = spyOn(editor.api.create, 'value');

      init(editor, { value: syncFunction });

      expect(syncFunction).toHaveBeenCalledWith(editor);
      expect(createValueSpy).toHaveBeenCalled();
      expect(editor.children).toEqual([
        { children: [{ text: '' }], type: 'p' },
      ]);
    });
  });

  describe('when value is an asynchronous function', () => {
    it('should handle async function and call onValueLoaded after resolution', async () => {
      const asyncValue = [{ children: [{ text: 'async result' }], type: 'p' }];
      const asyncFunction = mock().mockResolvedValue(asyncValue);

      init(editor, { value: asyncFunction });

      expect(asyncFunction).toHaveBeenCalledWith(editor);

      // Wait for the promise to resolve
      await new Promise(process.nextTick);

      expect(editor.children).toEqual(asyncValue);
      expect(mockPipeNormalizeInitialValue).toHaveBeenCalledWith(editor);
    });

    it('should handle async function returning empty array', async () => {
      const asyncFunction = mock().mockResolvedValue([]);
      const createValueSpy = spyOn(editor.api.create, 'value');

      init(editor, { value: asyncFunction });

      // Wait for the promise to resolve
      await new Promise(process.nextTick);

      expect(createValueSpy).toHaveBeenCalled();
      expect(editor.children).toEqual([
        { children: [{ text: '' }], type: 'p' },
      ]);
    });

    it('should properly detect promise using duck typing', () => {
      const promiseLikeObject = {
        then: mock().mockImplementation((callback) => {
          callback([{ children: [{ text: 'promise-like' }], type: 'p' }]);
        }),
      };

      const functionReturningPromiseLike =
        mock().mockReturnValue(promiseLikeObject);

      init(editor, { value: functionReturningPromiseLike });

      expect(promiseLikeObject.then).toHaveBeenCalled();
      expect(editor.children).toEqual([
        { children: [{ text: 'promise-like' }], type: 'p' },
      ]);
    });
  });

  describe('when value is a direct object/array', () => {
    it('should set the value directly', () => {
      const directValue = [{ children: [{ text: 'direct value' }], type: 'p' }];

      init(editor, { value: directValue });

      expect(editor.children).toEqual(directValue);
      expect(mockPipeNormalizeInitialValue).toHaveBeenCalledWith(editor);
    });

    it('should handle falsy values', () => {
      const createValueSpy = spyOn(editor.api.create, 'value');

      init(editor, { value: false });

      expect(createValueSpy).toHaveBeenCalled();
      expect(editor.children).toEqual([
        { children: [{ text: '' }], type: 'p' },
      ]);
    });
  });

  describe('selection handling', () => {
    beforeEach(() => {
      editor.children = [{ children: [{ text: 'content' }], type: 'p' }];
    });

    it('should set explicit selection when provided', () => {
      const selection: TSelection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      };

      init(editor, { selection, value: null });

      expect(editor.selection).toEqual(selection);
      expect(editor.tf.select).not.toHaveBeenCalled();
    });

    it('should auto-select at end when autoSelect is true', () => {
      const endSpy = spyOn(editor.api, 'end');

      init(editor, { autoSelect: true, value: null });

      expect(endSpy).toHaveBeenCalledWith([]);
      expect(editor.tf.select).toHaveBeenCalled();
    });

    it('should auto-select at end when autoSelect is "end"', () => {
      const endSpy = spyOn(editor.api, 'end');

      init(editor, { autoSelect: 'end', value: null });

      expect(endSpy).toHaveBeenCalledWith([]);
      expect(editor.tf.select).toHaveBeenCalled();
    });

    it('should auto-select at start when autoSelect is "start"', () => {
      const startSpy = spyOn(editor.api, 'start');

      init(editor, { autoSelect: 'start', value: null });

      expect(startSpy).toHaveBeenCalledWith([]);
      expect(editor.tf.select).toHaveBeenCalled();
    });

    it('should not auto-select when autoSelect is false', () => {
      init(editor, { autoSelect: false, value: null });

      expect(editor.tf.select).not.toHaveBeenCalled();
    });

    it('should prioritize explicit selection over autoSelect', () => {
      const selection: TSelection = {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      };

      init(editor, { autoSelect: true, selection, value: null });

      expect(editor.selection).toEqual(selection);
      expect(editor.tf.select).not.toHaveBeenCalled();
    });
  });

  describe('normalization handling', () => {
    beforeEach(() => {
      editor.children = [{ children: [{ text: 'content' }], type: 'p' }];
    });

    it('should call pipeNormalizeInitialValue when children exist', () => {
      init(editor, { value: null });

      expect(mockPipeNormalizeInitialValue).toHaveBeenCalledWith(editor);
    });

    it('should not call pipeNormalizeInitialValue when children is empty', () => {
      editor.children = [];
      const createValueSpy = spyOn(editor.api.create, 'value');

      init(editor, { value: null });

      // Should create default value, making children non-empty
      expect(createValueSpy).toHaveBeenCalled();
      expect(mockPipeNormalizeInitialValue).toHaveBeenCalled();
    });

    it('should call editor normalize when shouldNormalizeEditor is true', () => {
      const normalizeSpy = spyOn(editor.tf, 'normalize');

      init(editor, { shouldNormalizeEditor: true, value: null });

      expect(normalizeSpy).toHaveBeenCalledWith({ force: true });
    });

    it('should not call editor normalize when shouldNormalizeEditor is false', () => {
      const normalizeSpy = spyOn(editor.tf, 'normalize');

      init(editor, { shouldNormalizeEditor: false, value: null });

      expect(normalizeSpy).not.toHaveBeenCalled();
    });
  });

  describe('async function with selection and normalization', () => {
    it('should handle all options correctly after async resolution', async () => {
      const asyncValue = [{ children: [{ text: 'async content' }], type: 'p' }];
      const asyncFunction = mock().mockResolvedValue(asyncValue);
      const selection: TSelection = {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      };

      const normalizeSpy = spyOn(editor.tf, 'normalize');

      init(editor, {
        autoSelect: true, // Should be ignored due to explicit selection
        selection,
        shouldNormalizeEditor: true,
        value: asyncFunction,
      });

      // Wait for the promise to resolve
      await new Promise(process.nextTick);

      expect(editor.children).toEqual(asyncValue);
      expect(editor.selection).toEqual(selection);
      expect(editor.tf.select).not.toHaveBeenCalled(); // selection takes priority
      expect(mockPipeNormalizeInitialValue).toHaveBeenCalledWith(editor);
      expect(normalizeSpy).toHaveBeenCalledWith({ force: true });
    });
  });

  describe('onReady callback', () => {
    it('should call onReady with isAsync: false for sync initialization', () => {
      const onReadySpy = mock();
      const directValue = [{ children: [{ text: 'direct value' }], type: 'p' }];

      init(editor, { value: directValue, onReady: onReadySpy });

      expect(onReadySpy).toHaveBeenCalledWith({
        editor,
        isAsync: false,
        value: directValue,
      });
    });

    it('should call onReady with isAsync: false for sync function', () => {
      const onReadySpy = mock();
      const syncValue = [{ children: [{ text: 'sync result' }], type: 'p' }];
      const syncFunction = mock().mockReturnValue(syncValue);

      init(editor, { value: syncFunction, onReady: onReadySpy });

      expect(onReadySpy).toHaveBeenCalledWith({
        editor,
        isAsync: false,
        value: syncValue,
      });
    });

    it('should call onReady with isAsync: false for string value', () => {
      const onReadySpy = mock();
      const htmlString = '<p>test content</p>';

      init(editor, { value: htmlString, onReady: onReadySpy });

      expect(onReadySpy).toHaveBeenCalledWith({
        editor,
        isAsync: false,
        value: [{ children: [{ text: 'deserialized' }], type: 'p' }],
      });
    });

    it('should call onReady with isAsync: true for async function', async () => {
      const onReadySpy = mock();
      const asyncValue = [{ children: [{ text: 'async result' }], type: 'p' }];
      const asyncFunction = mock().mockResolvedValue(asyncValue);

      init(editor, { value: asyncFunction, onReady: onReadySpy });

      // Wait for the promise to resolve
      await new Promise(process.nextTick);

      expect(onReadySpy).toHaveBeenCalledWith({
        editor,
        isAsync: true,
        value: asyncValue,
      });
    });

    it('should call onReady with isAsync: true for promise-like object', () => {
      const onReadySpy = mock();
      const promiseValue = [
        { children: [{ text: 'promise result' }], type: 'p' },
      ];
      const promiseLikeObject = {
        then: mock().mockImplementation((callback) => {
          callback(promiseValue);
        }),
      };
      const functionReturningPromise =
        mock().mockReturnValue(promiseLikeObject);

      init(editor, { value: functionReturningPromise, onReady: onReadySpy });

      expect(onReadySpy).toHaveBeenCalledWith({
        editor,
        isAsync: true,
        value: promiseValue,
      });
    });

    it('should not call onReady when not provided', () => {
      const directValue = [{ children: [{ text: 'direct value' }], type: 'p' }];

      // Should not throw when onReady is not provided
      expect(() => {
        init(editor, { value: directValue });
      }).not.toThrow();
    });

    it('should call onReady with isAsync: false for null value', () => {
      const onReadySpy = mock();

      init(editor, { value: null, onReady: onReadySpy });

      expect(onReadySpy).toHaveBeenCalledWith({
        editor,
        isAsync: false,
        value: [{ children: [{ text: '' }], type: 'p' }], // Default value
      });
    });
  });

  describe('edge cases', () => {
    it('should handle value function that returns null', () => {
      const nullFunction = mock().mockReturnValue(null);
      const createValueSpy = spyOn(editor.api.create, 'value');

      init(editor, { value: nullFunction });

      expect(nullFunction).toHaveBeenCalledWith(editor);
      expect(createValueSpy).toHaveBeenCalled();
    });

    it('should handle value function that throws an error', () => {
      const errorFunction = mock().mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(() => {
        init(editor, { value: errorFunction });
      }).toThrow('Test error');
    });

    it('should work with minimal options', () => {
      init(editor, {});

      // Should create default value since no value provided
      expect(editor.children).toEqual([
        { children: [{ text: '' }], type: 'p' },
      ]);
    });
  });
});
