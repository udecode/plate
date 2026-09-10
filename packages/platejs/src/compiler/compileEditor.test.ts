import { describe, expect, it } from 'bun:test';

import { getExtensionRegistry } from '../../../plitejs/src/core/extension-registry';
import { createEditorSchemaContract } from '../../../plitejs/src/core/schema-compiler';
import type { EditorExtensionContributionInput } from '../../../plitejs/src/interfaces/editor';
import { hostCodecs } from '../dom';
import {
  defineBasePlugin,
  property,
  schema,
  target,
  type Editor,
} from '../index';
import { getPlateModelPublication } from '../internal/plugin/compilePlateModel';
import { getPlateRuntimeCandidate } from '../internal/plugin/plateRuntime';
import { getPluginStore } from '../internal/plugin/pluginStore';
import { getPlateRuntimeExtensionBindings } from '../internal/plugin/resolvePlugins';
import { createEditor } from '../lib/editor/withPlite';
import { compileEditor } from './compileEditor';

const expectFrozenJson = (value: unknown): void => {
  if (value === null || typeof value !== 'object') {
    expect(
      ['boolean', 'number', 'string'].includes(typeof value) || value === null
    ).toBe(true);
    if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
    return;
  }
  expect(Object.isFrozen(value)).toBe(true);
  expect(
    Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype
  ).toBe(true);
  expect(Object.getOwnPropertySymbols(value)).toHaveLength(0);
  Object.values(value).forEach(expectFrozenJson);
};

describe('compileEditor', () => {
  it('shares runtime lowering while detaching frozen facts and skipping activation and defaults', () => {
    const calls: string[] = [];
    let host: Editor | undefined;
    const Box = defineBasePlugin('compilerBox', {
      activate() {
        calls.push('activate');
      },
      api: ({ editor }) => {
        host = editor;
        calls.push('api');
        return { answer: () => 42 };
      },
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            token: property.string({
              generate: () => {
                calls.push('generate');
                return 'token';
              },
            }),
          },
          type: 'compiler_box',
        },
      },
      update: () => ({ toggle: () => {} }),
      validate() {
        calls.push('validate');
      },
    });
    const input = {
      plugins: [Box],
      schema: {
        id: 'compiler-test',
        version: 1,
        root: schema.content.elements([Box], { min: 1 }),
      },
    } as const;
    const result = compileEditor(input);

    expect(JSON.parse(JSON.stringify(result))).toStrictEqual(result);
    expect(calls).toEqual(['api', 'validate']);
    expect(result.bindings.find(({ name }) => name === 'compilerBox')).toEqual({
      authoredToggle: true,
      name: 'compilerBox',
      type: 'compiler_box',
    });
    expectFrozenJson(result);
    expect(host).toBeDefined();
    expect(host!.read.value().children).toEqual([]);
    expect(getPlateModelPublication(host!)).toBeUndefined();
    expect(getPlateRuntimeCandidate(host!)).toBeUndefined();
    expect(getPlateRuntimeExtensionBindings(host!)).toBeUndefined();
    expect(getPluginStore(host!, Box)).toBeUndefined();
    const runtime = createEditor(input);
    const committed =
      getExtensionRegistry(runtime).schemaContributions.compiled;
    expect(result.schema).toEqual(createEditorSchemaContract(committed));
    expect(result.schema.identity).not.toBe(committed.identity);
    expect(calls).toContain('activate');
    expect(calls).toContain('generate');
    expect(compileEditor(input)).toEqual(result);
  });

  it('keeps exact dependency families and cleans up failed validation', () => {
    let host: Editor | undefined;
    let reject = true;
    const Box = defineBasePlugin('nominalBox', {
      schema: { element: { content: schema.content.text(), type: 'box' } },
    });
    const ForeignBox = defineBasePlugin('nominalBox', {
      schema: { element: { content: schema.content.text(), type: 'box' } },
    });
    const Parent = defineBasePlugin('compilerParent', {
      api: ({ editor }) => {
        host = editor;
        return {};
      },
      dependencies: [Box],
      validate() {
        if (reject) throw new Error('compiler rejected');
      },
    });
    expect(() => compileEditor({ plugins: [Parent] })).toThrow(
      'compiler rejected'
    );
    expect(getPlateModelPublication(host!)).toBeUndefined();
    expect(getPlateRuntimeCandidate(host!)).toBeUndefined();
    expect(getPlateRuntimeExtensionBindings(host!)).toBeUndefined();
    expect(getPluginStore(host!, Parent)).toBeUndefined();
    reject = false;
    expect(
      compileEditor({ plugins: [Parent] }).bindings.some(
        ({ name }) => name === 'nominalBox'
      )
    ).toBe(true);
    expect(() =>
      compileEditor({
        plugins: [Parent],
        schema: {
          properties: {
            tone: schema.elementProperty(property.string(), {
              target: target.element(ForeignBox),
            }),
          },
        },
      })
    ).toThrow('family');
    expect(() =>
      // @ts-expect-error Runtime ingress also rejects forged descriptor identities.
      compileEditor({ plugins: [{ name: 'forged' }] })
    ).toThrow();
  });

  it('clears the Plate publication when final host-codec validation fails', () => {
    let host: Editor | undefined;
    const codecs = hostCodecs('compilerInvalidCodec', [
      {
        parse: () => null,
        format: 'application/x-compiler-test',
        key: 'compiler-invalid',
        owns: [{ kind: 'element', type: 'missing_element' }],
      },
    ]);
    const Plugin = defineBasePlugin('compilerCodec', {
      api: ({ editor }) => {
        host = editor;
        return {};
      },
      contributions:
        codecs.contributions as readonly EditorExtensionContributionInput[],
      initialState: { ready: true },
    });

    expect(() => compileEditor({ plugins: [Plugin] })).toThrow(
      'owns unknown schema element'
    );
    expect(getPlateModelPublication(host!)).toBeUndefined();
    expect(getPlateRuntimeCandidate(host!)).toBeUndefined();
    expect(getPlateRuntimeExtensionBindings(host!)).toBeUndefined();
    expect(getPluginStore(host!, Plugin)).toBeUndefined();
  });
});
