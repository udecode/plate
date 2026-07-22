import { isEquivalentPlatePluginConfig } from '../../internal/plugin/resolvePlugins';

import {
  definePluginHostPolicy,
  getPluginHostPolicyResource,
  isPluginHostPolicy,
} from './pluginHostPolicy';

describe('PluginHostPolicy', () => {
  it('creates one nominal frozen token and snapshots plain resources', () => {
    const input = {
      nested: { values: ['first'] },
      parse: (value: string) => value.toUpperCase(),
    };
    const policy = definePluginHostPolicy({
      id: 'plate-test:host-policy:snapshot',
      resource: input,
      version: 1,
    });
    const resource = getPluginHostPolicyResource(policy);

    input.nested.values.push('mutated');

    expect(policy).toEqual({
      id: 'plate-test:host-policy:snapshot',
      version: 1,
    });
    expect(Reflect.ownKeys(policy)).toEqual(['id', 'version']);
    expect(Object.isFrozen(policy)).toBe(true);
    expect(Object.isFrozen(resource)).toBe(true);
    expect(Object.isFrozen(resource.nested)).toBe(true);
    expect(Object.isFrozen(resource.nested.values)).toBe(true);
    expect(resource.nested.values).toEqual(['first']);
    expect(resource.parse).toBe(input.parse);
    expect(isPluginHostPolicy(policy)).toBe(true);
  });

  it('rejects structural forgeries at the runtime boundary', () => {
    const policy = definePluginHostPolicy({
      id: 'plate-test:host-policy:nominal',
      resource: { value: 1 },
      version: 1,
    });
    const forged = { ...policy };

    expect(isPluginHostPolicy(forged)).toBe(false);
    expect(() =>
      Reflect.apply(getPluginHostPolicyResource, undefined, [forged])
    ).toThrow('Invalid Plate host policy token.');
  });

  it('validates exact identity input before capturing a resource', () => {
    expect(() =>
      definePluginHostPolicy({
        id: '',
        resource: {},
        version: 1,
      })
    ).toThrow('id cannot be empty');
    expect(() =>
      definePluginHostPolicy({
        id: 'plate-test:host-policy:version',
        resource: {},
        version: 0,
      })
    ).toThrow('positive integer');
    expect(() =>
      definePluginHostPolicy({
        id: 'plate-test:host-policy:fractional-version',
        resource: {},
        version: 1.5,
      })
    ).toThrow('positive integer');
    expect(() =>
      Reflect.apply(definePluginHostPolicy, undefined, [
        {
          extra: true,
          id: 'plate-test:host-policy:extra',
          resource: {},
          version: 1,
        },
      ])
    ).toThrow('supports only id, version, and resource');

    const hiddenInput = {
      id: 'plate-test:host-policy:hidden',
      resource: {},
      version: 1,
    };

    Object.defineProperty(hiddenInput, 'resource', {
      enumerable: false,
      value: {},
    });

    expect(() => definePluginHostPolicy(hiddenInput)).toThrow(
      'cannot contain accessors, symbols, or hidden data'
    );
  });

  it('rejects ambiguous plain resource graphs', () => {
    const cyclic: Record<string, unknown> = {};

    cyclic.self = cyclic;

    expect(() =>
      definePluginHostPolicy({
        id: 'plate-test:host-policy:cycle',
        resource: cyclic,
        version: 1,
      })
    ).toThrow('cannot be cyclic');
    expect(() =>
      definePluginHostPolicy({
        id: 'plate-test:host-policy:nonfinite',
        resource: { value: Number.POSITIVE_INFINITY },
        version: 1,
      })
    ).toThrow('only finite numbers');

    const accessorResource = {};

    Object.defineProperty(accessorResource, 'value', {
      enumerable: true,
      get: () => 1,
    });

    expect(() =>
      definePluginHostPolicy({
        id: 'plate-test:host-policy:accessor',
        resource: accessorResource,
        version: 1,
      })
    ).toThrow('cannot contain accessors or hidden data');

    const symbolResource = { [Symbol('private')]: true };

    expect(() =>
      definePluginHostPolicy({
        id: 'plate-test:host-policy:symbol',
        resource: symbolResource,
        version: 1,
      })
    ).toThrow('cannot contain symbol-keyed data');
  });

  it('retains explicitly trusted non-plain resources behind the token', () => {
    class ParserRuntime {
      parse(value: string) {
        return value.toUpperCase();
      }
    }

    const parser = new ParserRuntime();
    const lookup = new Map([['name', 'Plate']]);
    const policy = definePluginHostPolicy({
      id: 'plate-test:host-policy:trusted-runtime',
      resource: { lookup, parser },
      version: 1,
    });
    const resource = getPluginHostPolicyResource(policy);

    expect(resource.parser).toBe(parser);
    expect(resource.lookup).toBe(lookup);
    expect(resource.parser.parse('plate')).toBe('PLATE');
  });

  it('treats token reuse as equivalent and a new token as a rebind', () => {
    const first = definePluginHostPolicy({
      id: 'plate-test:host-policy:equality',
      resource: { parse: (value: string) => value },
      version: 1,
    });
    const second = definePluginHostPolicy({
      id: 'plate-test:host-policy:equality',
      resource: { parse: (value: string) => value },
      version: 1,
    });

    expect(
      isEquivalentPlatePluginConfig({ profile: first }, { profile: first })
    ).toBe(true);
    expect(
      isEquivalentPlatePluginConfig({ profile: first }, { profile: second })
    ).toBe(false);
  });
});
