import {
  type Browser,
  chromium,
  type Locator,
  type Page,
} from '@playwright/test';

import { recordBrowserRuntimeErrors } from '../playwright/runtime-errors';
import {
  calibratedLanguages,
  chromeContentBounds,
  createDeviceTouch,
  currentKeyMap,
  type DeviceKeyMap,
  type DeviceLanguage,
  type DevicePanel,
  keyboardIdentity,
  keyboardShown,
  pressBack,
  readKeyboard,
  switchKeyboardLanguage,
} from './android';
import {
  type AndroidRunState,
  type DeviceDriver,
  type DeviceKeyboard,
  type DeviceQuery,
  TOOLBAR_SELECTORS,
} from './lane';
import type { DeviceWitnessKey } from './witness';

export type AndroidConnection = {
  browser: Browser;
  close: () => Promise<void>;
  page: Page;
  platform: 'android';
  state: AndroidRunState;
};

const KOREAN_KEYS: Record<string, string> = {
  ㄱ: '기역',
  ㄴ: '니은',
  ㄷ: '디귿',
  ㄹ: '리을',
  ㅁ: '미음',
  ㅂ: '비읍',
  ㅅ: '시옷',
  ㅇ: '이응',
  ㅈ: '지읒',
  ㅊ: '치읓',
  ㅋ: '키읔',
  ㅌ: '티읕',
  ㅍ: '피읖',
  ㅎ: '히읗',
  ㅏ: '아',
  ㅐ: '애',
  ㅑ: '야',
  ㅓ: '어',
  ㅔ: '에',
  ㅕ: '여',
  ㅗ: '오',
  ㅛ: '요',
  ㅜ: '우',
  ㅠ: '유',
  ㅡ: '으',
  ㅣ: '이',
};

const keyProduced = (
  controls: DeviceKeyMap['controls'],
  label: string
): DeviceWitnessKey => {
  if (label === controls.backspace) return 'Backspace';
  return label === controls.enter ? 'Enter' : 'Unidentified';
};

const SYMBOL_KEYS: Record<string, string> = {
  '!': 'Exclamation',
  '#': 'Number sign',
  '&': '&amp;',
  "'": 'Apostrophe',
  '(': 'Left parenthesis',
  ')': 'Right parenthesis',
  '+': 'Plus',
  '-': 'Dash',
  '/': 'slash',
  ':': 'Colon',
  ';': 'Semicolon',
  '?': 'Question mark',
  _: 'underline',
};

const STRIP_CHROME =
  /^(Open features menu|Use voice typing|Settings|Clipboard|Theme settings)$|emoji$/;

const sleep = (ms: number) =>
  new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });

/** Find the page for an owned DevTools target, waiting up to `attempts` polls. */
export const findOwnedPage = async (
  browser: Browser,
  targetId: string,
  attempts = 1
) => {
  for (let attempt = 0; attempt < attempts; attempt++) {
    for (const page of browser
      .contexts()
      .flatMap((context) => context.pages())) {
      const session = await page.context().newCDPSession(page);
      const { targetInfo } = (await session.send('Target.getTargetInfo')) as {
        targetInfo: { targetId: string };
      };

      await session.detach();
      if (targetInfo.targetId === targetId) return page;
    }
    await sleep(200);
  }

  throw new Error(`The owned DevTools target ${targetId} is gone.`);
};

export const connectAndroid = async (
  state: AndroidRunState
): Promise<AndroidConnection> => {
  const browser = await chromium.connectOverCDP(state.endpoint, {
    noDefaults: true,
  });
  const page = await findOwnedPage(browser, state.targetId);

  return {
    browser,
    close: () => browser.close(),
    page,
    platform: 'android',
    state,
  };
};

declare global {
  interface Window {
    __deviceCalibration?: {
      dpr: number;
      offsetLeft: number;
      offsetTop: number;
      scale: number;
      x: number;
      y: number;
    } | null;
  }
}

const OPEN_MENU =
  '[role="menu"]:not([hidden]):not([data-state="closed"]):not([data-closed]):visible';

const locate = (page: Page, query: DeviceQuery): Locator => {
  const scope = (within?: DeviceQuery): Locator | Page =>
    within ? locate(page, within) : page;

  if ('toolbar' in query) {
    return page.locator(TOOLBAR_SELECTORS[query.toolbar]).first();
  }
  if ('css' in query) {
    return scope(query.within).locator(query.css).first();
  }
  if ('testId' in query) return page.getByTestId(query.testId);
  if ('button' in query) {
    return scope(query.within)
      .getByRole('button', { name: query.button })
      .first();
  }
  if ('menuItem' in query) {
    const menu = page.locator(OPEN_MENU);

    return menu
      .getByRole('menuitem', { name: query.menuItem })
      .or(menu.getByRole('menuitemradio', { name: query.menuItem }))
      .or(menu.getByRole('menuitemcheckbox', { name: query.menuItem }))
      .or(menu.getByRole('button', { name: query.menuItem }))
      .first();
  }
  return page.getByText(query.text, { exact: true }).first();
};

