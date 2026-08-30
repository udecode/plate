import { Hotkeys } from './hotkeys';

const runRealmHotkey = ({
  ctrlKey = false,
  metaKey = false,
  platform,
  userAgent,
}: {
  ctrlKey?: boolean;
  metaKey?: boolean;
  platform: string;
  userAgent: string;
}) => {
  const currentTarget = {
    defaultView: {
      InputEvent: class InputEvent {},
      navigator: { language: 'en-US', platform, userAgent },
    },
    nodeType: 9,
  } as unknown as Document;

  return Hotkeys.isUndo({
    altKey: false,
    ctrlKey,
    currentTarget,
    key: 'z',
    metaKey,
    shiftKey: false,
  } as Parameters<typeof Hotkeys.isUndo>[0] & {
    currentTarget: Document;
  });
};

describe('Plate hotkeys', () => {
  it('resolves mod semantics from each event root', () => {
    expect(
      runRealmHotkey({
        metaKey: true,
        platform: 'MacIntel',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15',
      })
    ).toBe(true);
    expect(
      runRealmHotkey({
        ctrlKey: true,
        platform: 'Win32',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
      })
    ).toBe(true);
    expect(
      runRealmHotkey({
        ctrlKey: true,
        platform: 'MacIntel',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15',
      })
    ).toBe(false);
  });
});
