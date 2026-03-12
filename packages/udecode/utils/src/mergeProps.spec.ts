import { mergeProps } from './mergeProps';

describe('mergeProps', () => {
  it('composes matching handlers in source order', () => {
    const calls: string[] = [];
    const props = mergeProps(
      {
        onClick: () => {
          calls.push('base');
        },
      },
      {
        onClick: () => {
          calls.push('override');
        },
      }
    );

    expect(props.onClick).toBeDefined();
    props.onClick?.();

    expect(calls).toEqual(['base', 'override']);
  });

  it('overrides non-handler values while limiting merged keys', () => {
    const calls: string[] = [];
    const props = mergeProps(
      {
        id: 'base',
        onBlur: () => {
          calls.push('blur-base');
        },
        onClick: () => {
          calls.push('click-base');
        },
      },
      {
        id: 'override',
        onBlur: () => {
          calls.push('blur-override');
        },
        onClick: () => {
          calls.push('click-override');
        },
      },
      { handlerKeys: ['onClick'] }
    );

    expect(props.onClick).toBeDefined();
    props.onClick?.();
    props.onBlur();

    expect(props.id).toBe('override');
    expect(calls).toEqual(['click-base', 'click-override', 'blur-override']);
  });

  it('returns override values when only one side provides a handler', () => {
    const calls: string[] = [];
    const props = mergeProps(
      {
        id: 'base',
      },
      {
        id: 'override',
        onClick: () => {
          calls.push('override');
        },
      }
    );

    expect(props.onClick).toBeDefined();
    props.onClick?.();

    expect(props.id).toBe('override');
    expect(calls).toEqual(['override']);
  });

  it('supports narrowing merged handlers with a custom query', () => {
    const calls: string[] = [];
    const props = mergeProps(
      {
        onBlur: () => {
          calls.push('blur-base');
        },
        onClick: () => {
          calls.push('base');
        },
      },
      {
        onBlur: () => {
          calls.push('blur-override');
        },
        onClick: () => {
          calls.push('override');
        },
      },
      { handlerQuery: (key) => key.endsWith('Blur') }
    );

    expect(props.onBlur).toBeDefined();
    props.onBlur?.();
    expect(props.onClick).toBeDefined();
    props.onClick?.();

    expect(calls).toEqual(['blur-base', 'blur-override', 'override']);
  });
});