export const createAndroidDriver = ({
  page,
  state,
}: {
  page: Page;
  state: AndroidRunState;
}): DeviceDriver => {
  const touch = createDeviceTouch(state.serial);
  let offset: { x: number; y: number } | null = null;

  const toScreen = async (css: { x: number; y: number }) => {
    if (!offset) throw new Error('Open a page before touching its content.');

    const view = await page.evaluate(() => ({
      dpr: devicePixelRatio,
      offsetLeft: visualViewport?.offsetLeft ?? 0,
      offsetTop: visualViewport?.offsetTop ?? 0,
      scale: visualViewport?.scale ?? 1,
    }));

    return {
      x: offset.x + (css.x - view.offsetLeft) * view.dpr * view.scale,
      y: offset.y + (css.y - view.offsetTop) * view.dpr * view.scale,
    };
  };

  // A noninteractive point avoids activating page controls while the native
  // pointerdown measures the screen offset with the current browser toolbar.
  const calibrateContent = async () => {
    offset = null;

    const content = chromeContentBounds(state.serial);
    const calibration = await page.evaluate(async (bounds) => {
      const readViewport = () => ({
        dpr: devicePixelRatio,
        height: visualViewport?.height ?? innerHeight,
        offsetLeft: visualViewport?.offsetLeft ?? 0,
        offsetTop: visualViewport?.offsetTop ?? 0,
        scale: visualViewport?.scale ?? 1,
        width: visualViewport?.width ?? innerWidth,
      });
      let view = readViewport();
      let stableFrames = 0;
      let frame = 0;
      let timer = 0;

      try {
        await new Promise<void>((resolveReady, rejectReady) => {
          timer = window.setTimeout(() => {
            rejectReady(new Error('The calibration viewport did not settle.'));
          }, 2000);

          const sample = () => {
            const next = readViewport();

            stableFrames =
              document.visibilityState === 'visible' &&
              Object.values(next).every(Number.isFinite) &&
              next.dpr > 0 &&
              next.height > 0 &&
              next.scale > 0 &&
              next.width > 0 &&
              next.dpr === view.dpr &&
              next.height === view.height &&
              next.offsetLeft === view.offsetLeft &&
              next.offsetTop === view.offsetTop &&
              next.scale === view.scale &&
              next.width === view.width
                ? stableFrames + 1
                : 0;
            view = next;
            if (stableFrames === 3) {
              resolveReady();
              return;
            }
            frame = requestAnimationFrame(sample);
          };

          frame = requestAnimationFrame(sample);
        });
      } finally {
        window.clearTimeout(timer);
        cancelAnimationFrame(frame);
      }

      const { offsetLeft: left, offsetTop: top } = view;
      const nativeScale = view.dpr * view.scale;
      const height = Math.min(
        view.height,
        (bounds.bottom - bounds.top) / nativeScale
      );
      const width = Math.min(
        view.width,
        (bounds.right - bounds.left) / nativeScale
      );
      const interactive =
        'a,button,input,select,textarea,label,summary,iframe,[role="button"],[role="menuitem"],[tabindex],[contenteditable="true"]';
      const controls = Array.from(document.querySelectorAll(interactive))
        .flatMap((element) => Array.from(element.getClientRects()))
        .filter((rect) => rect.width > 0 && rect.height > 0);
      const controlMargin = 24;
      const quiet = ({ x, y }: { x: number; y: number }) => {
        const target = document.elementFromPoint(x, y);

        return (
          !!target &&
          !target.closest(interactive) &&
          !controls.some(
            (rect) =>
              x >= rect.left - controlMargin &&
              x <= rect.right + controlMargin &&
              y >= rect.top - controlMargin &&
              y <= rect.bottom + controlMargin
          )
        );
      };
      const gridLines = (size: number) =>
        Array.from(
          { length: Math.floor(size / controlMargin) },
          (_, index) => (index + 0.5) * controlMargin
        );
      const preferredPoints = [height / 2, 6, height - 6].flatMap((y) =>
        [6, width / 2, width - 6].map((x) => ({ x, y }))
      );
      const gridPoints = gridLines(height).flatMap((y) =>
        gridLines(width).map((x) => ({ x, y }))
      );
      const point = [...preferredPoints, ...gridPoints]
        .map(({ x, y }) => ({ x: left + x, y: top + y }))
        .find(quiet);

      if (!point) return null;
      window.__deviceCalibration = null;
      window.addEventListener(
        'pointerdown',
        (event) => {
          const currentViewport = window.visualViewport;

          window.__deviceCalibration = {
            dpr: devicePixelRatio,
            offsetLeft: currentViewport?.offsetLeft ?? 0,
            offsetTop: currentViewport?.offsetTop ?? 0,
            scale: currentViewport?.scale ?? 1,
            x: event.clientX,
            y: event.clientY,
          };
        },
        { capture: true, once: true }
      );
      return { point, view };
    }, content);

    if (!calibration) {
      throw new Error('No noninteractive calibration point is visible.');
    }

    const { point, view } = calibration;
    const guess = {
      x: content.left + (point.x - view.offsetLeft) * view.dpr * view.scale,
      y: content.top + (point.y - view.offsetTop) * view.dpr * view.scale,
    };

    touch.tap(guess.x, guess.y);

    const receipt = await page.waitForFunction(
      () => window.__deviceCalibration,
      undefined,
      { timeout: 2000 }
    );
    const seen = await receipt.jsonValue();

    await receipt.dispose();

    if (!seen) throw new Error('The calibration touch never reached the page.');
    offset = {
      x: guess.x - (seen.x - seen.offsetLeft) * seen.dpr * seen.scale,
      y: guess.y - (seen.y - seen.offsetTop) * seen.dpr * seen.scale,
    };
  };

  const keyboard: DeviceDriver['keyboard'] = ({ gesture, steps, trace }) => {
    let language: DeviceLanguage = 'en';
    let pinyinCandidatePending = false;

    const externalPinyin = () => {
      const identity = keyboardIdentity(state.serial);

      return (
        identity.languageTag === 'zh-CN' &&
        identity.variant === 'qwerty' &&
        identity.chineseInlineComposing === false
      );
    };

    const keyMap = (): DeviceKeyMap => currentKeyMap(state.serial, language);

    const confirmKeyboard = () => {
      if (!keyboardShown(state.serial)) {
        throw new Error(
          'The soft keyboard is not shown; touch the editor first.'
        );
      }

      const map = keyMap();

      const visible = readKeyboard(state.serial);

      if (!map.letterLabels.every((label) => visible[label])) {
        throw new Error(
          `Gboard does not show the ${language} letter panel; switch with device.keyboard.use('${language}').`
        );
      }

      return map;
    };

    const tapKey = async (
      map: DeviceKeyMap,
      label: string,
      produces: DeviceWitnessKey
    ) => {
      const key = map.keys[label];

      if (!key) {
        throw new Error(`The ${language} key map has no "${label}" key.`);
      }

      const pinyin = language === 'zh' && externalPinyin();
      const silentLetter = pinyin && /^[a-z]$/.test(label);
      let dismissesPredictions = false;

      if (
        pinyin &&
        pinyinCandidatePending &&
        label === map.controls.backspace
      ) {
        const visible = readKeyboard(state.serial);
        const letterTop = Math.min(
          ...map.letterLabels.map((letter) => visible[letter]?.bounds[1] ?? 0)
        );

        dismissesPredictions =
          !visible['打开功能菜单'] &&
          Object.entries(visible).some(
            ([candidate, bounds]) =>
              /^\p{Script=Han}+$/u.test(candidate) &&
              bounds.bounds[3] <= letterTop
          );
      }
      pinyinCandidatePending = false;

      await gesture(
        {
          key: silentLetter || dismissesPredictions ? null : produces,
          kind: 'key',
          label,
        },
        () => touch.tap(key.x, key.y)
      );
      if (dismissesPredictions && !readKeyboard(state.serial)['打开功能菜单']) {
        throw new Error(
          'Gboard Pinyin did not dismiss its prediction strip after Backspace.'
        );
      }
    };

    const switchPanel = async (target: DevicePanel) => {
      const from = currentKeyMap(
        state.serial,
        language,
        target === 'symbols' ? 'letters' : 'symbols'
      );

      await tapKey(
        from,
        target === 'symbols' ? 'Symbol keyboard' : 'Letter keyboard',
        null
      );

      const visible = readKeyboard(state.serial);
      const shown =
        target === 'symbols'
          ? Boolean(visible['@'])
          : keyMap().letterLabels.every((label) => visible[label]);

      if (!shown) {
        throw new Error(`Gboard did not show its ${target} panel.`);
      }

      return target;
    };

    const strip: DeviceKeyboard['strip'] = async (candidate) => {
      const nodes = readKeyboard(state.serial, { unclickable: true });
      const map = currentKeyMap(state.serial, language);
      const letterTops = map.letterLabels.map((label) => {
        const key = nodes[label];

        if (!key) {
          throw new Error(
            `Gboard ${language} is missing its calibrated "${label}" letter key.`
          );
        }
        return key.bounds[1];
      });

      if (letterTops.length === 0) {
        throw new Error('Strip taps need calibrated letter keys.');
      }

      const letterTop = Math.min(...letterTops);
      const shown = Object.entries(nodes).filter(
        ([label, key]) =>
          key.bounds[3] <= letterTop && !STRIP_CHROME.test(label)
      );
      const match = shown.find(([label]) =>
        typeof candidate === 'string'
          ? label === candidate
          : candidate.test(label)
      );

      if (!match) {
        throw new Error(
          `The suggestion strip shows ${shown.map(([label]) => label).join(', ') || 'nothing'}, not ${candidate}.`
        );
      }

      const [label, key] = match;

      await gesture({ kind: 'strip', label }, () => touch.tap(key.x, key.y));
      pinyinCandidatePending = false;
      if (language === 'zh' && externalPinyin()) {
        const step = steps().at(-1);
        const events = await trace();

        pinyinCandidatePending = events.some(
          (event) =>
            step &&
            event.seq >= step.seqStart &&
            event.seq < step.seqEnd &&
            event.isTrusted &&
            (event.type === 'beforeinput' || event.type === 'input') &&
            event.inputType === 'insertText' &&
            Boolean(event.data)
        );
      }
      return label;
    };

    return {
      languages: calibratedLanguages(state.serial),
      forgetPage: () => {
        pinyinCandidatePending = false;
      },
      shown: async () => keyboardShown(state.serial),
      strip,
      tap: async (label) => {
        const map = confirmKeyboard();

        await tapKey(map, label, keyProduced(map.controls, label));
      },
      type: async (text) => {
        const letters = confirmKeyboard();
        const named: Record<string, string> = {
          ...(language === 'ko' ? KOREAN_KEYS : {}),
          ' ': letters.controls.space,
          '\b': letters.controls.backspace,
          '\n': letters.controls.enter,
        };
        let panel: DevicePanel = 'letters';

        for (const character of text) {
          const label = named[character] ?? character;

          if (letters.keys[label]) {
            if (panel === 'symbols') panel = await switchPanel('letters');
            await tapKey(letters, label, keyProduced(letters.controls, label));
            continue;
          }

          const symbols = currentKeyMap(state.serial, language, 'symbols');
          const symbol = [SYMBOL_KEYS[character], character].find(
            (name) => name && symbols.keys[name]
          );

          if (!symbol) {
            throw new Error(
              `Gboard ${language} has no key for "${character}".`
            );
          }
          if (panel === 'letters') panel = await switchPanel('symbols');
          await tapKey(symbols, symbol, 'Unidentified');
          panel = readKeyboard(state.serial)['@'] ? 'symbols' : 'letters';
        }

        if (panel === 'symbols') await switchPanel('letters');
      },
      use: async (next) => {
        if (!keyboardShown(state.serial)) {
          throw new Error('Show the keyboard before switching its language.');
        }

        const identity = await switchKeyboardLanguage(state.serial, next);

        language = next;
        pinyinCandidatePending = false;
        if (keyMap().subtype !== identity.subtypeHashCode) {
          throw new Error(
            `Gboard selected subtype ${identity.subtypeHashCode} for ${next}.`
          );
        }
      },
    };
  };

  return {
    failureAttachments: () => ({}),
    errors: () => recordBrowserRuntimeErrors(page),
    keyboard,
    page: {
      find: (query) => locate(page, query),
      open: async (url) => {
        // Touches land on whichever tab Chrome shows, and foregrounding first
        // keeps Chrome from throttling the owned tab during a dev-server load.
        await page.bringToFront();
        await page.goto(url, { timeout: 60_000, waitUntil: 'load' });
      },
    },
    screen: {
      doubleTap: async (css) => {
        const point = await toScreen(css);

        touch.doubleTap(point.x, point.y);
      },
      press: async (css, ms) => {
        const point = await toScreen(css);

        touch.press(point.x, point.y, ms);
      },
      afterLoad: calibrateContent,
      tap: async (css) => {
        const point = await toScreen(css);

        touch.tap(point.x, point.y);
      },
    },
    system: {
      back: async () => {
        pressBack(state.serial);
      },
    },
  };
};
