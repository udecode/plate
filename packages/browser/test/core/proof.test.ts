import {
  evaluatePlaceholderInput,
  extractAgentBrowserDebugSnapshot,
  extractAppiumDebugSnapshot,
  parseDebugSnapshot,
} from '../../src/core/proof';
import {
  classifyBrowserMobileTransportProof,
  getBrowserMobileTransportProofMatrix,
} from '../../src/transports/contracts';

describe('proof helpers', () => {
  it('extracts debug snapshot from an agent-browser batch result', () => {
    const snapshot = extractAgentBrowserDebugSnapshot(
      JSON.stringify([
        {
          command: [
            'open',
            'http://localhost:3100/examples/placeholder?debug=1',
          ],
          error: null,
          result: {
            title: '',
            url: 'http://localhost:3100/examples/placeholder?debug=1',
          },
          success: true,
        },
        {
          command: [
            'eval',
            'document.querySelector("#placeholder-ime-debug-json")?.textContent',
          ],
          error: null,
          result: {
            origin: 'http://localhost:3100/examples/placeholder?debug=1',
            result: JSON.stringify({
              blockTexts: 'sushi',
              domSelection: 'sushi@5|sushi@5',
              events: ['beforeinput:insertText:s'],
              placeholderShape: null,
              pliteSelection: '0.0:5|0.0:5',
            }),
          },
          success: true,
        },
      ])
    );

    expect(snapshot).toEqual({
      blockTexts: 'sushi',
      domSelection: 'sushi@5|sushi@5',
      events: ['beforeinput:insertText:s'],
      placeholderShape: null,
      pliteSelection: '0.0:5|0.0:5',
    });
  });

  it('extracts debug snapshot from an appium execute payload', () => {
    const snapshot = extractAppiumDebugSnapshot(
      JSON.stringify({
        value: JSON.stringify({
          blockTexts: '',
          domSelection: 'none',
          events: [],
          placeholderShape: {
            hasBr: true,
            hasFEFF: true,
            kind: 'n',
            text: '\uFEFF',
          },
          pliteSelection: 'none',
        }),
      })
    );

    expect(snapshot).toEqual({
      blockTexts: '',
      domSelection: 'none',
      events: [],
      placeholderShape: {
        hasBr: true,
        hasFEFF: true,
        kind: 'n',
        text: '\uFEFF',
      },
      pliteSelection: 'none',
    });
  });

  it('rejects debug snapshots with non-string events', () => {
    expect(() =>
      parseDebugSnapshot(
        JSON.stringify({
          blockTexts: 'sushi',
          domSelection: 'sushi@5|sushi@5',
          events: [1],
          placeholderShape: null,
          pliteSelection: '0.0:5|0.0:5',
        })
      )
    ).toThrow('Debug snapshot payload is not a recognized snapshot shape');
  });

  it('passes a clean placeholder input snapshot', () => {
    const evaluation = evaluatePlaceholderInput({
      blockTexts: 'sushi',
      domSelection: 'sushi@5|sushi@5',
      events: ['beforeinput:insertText:s', 'mutation'],
      placeholderShape: null,
      pliteSelection: '0.0:5|0.0:5',
    });

    expect(evaluation.ok).toBe(true);
    expect(evaluation.issues).toEqual([]);
  });

  it('fails a polluted placeholder input snapshot', () => {
    const evaluation = evaluatePlaceholderInput({
      blockTexts: 'sushiType something',
      domSelection: 'sushiType something@5|sushiType something@5',
      events: ['beforeinput:insertText:s'],
      placeholderShape: null,
      pliteSelection: '0.0:5|0.0:5',
    });

    expect(evaluation.ok).toBe(false);
    expect(evaluation.issues[0]).toContain('Expected blockTexts');
  });

  it('fails when placeholder residue survives after input commit', () => {
    const evaluation = evaluatePlaceholderInput({
      blockTexts: 'sushi',
      domSelection: 'sushi@5|sushi@5',
      events: ['beforeinput:insertText:s'],
      placeholderShape: {
        hasBr: true,
        hasFEFF: false,
        kind: 'n',
        text: '',
      },
      pliteSelection: '0.0:5|0.0:5',
    });

    expect(evaluation.ok).toBe(false);
    expect(evaluation.issues).toContain(
      'Expected placeholderShape to be null after input commit'
    );
  });

  it('passes a clean ime snapshot for non-ASCII committed text', () => {
    const evaluation = evaluatePlaceholderInput(
      {
        blockTexts: 'すし',
        domSelection: 'すし@2|すし@2',
        events: ['beforeinput:insertCompositionText:す'],
        placeholderShape: null,
        pliteSelection: '0.0:2|0.0:2',
      },
      'すし'
    );

    expect(evaluation.ok).toBe(true);
    expect(evaluation.issues).toEqual([]);
  });

  it('classifies mobile transport proof scope without upgrading proxies to release proof', () => {
    expect(classifyBrowserMobileTransportProof('appium-android')).toEqual({
      evidenceClass: 'automated-direct',
      platform: 'android-chrome',
      releaseGateCapable: true,
      supportedClaims: [
        'device-browser-text-input',
        'device-browser-ime-commit',
        'debug-snapshot',
      ],
      transport: 'appium-android',
      unsupportedClaims: [
        'native-mobile-clipboard',
        'human-soft-keyboard',
        'glide-typing',
        'voice-input',
      ],
    });

    expect(classifyBrowserMobileTransportProof('appium-ios')).toEqual({
      evidenceClass: 'automated-direct',
      platform: 'ios-safari',
      releaseGateCapable: true,
      supportedClaims: [
        'device-browser-text-input',
        'device-browser-ime-commit',
        'debug-snapshot',
      ],
      transport: 'appium-ios',
      unsupportedClaims: [
        'native-mobile-clipboard',
        'human-soft-keyboard',
        'glide-typing',
        'voice-input',
      ],
    });

    expect(classifyBrowserMobileTransportProof('agent-browser-ios')).toEqual({
      evidenceClass: 'automated-proxy',
      platform: 'ios-safari',
      releaseGateCapable: false,
      supportedClaims: ['device-browser-text-input', 'debug-snapshot'],
      transport: 'agent-browser-ios',
      unsupportedClaims: [
        'native-mobile-clipboard',
        'device-browser-ime-commit',
        'human-soft-keyboard',
        'glide-typing',
        'voice-input',
      ],
    });

    expect(
      getBrowserMobileTransportProofMatrix().every((entry) =>
        entry.unsupportedClaims.includes('native-mobile-clipboard')
      )
    ).toBe(true);
  });

  it('does not reuse direct transport claim arrays across classifications', () => {
    const expectedSupportedClaims = [
      'device-browser-text-input',
      'device-browser-ime-commit',
      'debug-snapshot',
    ];
    const expectedUnsupportedClaims = [
      'native-mobile-clipboard',
      'human-soft-keyboard',
      'glide-typing',
      'voice-input',
    ];
    const appiumAndroid = classifyBrowserMobileTransportProof('appium-android');

    appiumAndroid.supportedClaims.length = 0;
    appiumAndroid.unsupportedClaims.length = 0;

    expect(
      classifyBrowserMobileTransportProof('appium-ios').supportedClaims
    ).toEqual(expectedSupportedClaims);
    expect(
      classifyBrowserMobileTransportProof('appium-ios').unsupportedClaims
    ).toEqual(expectedUnsupportedClaims);

    const directTransportProofs = getBrowserMobileTransportProofMatrix().filter(
      (proof) =>
        proof.transport === 'appium-android' || proof.transport === 'appium-ios'
    );

    expect(directTransportProofs).toHaveLength(2);
    for (const proof of directTransportProofs) {
      expect(proof.supportedClaims).toEqual(expectedSupportedClaims);
      expect(proof.unsupportedClaims).toEqual(expectedUnsupportedClaims);
    }
  });
});
