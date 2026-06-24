import {
  createAgentBrowserIosDescriptor,
  createAppiumAndroidDescriptor,
  createAppiumIosDescriptor,
} from '../../src/transports';

describe('transport descriptors', () => {
  it('defaults descriptor URLs to debug mode', () => {
    const target = { example: 'placeholder', port: 3000 };

    expect(
      createAgentBrowserIosDescriptor(target, 'placeholder-input').url
    ).toBe('http://localhost:3000/examples/placeholder?debug=1');
    expect(createAppiumAndroidDescriptor(target, 'placeholder-input').url).toBe(
      'http://10.0.2.2:3000/examples/placeholder?debug=1'
    );
    expect(
      createAppiumAndroidDescriptor(target, 'placeholder-input').hostReadyUrl
    ).toBe('http://localhost:3000/examples/placeholder?debug=1');
    expect(createAppiumIosDescriptor(target, 'placeholder-input').url).toBe(
      'http://localhost:3000/examples/placeholder?debug=1'
    );
  });

  it('honors an explicit empty debug query', () => {
    const target = { debugQuery: '', example: 'placeholder', port: 3000 };

    expect(
      createAgentBrowserIosDescriptor(target, 'placeholder-input').url
    ).toBe('http://localhost:3000/examples/placeholder');
    expect(createAppiumAndroidDescriptor(target, 'placeholder-input').url).toBe(
      'http://10.0.2.2:3000/examples/placeholder'
    );
    expect(createAppiumIosDescriptor(target, 'placeholder-input').url).toBe(
      'http://localhost:3000/examples/placeholder'
    );
  });
});
