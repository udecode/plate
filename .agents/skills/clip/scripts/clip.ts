import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { chromium, type Browser, type BrowserContext, type CDPSession, type Locator, type Page } from 'playwright-core'

const ASSETS = `${import.meta.dir}/../assets`

/** The page size a clip films, in CSS pixels, and how many video pixels each one takes. */
export type View = { width: number; height: number; scale: number }
export type Modifier = 'Alt' | 'Control' | 'Meta' | 'Shift'
// CDP's Input.dispatchMouseEvent modifiers bit field.
const MODIFIER_BITS: Record<Modifier, number> = { Alt: 1, Control: 2, Meta: 4, Shift: 8 }
// What CDP's Input.dragIntercepted hands back and Input.dispatchDragEvent takes.
type DragData = { items: { mimeType: string; data: string }[]; dragOperationsMask: number }

const BAR_PX = 80
const FOOT_PX = 76
// X documents 16:9, 1:1, 4:5, 2:3 and 9:16 video. A clip with its bars is 2:3 (the owner, 2026-11-21).
const X_RATIO = { clip: 3 / 2 }
const x: View = { width: 540, height: 540 * X_RATIO.clip - BAR_PX - FOOT_PX, scale: 2 }
// X's phone feed shows a clip about 312 pt wide (an iPhone's 393 pt less the avatar column and margins, estimated, not measured).
const feedPt = 312
const titleMinPt = 14

/** A project's clip settings, read from its root. */
export const CLIP_CONFIG = '.agents/clip.json'

export const CLIP = {
  fps: 60,
  // A wide clip goes to a desktop chat, where 1× pixels look soft on a Retina screen.
  wide: { width: 1100, height: 720, scale: 2 } as View,
  x,
  // A before-and-after clip goes to a team chat, rarely to X, so its two takes play side by side from the first frame on a canvas that comes out 1920 by 1080 with its bars, each take filming half of it (the owner, 2026-11-25).
  // Each take films at 3× pixels and the canvas renders at 1.5×, so a copy can zoom to 2× to fill its half without stretching a pixel; at 1× a small page area sat in the middle of an empty frame (the owner, 2026-11-25).
  pair: { width: 612, height: 530, scale: 3 } as View,
  // The canvas is as tall as its cards, so no empty band sits above or below them, up to 16:9 with the head.
  pairCanvas: { width: 1280, scale: 1.5 },
  // A title bar on top and a caption footer at the bottom read as two places far apart, and a chat player's controls cover a video's bottom edge, so a pair clip's title and caption share one black head: the title small and gray, the step large and white under it (the owner, 2026-11-25). Sizes in CSS px.
  // A 26 px caption matched the pages' body text and competed with it (the owner, 2026-11-25), so the head's caption is 20 px.
  pairHead: { height: 66, stillHeight: 44, stillTitlePx: 16, padPx: 24, titleTop: 10, titlePx: 14, captionTop: 30, captionH: 28, captionPx: 20 },
  // A bug clip for an issue films the window the bug shows in, at 2× pixels, since a fixer watches it on a desktop (the owner, 2026-11-22).
  repro: { width: 760, height: 560, scale: 2 } as View,
  // A bug clip's page fits its cards, up to this bound in CSS px, because its copies stayed small in a page as large as the window with its band (the owner, 2026-11-26).
  // It is tall enough that two whole repro windows end stacked at about 0.9×, because side by side they shrank to 0.6× (the owner, 2026-11-26).
  reproStage: { width: 960, height: 1080, minWidth: 480 },
  feedPt,
  phoneTextPt: 9,
  // Chat bots read these into their media rules, so a change takes a bot restart.
  maxSeconds: 20,
  maxMB: 8,
  // A bug clip goes to a GitHub issue, which plays a video up to 100 MB, and runs as long as the bug takes. It ends holding the wrong state long enough to read.
  reproMaxSeconds: 60,
  reproMaxMB: 100,
  reproHoldS: 2,
  // Four beats took about 14 s in the debut, the pace the owner picked (2026-11-18).
  xSeconds: 16,
  firstBeatS: 0.8,
  beatMinS: 1.2,
  // A stretch where nothing moves gets cut down to these. "Pauses are a bit too long, humans should not lose attention" (the owner, 2026-11-19), and the pause after a result still dragged at 0.7 s and 1 s (the owner, 2026-11-20).
  stillMaxS: 0.4,
  endHoldS: 0.6,
  // Each take of a before-and-after clip keeps less stillness at its end, because the clip then holds both results together; a second of stillness after each result read as a stall (the owner, 2026-11-20).
  compareEndS: 0.4,
  // The cursor fades once the hand rests, the way Screen Studio hides it, so no scene moves it off the result and no cut makes it jump (the owner, 2026-11-20).
  cursorIdleS: 0.5,
  cursorFadeS: 0.15,
  // A before-and-after clip ends holding both results, so the reader compares them (the owner, 2026-11-20). Each take's own end hold counts toward it.
  compareHoldS: 1.2,
  comparePadPx: 16,
  stillLeadS: 0.2,
  caretPx: 50,
  stillLevel: 16,
  stillMinS: 0.3,
  resultLevel: 8,
  captionWords: 6,
  titleWords: 6,
  titlePx: { min: Math.floor((titleMinPt * x.width) / feedPt), max: 36 },
  heldGapMs: 25,
  heldLagPx: 0.5,
  pressJumpPx: 2,
  freeFlips: 3,
}

// How many frames a bug clip's after take takes to shrink into its copy.
// Each copy sits in a card under a full-width band in its side's color, with a border of that color, because a small tab over a gray outline was easy to miss (the owner, 2026-11-25). Sizes in CSS px.
const CARD = { marginPx: 16, gapPx: 16, bandPx: 28, borderPx: 2, radiusPx: 4, labelPx: 13 }

/** Each rule the checks below enforce, as the clips skill lists it. */
export const RULES: { rule: string; check: string }[] = [
  { rule: `Film and render at ${CLIP.fps} fps, and keep each filmed frame once and in order under the bars, captions and cards.`, check: 'reviewFile, renderClip' },
  { rule: `A clip runs at most ${CLIP.maxSeconds} s and ${CLIP.maxMB} MB. An X clip aims for ${CLIP.xSeconds} s or less.`, check: 'reviewTake, reviewFile' },
  { rule: `The first caption shows within ${CLIP.firstBeatS} s, so the clip opens on the action.`, check: 'reviewTake' },
  { rule: `Each caption stays up at least ${CLIP.beatMinS} s.`, check: 'reviewTake' },
  { rule: `Nothing on screen sits still for more than ${CLIP.stillMaxS} s, or ${CLIP.endHoldS} s at the end. Render cuts the extra still frames on its own, but never takes a caption under ${CLIP.beatMinS} s and never cuts a hold the scene marks with \`read(ms)\`.`, check: 'squeezePlan, renderTake' },
  { rule: 'A caption is white text on black, so it never reads as page text: in a footer under an X clip, and in the head above any other clip. Keys show as white keycaps in it.', check: 'captionHtml, renderClip' },
  { rule: `A caption is a short sentence of at most ${CLIP.captionWords} words with no closing period. It starts with a capital, unless it starts with a [Key]. It speaks to a viewer on a Mac in Chrome, in Mac keys, and names no platform or browser (the owner, 2026-11-23). Render fixes the capital and the period on its own.`, check: 'checkCaption, fixCaption' },
  { rule: 'A caption switches on as its action starts and off as the next one starts, with no fade.', check: 'captionOverlay' },
  { rule: `The drawn cursor shrinks toward its tip and fades out over ${CLIP.cursorFadeS} s once it has rested ${CLIP.cursorIdleS} s with no button down, and grows back as it moves, so a scene never moves it off the result. A cursor \`place\` parks stays hidden until it first moves.`, check: 'drawCursor, Clip' },
  { rule: `While a button is down, the drawn cursor stays within ${CLIP.heldLagPx} px of the pointer and never turns back on its own.`, check: 'checkTrail' },
  { rule: `The drawn cursor jumps at most ${CLIP.pressJumpPx} px at a press, and turns back at most ${CLIP.freeFlips} times on free moves.`, check: 'checkTrail' },
  { rule: `While a button is down, the pointer moves every frame, at most ${CLIP.heldGapMs} ms apart at the 90th percentile, so a stroke grows smoothly.`, check: 'checkTrail' },
  { rule: `A title bar holds a one-word lowercase tag and a lowercase title of at most ${CLIP.titleWords} words, on one line at ${CLIP.titlePx.max} px, shrunk as far as the line needs to fit. Under ${CLIP.titlePx.min} px, a phone shows it under ${titleMinPt} pt, so render suggests a shorter title.`, check: 'checkTitle, renderClip, renderTake' },
  { rule: 'A crop has even sides inside the viewport. Render rounds and clamps it on its own.', check: 'fitCrop' },
  {
    rule: `A clip films X's shape, a page ${CLIP.x.width} by ${CLIP.x.height} px at ${CLIP.x.scale}× pixels, so with its ${BAR_PX} px title bar and ${FOOT_PX} px caption footer the clip is 2:3, unless it opens with \`{ shape: 'wide' }\` or the nearest \`${CLIP_CONFIG}\` above the scene or the working folder names \`"shape": "wide"\`, which films ${CLIP.wide.width} by ${CLIP.wide.height} px at ${CLIP.wide.scale}× pixels for a desktop chat, under a pair clip's black head with no footer. An X clip's page text shows at ${CLIP.phoneTextPt} pt or more in a phone's feed, which shows a clip about ${CLIP.feedPt} pt wide.`,
    check: 'openClip, projectShape, reviewTake',
  },
  { rule: 'Render refuses an X-shape or a before-and-after clip without a title bar, so the clip a team chat gets is the one X can post and a before-and-after clip names what it shows.', check: 'checkBar' },
  {
    rule: `A change to how something a reader already saw behaves shows as one clip made from a take before the change and a take after it, which caption the same beats. Both film \`{ shape: 'pair' }\`, a page ${CLIP.pair.width} by ${CLIP.pair.height} px at ${CLIP.pair.scale}× pixels with no crop, and play side by side from the first frame, before left of after, both playing each step at the same moment, on a page ${CLIP.pairCanvas.width} px wide and as tall as the cards with ${CARD.marginPx} px around them, rendered at ${CLIP.pairCanvas.scale}×, so the clip is ${CLIP.pairCanvas.width * CLIP.pairCanvas.scale} px wide and at most 16:9, because such a clip goes to a team chat and rarely to X. It has no footer: one ${CLIP.pairHead.height} px black head on top holds the tag and title at ${CLIP.pairHead.titlePx} px in gray, and under them each step's caption in white at ${CLIP.pairHead.captionPx} px, both left-aligned. Each copy is a card under a ${CARD.bandPx} px band that names its side, red before and green after, with a ${CARD.borderPx} px border of the same color and ${CARD.radiusPx} px corners. A bug clip's two takes film the same repro window instead, and sit in two cards as large as ${CLIP.reproStage.width} by ${CLIP.reproStage.height} px allows, in columns or in rows, one above the other, whichever shows them larger, columns on a tie, on a page just large enough for the cards and at least ${CLIP.reproStage.minWidth} px wide. The reference take plays whole in its card while the beta card waits empty, then holds its last frame while the beta take plays whole in its own, and then both replay. The replay trims the page margin that both takes leave blank in every frame, keeps ${CLIP.comparePadPx} px of page around what is left, and zooms both copies as far as the page allows, never past their own pixels, so a pair copy zooms up to ${CLIP.pair.scale / CLIP.pairCanvas.scale}× and a bug clip's never past 1×, on the page's own color. Each take holds its result ${CLIP.compareEndS} s at most, unless the scene marks a longer \`read(ms)\`, and the replay ends holding both results for ${CLIP.compareHoldS} s. Render refuses two takes that end every step the same, and the whole clip keeps the length and size limits.`,
    check: 'checkPair, renderCompare, alignBeats, pageColor, contentBox, cardLayout, pairLayout, reproLayout, renderReplay, squeezePlan',
  },
  {
    rule: `A bug clip for an issue films with \`{ shape: 'repro' }\`, a ${CLIP.repro.width} by ${CLIP.repro.height} px window at ${CLIP.repro.scale}× pixels unless \`size\` names the window the bug needs. Render keeps its real time and cuts nothing, because a pause can be the bug. It has a pair clip's black head and no footer, and the head's first line names the browser, the route and the build instead of a title. It ends holding the wrong state at least ${CLIP.reproHoldS} s, and runs at most ${CLIP.reproMaxSeconds} s and ${CLIP.reproMaxMB} MB. A bug with a reference page shows as the before-and-after clip of a take on the reference page and a take on beta, each band naming its site, the reference gray and beta red.`,
    check: 'openClip, reviewTake, pageClip, renderClip, renderCompare',
  },
  {
    rule: `A change to how something looks at rest, such as copy or a style, shows as one image, the still before the change beside the still after it when both fit the page's width or each is taller than wide, and above it otherwise, both cropped to the area where they differ, each in a clip's card, under a ${CLIP.pairHead.stillHeight} px black head whose title is white at ${CLIP.pairHead.stillTitlePx} px. It refuses two stills of different sizes or two that show the same thing.`,
    check: 'renderPair, changedBox',
  },
]

/** One caption, from the second it starts: a short sentence, keys in brackets, or both, such as `Draw a note` or `[N] [Enter]`. */
export type Beat = { t: number; text: string }
export type Crop = { x: number; y: number; w: number; h: number }
/** One recording: the raw video, where the clip starts and ends in it, the page clock its trail starts at, the crop and the captions, the page size it filmed, and the page's usual text size in the crop. */
export type Take = {
  video: string
  startMs: number
  endMs: number
  trailFrom: number
  crop?: Crop
  captions: Beat[]
  holds?: [number, number][]
  view?: View
  textPx?: number
  /** A bug clip for an issue: render keeps its real time and names its route instead of a title. */
  repro?: boolean
}
/** One page frame: the page clock in ms, 1 while a button is down, the drawn cursor's x and y, then the real pointer's. */
export type TrailRow = [number, number, number, number, number, number]
export type Review = { fails: string[]; fixes: string[]; suggests: string[] }

// Headless recordings draw no pointer, so shapes would appear on their own.
function drawCursor({ idleS, fadeS }: { idleS: number; fadeS: number }) {
  const draw = () => {
    const c = document.createElement('div')
    c.innerHTML =
      '<svg width="22" height="26" viewBox="0 0 22 26"><path d="M2 1.5v19l4.6-4.3 3.1 7 3-1.3-3-6.9 6.5-.4z" fill="#0a0a0a" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>'
    Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: '2147483647', pointerEvents: 'none', transformOrigin: '2px 1.5px' })
    document.documentElement.appendChild(c)
    const target = { x: -100, y: -100 }
    const p = { x: -100, y: -100 }
    const v = { x: 0, y: 0 }
    let down = false
    let press = 1
    let last = performance.now()
    let active = last
    let shown = 0
    const follow = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      active = performance.now()
    }
    addEventListener('pointermove', follow, true)
    // A parked cursor stays hidden until its first move, so a take never opens on a cursor sitting idle.
    ;(window as any).__parkCursor = () => {
      p.x = target.x
      p.y = target.y
      v.x = v.y = 0
      active = -Infinity
      shown = 0
    }
    addEventListener('pointerdown', e => ((down = true), follow(e)), true)
    addEventListener('pointerup', e => ((down = false), follow(e)), true)
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (down) {
        // A spring chasing a dragged pointer lagged off what it dragged (2026-11-18), so a held button glues the cursor to the pointer.
        p.x = target.x
        p.y = target.y
        v.x = v.y = 0
      } else {
        const k = 800
        const damp = 2 * 0.72 * Math.sqrt(k)
        const substepS = 0.004
        const n = Math.ceil(dt / substepS)
        for (let i = 0; i < n; i++) {
          for (const a of ['x', 'y'] as const) {
            v[a] += (-k * (p[a] - target[a]) - damp * v[a]) * (dt / n)
            p[a] += v[a] * (dt / n)
          }
        }
      }
      press += ((down ? 0.86 : 1) - press) * Math.min(1, dt * 30)
      if (down || Math.hypot(v.x, v.y) > 5) active = now
      // It comes back faster than it goes, so a move never starts unseen.
      shown = now - active < idleS * 1000 ? Math.min(1, shown + dt / (fadeS / 1.5)) : Math.max(0, shown - dt / fadeS)
      const eased = shown * shown * (3 - 2 * shown)
      c.style.opacity = String(eased)
      ;((window as any).__trail ??= []).push([now, down ? 1 : 0, p.x, p.y, target.x, target.y])
      c.style.transform = `translate(${p.x - 2}px,${p.y - 1.5}px) scale(${press * (0.5 + 0.5 * eased)})`
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', draw)
  else draw()
}

export const minimumJerk = (p: number) => p * p * p * (10 + p * (-15 + 6 * p))
/** A pen stroke starts already moving at half its mean speed, because a minimum-jerk start dwells long enough to pool ink in a blob. */
export const stroke = (p: number) => (0.4 * p + (0.6 * (1 - Math.cos(Math.PI * p))) / Math.PI) / (0.4 + 1.2 / Math.PI)
const fitts = (d: number) => 180 + 110 * Math.log2(d / 30 + 1)

export class Clip {
  pos = { x: 0, y: 0 }
  readonly captions: Beat[] = []
  readonly holds: [number, number][] = []
  private held = false
  private mods = 0
  private out = ''
  private video = ''
  private t0 = 0
  private startMs = 0
  private trailFrom = 0
  repro = false

  constructor(
    readonly browser: Browser,
    readonly ctx: BrowserContext,
    readonly page: Page,
    private readonly cdp: CDPSession,
    readonly view: View = CLIP.wide,
  ) {}

  // Playwright's page.mouse waits until each move is handled, and that wait swings from 17 to 50 ms, so a drawn line grew in uneven jumps.
  private mouse(type: 'mouseMoved' | 'mousePressed' | 'mouseReleased', clickCount = 0) {
    return this.cdp.send('Input.dispatchMouseEvent', {
      type,
      x: this.pos.x,
      y: this.pos.y,
      button: type === 'mouseMoved' && !this.held ? 'none' : 'left',
      buttons: this.held ? 1 : 0,
      clickCount,
      modifiers: this.mods,
    })
  }

  // A CDP mouse event carries no keyboard state, so a Shift held with page.keyboard.down never reached a drag's pointer events.
  /** Holds a modifier key, such as Shift for a circle, so each mouse event carries it until `keyUp`. */
  async keyDown(key: Modifier) {
    await this.page.keyboard.down(key)
    this.mods |= MODIFIER_BITS[key]
  }

  async keyUp(key: Modifier) {
    this.mods &= ~MODIFIER_BITS[key]
    await this.page.keyboard.up(key)
  }

  wait(ms: number) {
    return this.page.waitForTimeout(ms)
  }

  /** Holds still while a viewer reads something that just appeared, such as a toast; render never cuts this hold. */
  async read(ms: number) {
    const from = (Date.now() - this.t0 - this.startMs) / 1000
    await this.wait(ms)
    this.holds.push([from, from + ms / 1000])
  }

  async down(clickCount = 1) {
    this.held = true
    await this.mouse('mousePressed', clickCount)
  }

  async up(clickCount = 1) {
    this.held = false
    await this.mouse('mouseReleased', clickCount)
  }

  /** Moves along `at(p)` as p goes from 0 to 1 over `ms` of wall clock, however long Chrome takes to handle each move. `send` delivers each move, a mouse move unless the caller says otherwise. */
  async over(ms: number, at: (p: number) => readonly [number, number], send = () => this.mouse('mouseMoved')) {
    const began = performance.now()
    const sent: Promise<unknown>[] = []
    for (let k = 1; ; k++) {
      const p = Math.min(1, (performance.now() - began) / ms)
      const [x, y] = at(p)
      this.pos = { x, y }
      sent.push(send())
      if (p >= 1) break
      await Bun.sleep(Math.max(0, began + k * (1000 / CLIP.fps) - performance.now()))
    }
    await Promise.all(sent)
  }

  /** A hand's move to (x, y), in Fitts' law time on a minimum-jerk curve that bows a little. The cursor's spring adds the landing. */
  async glide(x: number, y: number, { ms, bow = true, send }: { ms?: number; bow?: boolean; send?: () => Promise<unknown> } = {}) {
    const from = { ...this.pos }
    const d = Math.hypot(x - from.x, y - from.y)
    const arc = bow ? Math.min(24, d * 0.06) : 0
    const [nx, ny] = [-(y - from.y) / (d || 1), (x - from.x) / (d || 1)]
    await this.over(ms ?? fitts(d), p => {
      const t = minimumJerk(p)
      const off = Math.sin(Math.PI * p) * arc
      return [from.x + (x - from.x) * t + nx * off, from.y + (y - from.y) * t + ny * off]
    }, send)
  }

  /** Puts the pointer at (x, y) at once, before filming. */
  async place(x: number, y: number) {
    this.pos = { x, y }
    await this.mouse('mouseMoved')
    await this.wait(300)
    await this.page.evaluate(() => (window as any).__parkCursor?.())
  }

  /** A click where the pointer is, after the short rest a hand takes on its target. */
  async press() {
    await this.wait(140)
    await this.down()
    await this.wait(70)
    await this.up()
  }

  async dblclick() {
    await this.down(1)
    await this.up(1)
    await this.wait(60)
    await this.down(2)
    await this.up(2)
  }

  /** Glides to the middle of a control and clicks it. */
  async click(target: Locator) {
    const box = await target.boundingBox()
    if (!box) throw new Error(`${target} is not on the page`)
    await this.glide(box.x + box.width / 2, box.y + box.height / 2)
    await this.press()
  }

  async drag(from: readonly [number, number], to: readonly [number, number], ms = 480) {
    await this.glide(...from)
    await this.wait(140)
    await this.down()
    await this.glide(...to, { ms, bow: false })
    await this.wait(80)
    await this.up()
  }

  /**
   * Drags what sits at `from`, such as a text selection or a draggable element, and drops it at `to` through Chrome's own HTML5 drag and drop.
   * Throws when nothing at `from` starts a drag, because a faked drag would film what a user cannot do.
   */
  async dragDrop(from: readonly [number, number], to: readonly [number, number], ms = 600) {
    await this.glide(...from)
    await this.wait(140)
    let data: DragData | undefined
    const caught = (e: { data: DragData }) => (data = e.data)
    this.cdp.on('Input.dragIntercepted', caught)
    await this.cdp.send('Input.setInterceptDrags', { enabled: true })
    // Once a drag starts Chrome sends no pointer events, so the drawn cursor follows ones sent to the window, which no page listener below it hears.
    const cursor = (type: 'pointermove' | 'pointerup') =>
      this.cdp.send('Runtime.evaluate', { expression: `dispatchEvent(new PointerEvent('${type}', { clientX: ${this.pos.x}, clientY: ${this.pos.y}, pointerType: 'mouse' }))` })
    const drag = (type: 'dragEnter' | 'dragOver' | 'drop') => this.cdp.send('Input.dispatchDragEvent', { type, x: this.pos.x, y: this.pos.y, data: data!, modifiers: this.mods })
    let entered = false
    try {
      await this.down()
      // Chrome on a Mac starts no text drag until the button has been down 0.15 s, and a move before then extends the selection instead.
      await this.wait(200)
      await this.glide(...to, { ms, bow: false, send: () => {
        if (!data) return this.mouse('mouseMoved')
        const type = entered ? 'dragOver' : 'dragEnter'
        entered = true
        return Promise.all([drag(type), cursor('pointermove')])
      } })
      if (!data) throw new Error(`nothing at (${from.join(', ')}) started a drag; press on a text selection or a draggable element`)
      if (!entered) await drag('dragEnter')
      await drag('drop')
      await this.wait(80)
    } finally {
      await this.up()
      if (data) await cursor('pointerup')
      this.cdp.off('Input.dragIntercepted', caught)
      await this.cdp.send('Input.setInterceptDrags', { enabled: false })
    }
  }

  /** Types at a hand's pace, 25 to 70 ms a key and a little longer after a space. */
  async write(text: string) {
    for (const ch of text) {
      await this.page.keyboard.type(ch)
      await this.wait(25 + Math.random() * 45 + (ch === ' ' ? 25 : 0))
    }
  }

  /** Starts filming into `out`. Everything before this is setup the clip leaves out. */
  async film(out: string) {
    mkdirSync(out, { recursive: true })
    this.out = out
    this.video = resolve(out, 'clip.webm')
    const { width, height, scale } = this.view
    await this.page.screencast.start({ path: this.video, size: { width: width * scale, height: height * scale }, fps: CLIP.fps })
    this.t0 = Date.now()
    this.trailFrom = await this.page.evaluate(() => performance.now())
    await this.wait(200)
    this.startMs = Date.now() - this.t0
  }

  /** Starts a caption now, as its action starts. */
  beat(text: string) {
    this.captions.push({ t: (Date.now() - this.t0 - this.startMs) / 1000, text })
  }

  still(name: string) {
    return this.page.screenshot({ path: join(this.out, `${name}.png`) })
  }

  /** Stops filming, closes the browser, and writes trail.json and take.json beside the video. */
  async finish(crop?: Crop): Promise<Take> {
    const endMs = Date.now() - this.t0
    const trail = await this.page.evaluate(() => (window as any).__trail ?? [])
    await Bun.write(join(this.out, 'trail.json'), JSON.stringify(trail))
    const fitted = crop && fitCrop(crop, this.view)
    const textPx = await this.page.evaluate(medianTextPx, fitted ?? { x: 0, y: 0, w: this.view.width, h: this.view.height })
    await this.page.screencast.stop()
    await this.browser.close()
    const take: Take = {
      video: this.video,
      startMs: this.startMs,
      endMs,
      trailFrom: this.trailFrom,
      crop: fitted,
      captions: this.captions,
      holds: this.holds,
      view: this.view,
      textPx,
      repro: this.repro || undefined,
    }
    await Bun.write(join(this.out, 'take.json'), JSON.stringify(take, null, 2))
    return take
  }
}

function medianTextPx(crop: Crop): number {
  const sizes: number[] = []
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const text = n.textContent?.trim() ?? ''
    const el = n.parentElement
    if (!text || !el?.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue
    range.selectNodeContents(n)
    const r = range.getBoundingClientRect()
    if (!r.width || r.right < crop.x || r.left > crop.x + crop.w || r.bottom < crop.y || r.top > crop.y + crop.h) continue
    const px = parseFloat(getComputedStyle(el).fontSize)
    for (let i = 0; i < text.length; i++) sizes.push(px)
  }
  sizes.sort((a, b) => a - b)
  return sizes[Math.floor(sizes.length / 2)] ?? 0
}

/**
 * The shape a project films its clips in: the `shape` of the nearest `.agents/clip.json` above any of `from`, or X's.
 * One demo serves the team chat and X, so X's shape is the default (owner, 2026-11-20). A project whose clips never
 * go to X, such as Ellie, films its demos wide instead (owner, 2026-11-24: "improve it so it supports a config per project... so ellie is always desktop").
 */
export function projectShape(from: string[]): 'wide' | 'x' {
  for (const start of from) {
    for (let dir = resolve(start); ; dir = dirname(dir)) {
      const file = join(dir, CLIP_CONFIG)
      if (existsSync(file)) {
        const shape = (JSON.parse(readFileSync(file, 'utf8')) as { shape?: unknown }).shape ?? 'x'
        if (shape !== 'wide' && shape !== 'x') throw new Error(`${file} names shape ${JSON.stringify(shape)}; use "wide" or "x"`)
        return shape
      }
      if (dirname(dir) === dir) break
    }
  }
  return 'x'
}

export async function openClip(
  url: string,
  {
    cursor = true,
    colorScheme = 'light',
    // The scene's own folder decides first, because a scene lives with the work it films.
    shape = projectShape([dirname(Bun.main), process.cwd()]),
    size,
    storageState,
  }: { cursor?: boolean; colorScheme?: 'light' | 'dark'; shape?: 'wide' | 'x' | 'pair' | 'repro'; size?: { width: number; height: number }; storageState?: string } = {},
) {
  // A bug clip may film the narrow or tall window its bug needs.
  const view = shape === 'repro' && size ? { ...CLIP.repro, ...size } : CLIP[shape]
  // With only the context's deviceScaleFactor, Chrome screencast an X page at 540 px into a 1080 px frame.
  const browser = await chromium.launch({ args: [`--force-device-scale-factor=${view.scale}`] })
  const ctx = await browser.newContext({ colorScheme, viewport: { width: view.width, height: view.height }, deviceScaleFactor: view.scale, storageState })
  if (cursor) await ctx.addInitScript(drawCursor, { idleS: CLIP.cursorIdleS, fadeS: CLIP.cursorFadeS })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  const clip = new Clip(browser, ctx, page, await ctx.newCDPSession(page), view)
  clip.repro = shape === 'repro'
  return clip
}

/** How tall a page's text shows in a phone's X feed, in points, for a clip `width` CSS px wide. */
export const phonePt = (textPx: number, width: number) => tenth((textPx * CLIP.feedPt) / width)

const quantile = (sorted: number[], q: number) => sorted[Math.floor(q * (sorted.length - 1))] ?? 0
export const tenth = (n: number) => Math.round(n * 10) / 10

/** How the drawn cursor tracked the real pointer, and each way it went wrong. Rows before `from` are setup outside the clip. */
export function checkTrail(trail: TrailRow[], from = 0) {
  const rows = trail.filter(r => r[0] >= from)
  /** The drawn cursor reverses on one axis while the pointer keeps its direction there. */
  const turnedBackAlone = (r: TrailRow[], i: number, drawn: 2 | 3, real: 4 | 5) => {
    const a = r[i - 1][drawn] - r[i - 2][drawn]
    const b = r[i][drawn] - r[i - 1][drawn]
    const ta = r[i - 1][real] - r[i - 2][real]
    const tb = r[i][real] - r[i - 1][real]
    return a * b < 0 && Math.abs(a) > 0.5 && Math.abs(b) > 0.5 && ta * tb >= 0 && (ta !== 0 || tb !== 0)
  }
  const side = (down: number) => {
    const r = rows.filter(x => x[1] === down)
    let flips = 0
    const lags: number[] = []
    for (let i = 2; i < r.length; i++) {
      flips += Number(turnedBackAlone(r, i, 2, 4)) + Number(turnedBackAlone(r, i, 3, 5))
      lags.push(Math.hypot(r[i][2] - r[i][4], r[i][3] - r[i][5]))
    }
    lags.sort((x, y) => x - y)
    return { frames: r.length, flips, p95Lag: tenth(quantile(lags, 0.95)), maxLag: tenth(quantile(lags, 1)) }
  }
  const handRestMs = 200
  const pressJumps: number[] = []
  const gaps: number[] = []
  let lastMove = 0
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === 1 && rows[i - 1][1] === 0) pressJumps.push(tenth(Math.hypot(rows[i - 1][2] - rows[i - 1][4], rows[i - 1][3] - rows[i - 1][5])))
    if (rows[i][1] === 1 && (rows[i][4] !== rows[i - 1][4] || rows[i][5] !== rows[i - 1][5])) {
      if (lastMove && rows[i][0] - lastMove < handRestMs) gaps.push(rows[i][0] - lastMove)
      lastMove = rows[i][0]
    }
  }
  gaps.sort((x, y) => x - y)
  const held = side(1)
  const free = side(0)
  const snap = Math.max(0, ...pressJumps)
  const heldGapP90 = Math.round(quantile(gaps, 0.9))
  const problems: string[] = []
  if (held.flips) problems.push(`the cursor turned back on its own ${held.flips} times while a button was down`)
  if (held.maxLag > CLIP.heldLagPx) problems.push(`the cursor left the pointer by ${held.maxLag} px while a button was down, over ${CLIP.heldLagPx} px`)
  if (free.flips > CLIP.freeFlips) problems.push(`the cursor turned back ${free.flips} times on free moves, over ${CLIP.freeFlips}, so its spring may diverge`)
  if (snap > CLIP.pressJumpPx) problems.push(`the cursor jumped ${snap} px at a press, over ${CLIP.pressJumpPx} px, so let it settle before the press`)
  if (heldGapP90 > CLIP.heldGapMs) problems.push(`pointer moves came ${heldGapP90} ms apart while a button was down, over ${CLIP.heldGapMs} ms, so a stroke grows in jumps; move with Clip.over`)
  return { held, free, pressJumps, heldGapP90, problems }
}

export function checkCaption(text: string) {
  const t = text.trim()
  if (!t) throw new Error('a caption needs text or keys')
  if (t.split(/\s+/).length > CLIP.captionWords) throw new Error(`caption "${text}" has more than ${CLIP.captionWords} words; say it shorter`)
  if (/^[a-z]/.test(t)) throw new Error(`caption "${text}" starts a sentence, so it starts with a capital, as in "Draw a note"`)
  if (/\.$/.test(t)) throw new Error(`caption "${text}" ends without a period`)
  // A second platform's name hedges for viewers the clip does not have.
  const stack = t.match(/\b(windows|linux|android|ios|iphone|firefox|safari|chrome|mac|macos|pc)\b/i)
  if (stack) throw new Error(`caption "${text}" speaks to a Mac Chrome viewer in Mac keys, naming no platform or browser: "${stack[0]}"`)
}

/** Fixes what a caption can lose by accident: a lowercase start and a closing period. */
export const fixCaption = (text: string) => {
  const t = text.trim().replace(/\.$/, '')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function checkTitle(tag: string, title: string) {
  if (!/^[a-z]{2,12}$/.test(tag)) throw new Error(`tag "${tag}" must be one lowercase word, such as board or table`)
  if (title !== title.toLowerCase() || title.split(/\s+/).length > CLIP.titleWords)
    throw new Error(`title "${title}" must be lowercase and at most ${CLIP.titleWords} words`)
}

/** libx264 needs even sides, and a crop past the viewport fails, so a crop is rounded and clamped instead of refused. */
export function fitCrop(c: Crop, view: { width: number; height: number } = CLIP.wide): Crop {
  const even = (n: number) => Math.round(n / 2) * 2
  const floorEven = (n: number) => Math.floor(n / 2) * 2
  const x = Math.max(0, even(c.x))
  const y = Math.max(0, even(c.y))
  return { x, y, w: floorEven(Math.min(c.w, view.width - x)), h: floorEven(Math.min(c.h, view.height - y)) }
}

/** The rules a take can break before it is rendered, with what render fixes on its own and what would make it better. */
/** `cutS` is the still time render cuts, so the length rules judge the clip a viewer gets. */
export const isX = (take: Take) => take.view?.width === CLIP.x.width
const isPair = (take: Take) => take.view?.width === CLIP.pair.width && take.view.height === CLIP.pair.height
const isWide = (take: Take) => !take.view || (take.view.width === CLIP.wide.width && take.view.height === CLIP.wide.height)

/** An X-shape clip may go out on X alone, where the title bar is its headline, and a pair clip's head carries its title. */
export function checkBar(take: Take, bar?: Bar): string[] {
  if (bar) return []
  if (isX(take)) return ['an X-shape clip needs a title bar; render it with --tag <tag> --title "<title>"']
  return isPair(take) ? ['a before-and-after clip needs a title bar; render it with --tag <tag> --title "<title>"'] : []
}

export function reviewTake(take: Take, trail: TrailRow[], { x = isX(take), cutS = 0 }: { x?: boolean; cutS?: number } = {}): Review {
  const fails = [...checkTrail(trail, take.trailFrom).problems]
  const fixes: string[] = []
  const suggests: string[] = []
  const filmed = (take.endMs - take.startMs) / 1000 + CLIP.stillLeadS
  const seconds = filmed - cutS
  const max = take.repro ? CLIP.reproMaxSeconds : CLIP.maxSeconds
  if (seconds > max) fails.push(`the clip runs ${tenth(seconds)} s, over ${max} s; cut a beat or tighten the waits`)
  else if (x && seconds > CLIP.xSeconds) suggests.push(`the clip runs ${tenth(seconds)} s; an X clip reads best at ${CLIP.xSeconds} s or less, so tighten the waits between beats`)
  for (const c of take.captions) {
    const fixed = fixCaption(c.text)
    if (fixed !== c.text) fixes.push(`caption "${c.text}" renders as "${fixed}"`)
    try {
      checkCaption(fixed)
    } catch (e) {
      fails.push((e as Error).message)
    }
  }
  if (!take.captions.length) suggests.push('the clip has no captions, and a muted autoplay shows nothing to read; add a beat per action')
  else if (take.captions[0].t + CLIP.stillLeadS > CLIP.firstBeatS)
    suggests.push(`the first caption shows at ${tenth(take.captions[0].t + CLIP.stillLeadS)} s; open on the action, within ${CLIP.firstBeatS} s`)
  take.captions.forEach((c, i) => {
    const s = (i + 1 < take.captions.length ? take.captions[i + 1].t : filmed - CLIP.stillLeadS) - c.t
    if (s < CLIP.beatMinS) fails.push(`"${c.text}" shows for ${tenth(s)} s, under ${CLIP.beatMinS} s; hold that beat longer`)
  })
  const last = take.captions.at(-1)
  const held = last && filmed - CLIP.stillLeadS - last.t
  if (take.repro && held !== undefined && held < CLIP.reproHoldS)
    fails.push(`the clip ends ${tenth(held)} s after its last caption; end on the wrong state with read(${CLIP.reproHoldS * 1000}), so the reader sees it`)
  const view = take.view ?? CLIP.wide
  const crop = take.crop && fitCrop(take.crop, view)
  if (crop && JSON.stringify(crop) !== JSON.stringify(take.crop)) fixes.push(`the crop ${JSON.stringify(take.crop)} renders as ${JSON.stringify(crop)}`)
  if (x && !take.textPx) suggests.push('the take has no text size, so review cannot judge it on a phone; record it again')
  else if (x && take.textPx) {
    const width = crop?.w ?? view.width
    const pt = phonePt(take.textPx, width)
    const widest = Math.floor((take.textPx * CLIP.feedPt) / CLIP.phoneTextPt)
    if (pt < CLIP.phoneTextPt)
      fails.push(`the page's ${take.textPx} px text shows at ${pt} pt in a phone's X feed, under ${CLIP.phoneTextPt} pt; film with openClip's { shape: 'x' }, or crop it at most ${widest} px wide`)
  }
  return { fails, fixes, suggests }
}

/** The rules a rendered file can break. */
export async function reviewFile(file: string, maxMB = CLIP.maxMB): Promise<string[]> {
  const fails: string[] = []
  const [rate] = (await run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'default=nw=1:nk=1', file])).trim().split('\n')
  const [num, den] = rate.split('/').map(Number)
  if (Math.round(num / (den || 1)) !== CLIP.fps) fails.push(`${file} plays at ${rate} fps, not ${CLIP.fps}`)
  const mb = statSync(file).size / 2 ** 20
  if (mb > maxMB) fails.push(`${file} is ${tenth(mb)} MB, over ${maxMB} MB`)
  return fails
}

export const readTake = (dir: string) => ({
  take: JSON.parse(readFileSync(join(dir, 'take.json'), 'utf8')) as Take,
  trail: JSON.parse(readFileSync(join(dir, 'trail.json'), 'utf8')) as TrailRow[],
})

/** Cuts the clip out of a take's video at 60 fps, cropped, and returns its captions on the cut's clock. */
export async function cut(take: Take, raw: string): Promise<Beat[]> {
  const view = take.view ?? CLIP.wide
  const crop = take.crop && fitCrop(take.crop, view)
  const s = view.scale
  const vf = [crop && `crop=${crop.w * s}:${crop.h * s}:${crop.x * s}:${crop.y * s}`, `fps=${CLIP.fps}`].filter(Boolean).join(',')
  const from = (take.startMs / 1000 - CLIP.stillLeadS).toFixed(3)
  await run(['ffmpeg', '-v', 'error', '-y', '-ss', from, '-to', (take.endMs / 1000).toFixed(3), '-i', take.video, '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', raw])
  return take.captions.map(c => ({ t: Math.round((c.t + CLIP.stillLeadS) * 1000) / 1000, text: fixCaption(c.text) }))
}

/** The stretches of a video with `scale` pixels per CSS pixel where nothing on screen changes, as [from, to] seconds. */
export async function stillStretches(file: string, scale = 1): Promise<[number, number][]> {
  const [w, h] = (await run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file])).trim().split(',').map(Number)
  // Each frame's share of pixels that moved more than a few gray levels from the frame before, which signalstats prints as YAVG out of 255.
  const vf = `format=gray,tblend=all_mode=difference,lut=c0='if(gt(val,${CLIP.stillLevel}),255,0)',signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-`
  const out = await run(['ffmpeg', '-v', 'error', '-i', file, '-vf', vf, '-an', '-f', 'null', '-'])
  const changed = [...out.matchAll(/pts_time:([\d.]+)\s+lavfi\.signalstats\.YAVG=([\d.e-]+)/g)].map(
    m => [Number(m[1]), ((Number(m[2]) / 255) * w * h) / scale ** 2] as [number, number],
  )
  return stillRuns(changed, await durationOf(file))
}

/** Runs of at least `stillMinS` where each frame changes at most `caretPx` CSS px² from the one before, from [second, CSS px² changed] per frame. */
export function stillRuns(changed: [number, number][], duration: number): [number, number][] {
  const spans: [number, number][] = []
  let from: number | undefined
  for (const [t, px] of changed) {
    const previousFrame = Math.max(0, t - 1 / CLIP.fps)
    if (px <= CLIP.caretPx) from ??= previousFrame
    else {
      if (from !== undefined && t - from >= CLIP.stillMinS) spans.push([from, t])
      from = undefined
    }
  }
  if (from !== undefined && duration - from >= CLIP.stillMinS) spans.push([from, duration])
  return spans.map(([a, b]) => [Math.round(a * 1000) / 1000, Math.round(b * 1000) / 1000])
}

/** The still frames to cut: each still stretch, split where a caption starts, keeps at most `stillMaxS`, or `endHoldS` at the end, plus any `read` hold in it, and each caption keeps `beatMinS`. */
export function squeezePlan(stills: [number, number][], starts: number[], duration: number, holds: [number, number][] = [], endHoldS = CLIP.endHoldS): [number, number][] {
  const cuts: [number, number][] = []
  for (const [from, to] of stills) {
    const edges = [from, ...starts.filter(s => s > from && s < to), to]
    for (let i = 0; i + 1 < edges.length; i++) {
      const [a, b] = [edges[i], edges[i + 1]]
      const read = Math.max(0, ...holds.filter(([h0, h1]) => h0 < b && h1 > a).map(([, h1]) => h1))
      const keepTo = Math.min(b, Math.max(a + (b >= duration - 0.02 ? endHoldS : CLIP.stillMaxS), read))
      if (b - keepTo > 0.05) cuts.push([keepTo, b])
    }
  }
  starts.forEach((s, i) => {
    const end = i + 1 < starts.length ? starts[i + 1] : duration
    const inside = cuts.filter(([a]) => a >= s && a < end)
    let short = CLIP.beatMinS - (end - s - inside.reduce((n, [a, b]) => n + b - a, 0))
    for (const c of inside.reverse()) {
      if (short <= 0) break
      const back = Math.min(short, c[1] - c[0])
      c[0] += back
      short -= back
    }
  })
  return cuts.filter(([a, b]) => b - a > 0.05).map(([a, b]) => [Math.round(a * 1000) / 1000, Math.round(b * 1000) / 1000] as [number, number])
}

/** Moves each caption earlier by the cut time before it. */
export const shiftBeats = (beats: Beat[], cuts: [number, number][]): Beat[] =>
  beats.map(b => ({ ...b, t: Math.round((b.t - cuts.filter(([, to]) => to <= b.t + 1e-6).reduce((n, [a, c]) => n + c - a, 0)) * 1000) / 1000 }))

/** Drops the cut frames. The frames on either side of a still cut are the same picture, so the cut does not show. */
async function squeeze(raw: string, cuts: [number, number][], out: string) {
  const drop = cuts.map(([a, b]) => `gte(t,${a.toFixed(3)})*lt(t,${b.toFixed(3)})`).join('+')
  await run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-vf', `select='not(${drop})',setpts=N/(${CLIP.fps}*TB)`, '-an', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(CLIP.fps), out])
}

export function captionWindows(beats: Beat[], duration: number): { from: number; to: number; text: string }[] {
  return beats.map((s, i) => ({ from: s.t, to: i + 1 < beats.length ? beats[i + 1].t : Math.max(duration, s.t + CLIP.beatMinS), text: s.text }))
}

// A caption cuts on its action the way subtitles cut on speech (the owner's pick, 2026-11-19; "fade the captions" reverses it).
export function captionOverlay(w: { from: number; to: number }, base: string, img: string, out: string, foot = FOOT_PX, at = { x: '(W-w)/2', y: `H-${foot}+(${foot}-h)/2` }): string {
  // Each edge sits half a frame early, so a caption switches on at its own frame and not one late.
  const f = (n: number) => (n - 0.5 / CLIP.fps).toFixed(4)
  return `[${base}][${img}]overlay=x=${at.x}:y=${at.y}:enable='gte(t,${f(w.from)})*lt(t,${f(w.to)})'[${out}]`
}

const esc = (s: string) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)

const KEYCAP = 'display:inline-block;min-width:1.4em;text-align:center;padding:3px 9px 2px;background:#fff;color:#0a0a0a;border:1px solid #d4d4d4;border-bottom-width:3px;border-radius:7px'

// A caption in the page's own colors read as page text and got missed, and the owner picked a black footer over a black pill (2026-11-19).
const FOOT_BG = '#0a0a0a'
const caption = (px: number) => `display:inline-flex;align-items:center;gap:${Math.round(px * 0.3)}px;font:700 ${px}px/1 Inter;color:#fff;padding:2px`
// A footer label was easy to miss, so each side shows as a badge (the owner, 2026-11-20), red before and green after, the way a diff marks removed and added lines (the owner, 2026-11-22).
const SIDES = ['Before', 'After'] as const
const SIDE_COLOR: Record<(typeof SIDES)[number], string> = { Before: '#ef4444', After: '#16a34a' }
// A bug clip plays the reference page, which works, then beta, which shows the bug, so the reference is neutral and beta is red.
const REFERENCE_COLOR: Record<(typeof SIDES)[number], string> = { Before: '#525252', After: '#ef4444' }

/** Which take of a before-and-after clip a panel shows. */
export type Side = (typeof SIDES)[number]

export const captionHtml = (text: string) =>
  text
    .split(/(\[[^\]]+\])/)
    .filter(part => part.trim())
    .map(part => (part.startsWith('[') ? `<span style="${KEYCAP}">${esc(part.slice(1, -1))}</span>` : `<span>${esc(part.trim())}</span>`))
    .join('')

/** A title bar: a gray one-word area tag, then what you do. It carries no post number, because the owner may delete a post (2026-11-19). */
export type Bar = { tag: string; title: string }

const face = (family: string, weight: number, file: string) => `@font-face{font-family:${family};font-weight:${weight};src:url(data:font/ttf;base64,${readFileSync(file).toString('base64')})}`
// Cal Sans crowds its words below heading sizes, and X shows the clip at about phone width, so captions use Inter.
const fontStyle = () => `<style>${face('Cal', 600, `${ASSETS}/CalSans-SemiBold.ttf`)}${face('Inter', 700, `${ASSETS}/Inter-Bold.ttf`)}body{margin:0;background:transparent}</style>`

/** A chat clip's black head, with the title on its first line, small and gray; render lays each caption on its second. A still has no caption, so its head holds the title alone, in white. */
const headHtml = (bar: Bar | undefined, width: number, still = false) => {
  const { height, stillHeight, stillTitlePx, padPx, titleTop, titlePx } = CLIP.pairHead
  const line = still
    ? `top:0;bottom:0;align-items:center;font:700 ${stillTitlePx}px/1.25 Inter;color:#fff`
    : `top:${titleTop}px;font:700 ${titlePx}px/1.25 Inter;color:#d4d4d4`
  const title = bar
    ? `<div id="bar" style="position:absolute;left:${padPx}px;right:${padPx}px;${line};white-space:nowrap;overflow:hidden;display:flex;gap:0.3em"><span style="flex:none;color:#737373">${esc(bar.tag)} /</span><span style="flex:none">${esc(bar.title)}</span></div>`
    : ''
  return `<div id="head" style="width:${width}px;height:${still ? stillHeight : height}px;position:relative;background:${FOOT_BG}">${title}</div>`
}

const barHtml = (bar: Bar, width: number) =>
  `<div id="bar" style="width:${width}px;height:${BAR_PX}px;box-sizing:border-box;padding:2px 40px 0;background:#fafafa;border-bottom:1px solid #e5e5e5;font:600 ${CLIP.titlePx.max}px/1.1 Cal;color:#0a0a0a;white-space:nowrap;overflow:hidden;display:flex;align-items:center;gap:0.3em"><span style="flex:none;color:#a3a3a3">${esc(bar.tag)} /</span><span style="flex:none">${esc(bar.title)}</span></div>`

/** Shrinks the page's title bar until its line fits, and returns the size it fits at. */
const fitTitle = (page: Page, max = CLIP.titlePx.max) =>
  page.evaluate(async max => {
    await document.fonts.ready
    const el = document.getElementById('bar')!
    let size = max
    while (size > 1 && el.scrollWidth > el.clientWidth) el.style.fontSize = `${--size}px`
    return size
  }, max)

/** An image laid over a rendered clip from frame `from` until frame `to`, at `x` and `y` video px from the page's top left corner, written as ffmpeg overlay expressions, so they may use the image's `w` and `h` and the clip's time `t`. */
export type Mark = { file: string; x: string; y: string; from: number; to: number }

/** Stacks an optional title bar above the clip and a caption bar below it, or with `head` one black head above it that holds both, lays each mark over the result, and encodes at 60 fps. Bars draw at the clip's `scale`, so they keep their size beside the page. Returns the title's size after it shrank to fit. */
export async function renderClip(
  clip: string,
  out: string,
  { bar, captions = [], scale = 1, marks = [], route = false, head = false }: { bar?: Bar; captions?: Beat[]; scale?: number; marks?: Mark[]; route?: boolean; head?: boolean } = {},
): Promise<{ titlePx?: number }> {
  // A bug clip's bar names its browser, route and build, which no title rule fits.
  if (bar && !route) checkTitle(bar.tag, bar.title)
  let titlePx: number | undefined
  captions.forEach(c => checkCaption(c.text))
  const [pixels, duration] = (
    await run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width:format=duration', '-of', 'default=nw=1:nk=1', clip])
  )
    .trim()
    .split('\n')
    .map(Number)
  const width = pixels / scale
  const dir = mkdtempSync(join(tmpdir(), 'clip-'))
  const windows = captionWindows(captions, duration)
  const foot = windows.length > 0 && !head
  const top = (head ? (bar || windows.length ? CLIP.pairHead.height : 0) : bar ? BAR_PX : 0) * scale
  try {
    const browser = await chromium.launch()
    try {
      const page = await browser.newPage({ deviceScaleFactor: scale })
      const style = fontStyle()
      if (foot) {
        await page.setContent(`${style}<div id="foot" style="width:${width}px;height:${FOOT_PX}px;background:${FOOT_BG}"></div>`)
        await page.locator('#foot').screenshot({ path: join(dir, 'foot.png') })
      }
      for (const [i, w] of windows.entries()) {
        await page.setContent(`${style}<div id="keys" style="${caption(head ? CLIP.pairHead.captionPx : 26)}">${captionHtml(w.text)}</div>`)
        await page.evaluate(() => document.fonts.ready)
        await page.locator('#keys').screenshot({ path: join(dir, `keys-${i}.png`), omitBackground: true })
      }
      if (head && top) {
        await page.setContent(`${style}${headHtml(bar, width)}`)
        if (bar) titlePx = await fitTitle(page, CLIP.pairHead.titlePx)
        await page.locator('#head').screenshot({ path: join(dir, 'bar.png') })
      } else if (bar) {
        await page.setContent(`${style}${barHtml(bar, width)}`)
        titlePx = await fitTitle(page)
        await page.locator('#bar').screenshot({ path: join(dir, 'bar.png') })
      }
    } finally {
      await browser.close()
    }
    const layers = [top && join(dir, 'bar.png'), clip, foot && join(dir, 'foot.png')].filter((f): f is string => !!f)
    // Every looped image runs at the page's 60 fps, because one at ffmpeg's default 25 fps adds frames that `-r` then drops or repeats.
    const loop = (f: string) => ['-loop', '1', '-framerate', String(CLIP.fps), '-i', f]
    const inputs = layers.flatMap(f => (f === clip ? ['-i', f] : loop(f)))
    let graph = layers.length > 1 ? `${layers.map((_, i) => `[${i}:v]`).join('')}vstack=inputs=${layers.length}:shortest=1[v0]` : '[0:v]null[v0]'
    windows.forEach((w, i) => {
      inputs.push(...loop(join(dir, `keys-${i}.png`)))
      // With no title, the caption sits in the middle of the head.
      const { padPx, captionTop, captionH, height } = CLIP.pairHead
      const y = bar ? `${captionTop * scale}+(${captionH * scale}-h)/2` : `(${height * scale}-h)/2`
      graph += `;${captionOverlay(w, `v${i}`, `${layers.length + i}:v`, `v${i + 1}`, FOOT_PX * scale, head ? { x: String(padPx * scale), y } : undefined)}`
    })
    // A window edge sits half a frame before its frame, so a mark never shows a frame early or late.
    const at = (frame: number) => ((frame - 0.5) / CLIP.fps).toFixed(4)
    marks.forEach((m, j) => {
      inputs.push(...loop(m.file))
      const [from, to] = [`v${windows.length + j}`, `v${windows.length + j + 1}`]
      graph += `;[${layers.length + windows.length + j}:v]format=rgba[m${j}];[${from}][m${j}]overlay=x='${m.x}':y='${top}+(${m.y})':eval=frame:enable='between(t,${at(m.from)},${at(m.to)})'[${to}]`
    })
    const last = `v${windows.length + marks.length}`
    // An odd height pads one row under the footer, so it takes the footer's color.
    graph += `;[${last}]pad=ceil(iw/2)*2:ceil(ih/2)*2:color=${foot ? FOOT_BG : '#fafafa'},format=yuv420p`
    await run(['ffmpeg', '-v', 'error', '-y', ...inputs, '-filter_complex', graph, '-frames:v', String(await frameCount(clip)), '-c:v', 'libx264', '-r', String(CLIP.fps), '-movflags', '+faststart', out])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  return { titlePx }
}

type Box = { x: number; y: number; w: number; h: number }

/** Where two RGB frames of `w`×`h` pixels differ, as a box in those pixels, or undefined when they match. A blob under a quarter of the largest one, such as a cursor that moved, does not count, and neither does one of `minArea` pixels or fewer. */
export function changedBox(a: Uint8Array, b: Uint8Array, w: number, h: number, minArea = 0): Box | undefined {
  const r = 4
  const on = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) on[i] = Math.max(Math.abs(a[3 * i] - b[3 * i]), Math.abs(a[3 * i + 1] - b[3 * i + 1]), Math.abs(a[3 * i + 2] - b[3 * i + 2])) > 32 ? 1 : 0
  // Grown by r pixels, so the letters of one line join into one blob.
  const grow = (src: Uint8Array, dx: number, dy: number) =>
    src.map((_, i) => {
      const [x, y] = [i % w, Math.floor(i / w)]
      for (let d = -r; d <= r; d++) {
        const [u, v] = [x + d * dx, y + d * dy]
        if (u >= 0 && u < w && v >= 0 && v < h && src[v * w + u]) return 1
      }
      return 0
    })
  const mask = grow(grow(on, 1, 0), 0, 1)
  const blobs: (Box & { area: number })[] = []
  for (let start = 0; start < mask.length; start++) {
    if (mask[start] !== 1) continue
    const stack = [start]
    mask[start] = 2
    let [x0, y0, x1, y1, area] = [w, h, 0, 0, 0]
    while (stack.length) {
      const i = stack.pop()!
      const [x, y] = [i % w, Math.floor(i / w)]
      ;[x0, y0, x1, y1, area] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y), area + 1]
      for (const [u, v] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]])
        if (u >= 0 && u < w && v >= 0 && v < h && mask[v * w + u] === 1) {
          mask[v * w + u] = 2
          stack.push(v * w + u)
        }
    }
    blobs.push({ x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, area })
  }
  const big = Math.max(0, ...blobs.map(b => b.area))
  const kept = blobs.filter(b => b.area > minArea && b.area >= big / 4)
  if (!kept.length) return undefined
  const [x0, y0] = [Math.min(...kept.map(b => b.x)), Math.min(...kept.map(b => b.y))]
  return { x: x0, y: y0, w: Math.max(...kept.map(b => b.x + b.w)) - x0, h: Math.max(...kept.map(b => b.y + b.h)) - y0 }
}

/** The page area a before-and-after image shows: the changed box, scaled by `unit` to CSS pixels, with 16 px of page around it, at least half the page wide and a quarter tall. The whole page when nothing changed or the area would cover most of it. */
function cropAround(box: Box | undefined, unit: [x: number, y: number], width: number, height: number): Box {
  const page = { x: 0, y: 0, w: width, h: height }
  if (!box) return page
  const span = (start: number, len: number, min: number, size: number) => {
    const n = Math.min(size, Math.max(len + 32, min))
    return [Math.min(Math.max(start + len / 2 - n / 2, 0), size - n), n]
  }
  const [x, w] = span(box.x * unit[0], box.w * unit[0], width / 2, width)
  const [y, h] = span(box.y * unit[1], box.h * unit[1], height / 4, height)
  return w * h > 0.8 * width * height ? page : { x, y, w, h }
}


// The drawn cursor is 22 by 26 px, so at half size and grown by changedBox's 4 px on each side its blob fits this box.
const CURSOR_AREA = (22 / 2 + 8) * (26 / 2 + 8)
const SAMPLE_FPS = 10

/** A page clip's frames, ten a second at half size, as RGB. */
function sampleFrames(clip: string, width: number, height: number): { frames: Uint8Array[]; w: number; h: number } {
  const [w, h] = [Math.round(width / 2), Math.round(height / 2)]
  const raw = Bun.spawnSync(['ffmpeg', '-v', 'error', '-i', clip, '-vf', `fps=${SAMPLE_FPS},scale=${w}:${h}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-']).stdout
  const size = w * h * 3
  return { frames: Array.from({ length: Math.floor(raw.length / size) }, (_, i) => raw.subarray(i * size, (i + 1) * size)), w, h }
}

/** The page's own background: the color most pixels along an RGB frame's edges have, as 0xRRGGBB. */
export function pageColor(frame: Uint8Array, w: number, h: number): number {
  const counts = new Map<number, number>()
  const add = (i: number) => {
    const c = (frame[3 * i] << 16) | (frame[3 * i + 1] << 8) | frame[3 * i + 2]
    counts.set(c, (counts.get(c) ?? 0) + 1)
  }
  for (let x = 0; x < w; x++) add(x), add((h - 1) * w + x)
  for (let y = 1; y < h - 1; y++) add(y * w), add(y * w + w - 1)
  return [...counts].reduce((a, b) => (b[1] > a[1] ? b : a))[0]
}

/** The box around every pixel of any of the RGB frames that is not the page's `color`, in their pixels, or undefined when every frame is blank. */
export function contentBox(frames: Uint8Array[], w: number, h: number, color: number): Box | undefined {
  const [r, g, b] = [color >> 16, (color >> 8) & 255, color & 255]
  let [x0, y0, x1, y1] = [w, h, -1, -1]
  for (const f of frames)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = 3 * (y * w + x)
        if (Math.max(Math.abs(f[i] - r), Math.abs(f[i + 1] - g), Math.abs(f[i + 2] - b)) <= 32) continue
        ;[x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)]
      }
  return x1 < 0 ? undefined : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}

/** A box of sampled pixels, scaled by `unit` to CSS px and grown by `CLIP.comparePadPx` inside the `width`×`height` page, or the whole page when there is no box. */
export function padBox(box: Box | undefined, [ux, uy]: [number, number], width: number, height: number): Box {
  if (!box) return { x: 0, y: 0, w: width, h: height }
  const pad = CLIP.comparePadPx
  const [x, y] = [Math.max(0, box.x * ux - pad), Math.max(0, box.y * uy - pad)]
  return { x, y, w: Math.min(width, (box.x + box.w) * ux + pad) - x, h: Math.min(height, (box.y + box.h) * uy + pad) - y }
}

/** One stretch of a page clip as an aligned clip plays it: frames `from` to `to`, then its last frame held `held` more frames. */
export type Span = [from: number, to: number, held: number]

/** Lines two takes up caption by caption, in frames. Each stretch between two captions, and the lead before the first, plays for the longer take's length, and the shorter take holds its frame for the rest. Both then hold `holdFrames` more at the end. Returns each take's spans, where each caption starts, and the aligned length. */
export function alignBeats(beats: [number[], number[]], frames: [number, number], holdFrames = 0) {
  const edges = beats.map((b, i) => [0, ...b, frames[i]])
  const lengths = edges[0].slice(1).map((_, j) => Math.max(...edges.map(e => e[j + 1] - e[j])))
  lengths[lengths.length - 1] += holdFrames
  const plan = edges.map(e => lengths.map((len, j) => [e[j], e[j + 1], len - (e[j + 1] - e[j])] as Span))
  const starts = lengths.slice(0, -1).map((_, j) => lengths.slice(0, j + 1).reduce((n, l) => n + l, 0))
  return { plan, starts, frames: lengths.reduce((n, l) => n + l, 0) }
}

/** The ffmpeg filters that play `input` span by span into `out`. A span with no frames of its own holds the frame before it. */
function spanGraph(input: string, spans: Span[], out: string): string {
  const parts = spans
    .filter(([a, b, held]) => b - a + held > 0)
    .map(([a, b, held]): Span => (b > a ? [a, b, held] : [Math.max(0, a - 1), Math.max(0, a - 1) + 1, held - 1]))
  const ids = parts.map((_, j) => `${out}_${j}`)
  const head = parts.length > 1 ? `[${input}]split=${parts.length}${ids.map(id => `[${id}i]`).join('')}` : `[${input}]null[${ids[0]}i]`
  const body = parts.map(([a, b, held], j) => `[${ids[j]}i]trim=start_frame=${a}:end_frame=${b},setpts=PTS-STARTPTS${held > 0 ? `,tpad=stop_mode=clone:stop=${held}` : ''}[${ids[j]}]`)
  return [head, ...body, `${ids.map(id => `[${id}]`).join('')}concat=n=${parts.length}:v=1:a=0[${out}]`].join(';')
}

/** Where two cards of `panel` size sit centered on a `width`×`height` page, in CSS px: side by side, before left of after, when `across`, otherwise before above after. Returns each copy's left edge and top, inside its border and under its band. */
function placeCards(panel: { w: number; h: number }, across: boolean, width: number, height: number) {
  const { gapPx: g, bandPx: b, borderPx: e } = CARD
  if (across) {
    const [left, top] = [(width - 2 * panel.w - g - 4 * e) / 2 + e, (height - panel.h - b - e) / 2 + b]
    return { x: [left, left + panel.w + 2 * e + g] as [number, number], y: [top, top] as [number, number] }
  }
  const [left, top] = [(width - panel.w) / 2, (height - 2 * (panel.h + b + e) - g) / 2 + b]
  return { x: [left, left] as [number, number], y: [top, top + panel.h + e + g + b] as [number, number] }
}

/** Where two cards put their copies of a page's `trim` area on a `width`×`height` page, in CSS px: each copy zoomed as far as the page allows, up to `maxK`, under its band and inside its border, centered. Columns put before left of after, rows put before above after; with `rows` the layout picks whichever shows the copies larger, columns on a tie. Returns its zoom, each copy's size, and each copy's left edge and top, without their cards. */
export function cardLayout(trim: Box, width: number, height: number, maxK: number, rows: boolean) {
  const { marginPx: m, gapPx: g, bandPx: b, borderPx: e } = CARD
  const columns = Math.min(maxK, (width - 2 * m - g - 4 * e) / 2 / trim.w, (height - 2 * m - b - e) / trim.h)
  // A tall crop in rows left each copy under half the frame, so a menu or a list showed as a thumbnail (the owner, 2026-11-23).
  const stacked = rows ? Math.min(maxK, (width - 2 * m - 2 * e) / trim.w, (height - 2 * m - g - 2 * (b + e)) / 2 / trim.h) : 0
  const across = columns >= stacked
  const k = across ? columns : stacked
  const panel = { w: trim.w * k, h: trim.h * k }
  return { k, panel, across, ...placeCards(panel, across, width, height) }
}

/** Where a pair clip puts its two cards on the pair canvas, side by side, and how tall the canvas is: as tall as the cards with their margin, up to 16:9 with the head. */
export function pairLayout(trim: Box, maxK: number) {
  const { width } = CLIP.pairCanvas
  const { marginPx: m, bandPx: b, borderPx: e } = CARD
  const at = cardLayout(trim, width, (width * 9) / 16 - CLIP.pairHead.height, maxK, false)
  return { ...at, y: [m + b, m + b] as [number, number], height: m + b + at.panel.h + e + m }
}

/** Where a bug clip puts its cards, in CSS px: both as large as `CLIP.reproStage` allows but never past their own pixels, in columns or rows, on a page just large enough for them and at least `minWidth` wide, centered. */
export function reproLayout(trim: Box) {
  const { marginPx: m, gapPx: g, bandPx: b, borderPx: e } = CARD
  const bound = CLIP.reproStage
  const pair = cardLayout(trim, bound.width, bound.height, 1, true)
  const { w, h } = pair.panel
  const width = Math.max(bound.minWidth, pair.across ? 2 * (w + 2 * e) + g + 2 * m : w + 2 * e + 2 * m)
  const height = pair.across ? b + h + e + 2 * m : 2 * (b + h + e) + g + 2 * m
  return { ...pair, ...placeCards(pair.panel, pair.across, width, height), width, height }
}

type Card = { file: string; dx: number; dy: number }

/** Renders each side's card for a copy `w`×`h` video px at `scale` video px per CSS px into `dir`, named `name`, labeled `labels` in `colors`: the band, the border and the corners, clear where the copy shows. Returns each card's file with how far its corner sits up and left of the copy's. */
async function cards(dir: string, name: string, scale: number, [w, h]: [number, number], { labels, colors }: CardStyle): Promise<Record<Side, Card>> {
  const [e, b, r, label, pad] = [CARD.borderPx, CARD.bandPx, CARD.radiusPx, CARD.labelPx, 10].map(v => Math.round(v * scale))
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    const out = {} as Record<Side, Card>
    for (const side of SIDES) {
      const file = join(dir, `${name}-${side}.png`)
      await page.setContent(
        `${fontStyle()}<div id="c" style="width:${w + 2 * e}px;height:${b + h + e}px;box-sizing:border-box;border:${e}px solid ${colors[side]};border-top:0;border-radius:${r}px;overflow:hidden"><div style="height:${b}px;display:flex;align-items:center;padding:0 ${pad}px;font:700 ${label}px/1 Inter;letter-spacing:0.08em;text-transform:uppercase;background:${colors[side]};color:#fff">${esc(labels[SIDES.indexOf(side)])}</div></div>`,
      )
      await page.evaluate(() => document.fonts.ready)
      await page.locator('#c').screenshot({ path: file, omitBackground: true })
      out[side] = { file, dx: e, dy: b }
    }
    return out
  } finally {
    await browser.close()
  }
}

/** The names and colors of a clip's two cards. */
type CardStyle = { labels: [string, string]; colors: Record<Side, string> }

const even = (v: number) => 2 * Math.round(v / 2)

/** Where the replay puts each copy, in video px: the crop of the take it shows, each copy's size, and each copy's left edge and top. */
export type ReplayPx = { crop: Box; w: number; h: number; x: [number, number]; y: [number, number] }

/** Plays both copies as `plan` lines them up, each cropped to `trim`, on the page's own `background`, into one page clip, and renders their cards into `dir`. On the pair `canvas` they play side by side from the first frame. Otherwise each take of `takes` frames plays whole in its own card first, the before take while the after card waits empty, then the after take while the before take holds its last frame. Returns where the copies sit and each card, in video px. */
async function renderReplay(
  clips: [string, string],
  plan: Span[][],
  trim: Box,
  { width, height, scale, background, frames, takes, canvas, style, dir }: { width: number; height: number; scale: number; background: string; frames: number; takes: [number, number]; canvas?: { width: number; scale: number }; style: CardStyle; dir: string },
  out: string,
): Promise<ReplayPx & { k: number; across: boolean; card: Record<Side, Card> }> {
  // The take's pixels and the stage's pixels differ on a pair canvas, so a copy can zoom past its CSS size without upscaling.
  const outScale = canvas?.scale ?? scale
  const src = (v: number) => 2 * Math.round((v * scale) / 2)
  const px = (v: number) => 2 * Math.round((v * outScale) / 2)
  const layout = canvas ? pairLayout(trim, scale / outScale) : reproLayout(trim)
  const stage = canvas ? { width: CLIP.pairCanvas.width, height: (layout as ReturnType<typeof pairLayout>).height } : (layout as ReturnType<typeof reproLayout>)
  const crop = { w: src(trim.w), h: src(trim.h), x: 0, y: 0 }
  ;[crop.x, crop.y] = [Math.min(src(trim.x), src(width) - crop.w), Math.min(src(trim.y), src(height) - crop.h)]
  const at: ReplayPx = { crop, w: px(layout.panel.w), h: px(layout.panel.h), x: [px(layout.x[0]), px(layout.x[1])], y: [px(layout.y[0]), px(layout.y[1])] }
  const card = await cards(dir, 'card', outScale, [at.w, at.h], style)
  const renumber = `setpts=N/(${CLIP.fps}*TB)`
  const [W, H] = [px(stage.width), px(stage.height)]
  const replay = [
    ...clips.map((_, i) => `${spanGraph(`r${i}`, plan[i], `s${i}`)};[s${i}]crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=${at.w}:${at.h}:flags=lanczos,setsar=1[p${i}]`),
    // A rounded duration can give the background one frame more than the replay holds, so it stops at a frame count.
    `color=c=${background}:s=${W}x${H}:r=${CLIP.fps},trim=end_frame=${frames}[bg]`,
    `[bg][p0]overlay=x=${at.x[0]}:y=${at.y[0]}:shortest=1[b1]`,
    `[b1][p1]overlay=x=${at.x[1]}:y=${at.y[1]}:shortest=1,setsar=1,format=yuv420p,${renumber}[rep]`,
  ]
  const fit = `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=${at.w}:${at.h}:flags=lanczos,setsar=1,${renumber}`
  const graph = canvas
    ? ['[0:v]null[r0]', '[1:v]null[r1]', ...replay]
    : [
        '[0:v]split=2[f0][r0]',
        '[1:v]split=2[f1][r1]',
        // Each part counts its frames from 0, because a take's cut can start a frame late and concat would fill that gap with a repeated frame.
        `[f0]${fit},tpad=stop_mode=clone:stop=${takes[1]}[w0]`,
        `[f1]${fit},tpad=start=${takes[0]}:start_mode=add:color=${background}[w1]`,
        `color=c=${background}:s=${W}x${H}:r=${CLIP.fps},trim=end_frame=${takes[0] + takes[1]}[wbg]`,
        `[wbg][w0]overlay=x=${at.x[0]}:y=${at.y[0]}:shortest=1[wa]`,
        `[wa][w1]overlay=x=${at.x[1]}:y=${at.y[1]}:shortest=1,setsar=1,format=yuv420p,${renumber}[whole]`,
        ...replay,
        '[whole][rep]concat=n=2:v=1:a=0[rep2]',
      ]
  await run(['ffmpeg', '-v', 'error', '-y', '-i', clips[0], '-i', clips[1], '-filter_complex', graph.join(';'), '-map', canvas ? '[rep]' : '[rep2]', '-c:v', 'libx264', '-crf', '16', '-r', String(CLIP.fps), out])
  return { ...at, k: layout.k, across: layout.across, card }
}

const pageSize = async (clip: string, scale: number) =>
  (await run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', clip])).trim().split(',').map(n => Number(n) / scale)

const frameCount = async (clip: string) =>
  Number((await run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', clip])).trim())

/** Puts the still before a change beside or above the still after it, both cropped to the area where they differ, each in its card, under an optional head, as one PNG. `scale` is how many image pixels each CSS px takes, so the cards and the head keep their size beside the page. Returns its review. */
export async function renderPair(images: [before: string, after: string], out: string, { bar, scale = 1 }: { bar?: Bar; scale?: number } = {}): Promise<Review> {
  const review: Review = { fails: [], fixes: [], suggests: [] }
  const sizes = await Promise.all(images.map(f => pageSize(f, scale)))
  if (sizes[0].join() !== sizes[1].join()) return { ...review, fails: [`the before still is ${sizes[0].map(n => n * scale).join('x')} and the after still ${sizes[1].map(n => n * scale).join('x')}; take both at one size`] }
  const [width, height] = sizes[1]
  const [qw, qh] = [Math.round(width / 2), Math.round(height / 2)]
  const rgb = images.map(f => Bun.spawnSync(['ffmpeg', '-v', 'error', '-i', f, '-vf', `scale=${qw}:${qh}`, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-']).stdout)
  const box = changedBox(rgb[0], rgb[1], qw, qh)
  if (!box) return { ...review, fails: ['the two stills show the same thing; take the before still on the code before the change'] }
  const c = cropAround(box, [width / qw, height / qh], width, height)
  const src = images.map(f => `data:image/png;base64,${readFileSync(f).toString('base64')}`)
  // The stills sit in the same cards as a clip's copies, side by side when both fit the page's width or each is taller than wide, because two phone screens stacked made a strip four times as tall as wide (the owner, 2026-11-26).
  const { marginPx: m, gapPx: g, bandPx: b, borderPx: e, radiusPx: r, labelPx } = CARD
  const across = 2 * c.w <= width || c.h > c.w
  const card = (side: Side, i: number) =>
    `<div style="box-sizing:border-box;border:${e}px solid ${SIDE_COLOR[side]};border-top:0;border-radius:${r}px;overflow:hidden;${i ? (across ? `margin-left:${g}px` : `margin-top:${g}px`) : ''}"><div style="height:${b}px;display:flex;align-items:center;padding:0 10px;font:700 ${labelPx}px/1 Inter;letter-spacing:0.08em;text-transform:uppercase;background:${SIDE_COLOR[side]};color:#fff">${side}</div><div style="position:relative;overflow:hidden;width:${c.w}px;height:${c.h}px"><img src="${src[i]}" style="position:absolute;left:${-c.x}px;top:${-c.y}px;width:${width}px;height:${height}px;max-width:none"></div></div>`
  const stageW = (across ? 2 : 1) * (c.w + 2 * e) + (across ? g : 0) + 2 * m
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ deviceScaleFactor: scale })
    await page.setContent(
      `${fontStyle()}<div id="stage" style="width:${stageW}px;background:#fafafa">${bar ? headHtml(bar, stageW, true) : ''}<div style="padding:${m}px;display:flex;flex-direction:${across ? 'row' : 'column'};align-items:flex-start">${SIDES.map(card).join('')}</div></div>`,
    )
    await page.evaluate(() => document.fonts.ready)
    if (bar) {
      checkTitle(bar.tag, bar.title)
      const titlePx = await fitTitle(page, CLIP.pairHead.stillTitlePx)
      if (titlePx < CLIP.pairHead.stillTitlePx) review.suggests.push(`the title shrank to ${titlePx} px to fit the head's line; shorten the title`)
    }
    await page.locator('#stage').screenshot({ path: out })
  } finally {
    await browser.close()
  }
  return review
}


/** A still just before each caption gives way to the next, and one on the last frame, so whoever sends the clip can read what it shows. */
export async function stills(file: string, captions: Beat[], dir: string): Promise<string[]> {
  mkdirSync(dir, { recursive: true })
  const duration = await durationOf(file)
  const times = [...captions.slice(1).map(c => c.t - 0.15), duration - 0.1]
  const files: string[] = []
  for (const [i, t] of times.entries()) {
    const png = join(dir, `${i + 1}.png`)
    await run(['ffmpeg', '-v', 'error', '-y', '-ss', Math.max(0, t).toFixed(3), '-i', file, '-frames:v', '1', png])
    files.push(png)
  }
  return files
}

/** What a viewer gets from a rendered clip. */
export type Signals = { seconds: number; firstMotionS: number; movingPct: number; resultPct: number; textPt?: number }

/** The percent of pixels that differ by more than `threshold` between two gray frames of one size. */
export function changedPct(a: Uint8Array, b: Uint8Array, threshold = CLIP.resultLevel) {
  if (a.length !== b.length) throw new Error(`frames of ${a.length} and ${b.length} pixels do not compare`)
  let n = 0
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > threshold) n++
  return Math.round((100 * n) / (a.length || 1))
}

async function grayFrame(file: string, t: number): Promise<Uint8Array> {
  const cmd = ['ffmpeg', '-v', 'error', '-ss', Math.max(0, t).toFixed(3), '-i', file, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'gray', '-']
  const proc = Bun.spawn(cmd, { stdout: 'pipe', stderr: 'pipe' })
  const [bytes, code] = await Promise.all([new Response(proc.stdout).arrayBuffer(), proc.exited])
  if (code !== 0 || !bytes.byteLength) throw new Error(`ffmpeg read no frame of ${file} at ${t} s`)
  return new Uint8Array(bytes)
}

/** Reads a clip's signals off the clip before its bars: when something first moves, how much of it moves, and how much its last frame differs from its first. */
export async function clipSignals(clip: string, take: Take): Promise<Signals> {
  const duration = await durationOf(clip)
  const view = take.view ?? CLIP.wide
  const still = await stillStretches(clip, view.scale)
  const width = take.crop ? fitCrop(take.crop, view).w : view.width
  return {
    seconds: tenth(duration),
    firstMotionS: still[0] && still[0][0] < 0.05 ? tenth(still[0][1]) : 0,
    movingPct: Math.round(100 * (1 - still.reduce((n, [a, b]) => n + b - a, 0) / duration)),
    resultPct: changedPct(await grayFrame(clip, 0), await grayFrame(clip, duration - 0.1)),
    ...(take.textPx ? { textPt: phonePt(take.textPx, width) } : {}),
  }
}

export const printReview = ({ fails, fixes, suggests, stills = [], signals }: Review & { stills?: string[]; signals?: Signals }) => {
  for (const f of fails) console.log(`FAIL  ${f}`)
  for (const f of fixes) console.log(`FIXED ${f}`)
  for (const s of suggests) console.log(`TRY   ${s}`)
  if (!fails.length && !fixes.length && !suggests.length) console.log('OK    nothing to fix or try')
  for (const s of stills) console.log(`STILL ${s}`)
  if (signals) {
    const text = signals.textPt ? `, page text at ${signals.textPt} pt on a phone` : ''
    console.log(
      `SIGNALS ${signals.seconds} s, first motion at ${signals.firstMotionS} s, moving ${signals.movingPct}% of the time, the result changes ${signals.resultPct}% of the frame${text}`,
    )
  }
}

/** Reviews a take, cuts it and squeezes its still stretches, and returns its review and, unless it fails, the page clip without bars and its captions on that clip's clock. */
async function pageClip(dir: string, endHoldS?: number): Promise<Review & { take: Take; page?: { clip: string; captions: Beat[] } }> {
  const { take, trail } = readTake(dir)
  const raw = join(dir, 'cut.mp4')
  let captions = await cut(take, raw)
  const duration = await durationOf(raw)
  const holds = (take.holds ?? []).map(([a, b]) => [a + CLIP.stillLeadS, b + CLIP.stillLeadS] as [number, number])
  // A bug clip keeps every frame, because a pause can be the bug and the issue's timestamps must match the clip.
  const cuts = take.repro ? [] : squeezePlan(await stillStretches(raw, take.view?.scale), captions.map(c => c.t), duration, holds, endHoldS)
  const review = reviewTake(take, trail, { cutS: cuts.reduce((n, [a, b]) => n + b - a, 0) })
  if (review.fails.length) return { ...review, take }
  let clip = raw
  if (cuts.length) {
    clip = join(dir, 'squeezed.mp4')
    await squeeze(raw, cuts, clip)
    captions = shiftBeats(captions, cuts)
    review.fixes.push(`cut ${tenth(cuts.reduce((n, [a, b]) => n + b - a, 0))} s where nothing moved: ${cuts.map(([a, b]) => `${tenth(b - a)} s at ${tenth(a)} s`).join(', ')}`)
  }
  return { ...review, take, page: { clip, captions } }
}

const shortTitle = (titlePx: number | undefined) =>
  titlePx && titlePx < CLIP.titlePx.min ? [`the title bar shrank to ${titlePx} px to fit one line, under the ${CLIP.titlePx.min} px a phone reads at ${titleMinPt} pt; shorten the title`] : []

/** Reviews a take, refuses it on a FAIL, then cuts and renders it, reviews the file, and returns its stills and its signals, which it also writes to signals.json. */
export async function renderTake(dir: string, out: string, opts: { bar?: Bar } = {}): Promise<Review & { stills: string[]; signals?: Signals }> {
  const { take, page, ...review } = await pageClip(dir)
  if (!page) return { ...review, stills: [] }
  // A clip for a chat or an issue reads its text in one head on top; only an X clip keeps X's headline and subtitles.
  const head = !!take.repro || isWide(take)
  const { titlePx } = await renderClip(page.clip, out, { bar: opts.bar, captions: page.captions, scale: take.view?.scale, route: take.repro, head })
  if (!take.repro && !head) review.suggests.push(...shortTitle(titlePx))
  if (head && !take.repro && titlePx && titlePx < CLIP.pairHead.titlePx) review.suggests.push(`the title shrank to ${titlePx} px to fit the head's line; shorten the title`)
  review.fails.push(...(await reviewFile(out, take.repro ? CLIP.reproMaxMB : CLIP.maxMB)))
  const signals = await clipSignals(page.clip, take)
  await Bun.write(join(dir, 'signals.json'), JSON.stringify(signals, null, 2))
  return { ...review, stills: await stills(out, page.captions, join(dir, 'stills')), signals }
}

/** What stops two takes from playing as one before-and-after clip: a different page shape or crop would give the two panels different frames, and different beats leave nothing to line them up by. */
export function checkPair(before: Take, after: Take): string[] {
  const shape = (t: Take) => {
    const view = t.view ?? CLIP.wide
    const c = t.crop ? fitCrop(t.crop, view) : undefined
    return `${view.width}x${view.height}@${view.scale}${c ? ` crop ${c.w}x${c.h}` : ''}`
  }
  const [a, b] = [shape(before), shape(after)]
  const fails = a === b ? [] : [`the before take films ${a} and the after take ${b}; film both with the same shape and crop size`]
  for (const [side, t] of [['before', before], ['after', after]] as const) {
    if (!t.repro && (!isPair(t) || t.crop))
      fails.push(`the ${side} take films ${shape(t)}; film a before-and-after take with openClip's { shape: 'pair' } and no crop, so both copies fit the clip side by side`)
  }
  if (before.captions.length !== after.captions.length)
    fails.push(`the before take has ${before.captions.length} captions and the after take ${after.captions.length}; caption the same beats in both, so they play in step`)
  return fails
}

/** Renders the take before a change and the take after it as one clip: each whole under its tab, then both stacked, playing each step at the same moment. */
export async function renderCompare(before: string, after: string, out: string, opts: { bar?: Bar; names?: [string, string] } = {}): Promise<Review & { stills: string[]; signals?: Signals }> {
  const fails = checkPair(readTake(before).take, readTake(after).take)
  if (fails.length) return { fails, fixes: [], suggests: [], stills: [] }
  const results = [await pageClip(before, CLIP.compareEndS), await pageClip(after, CLIP.compareEndS)]
  const label = (lines: string[][]) => lines.flatMap((l, i) => l.map(line => `${SIDES[i]}: ${line}`))
  const review: Review = { fails: label(results.map(r => r.fails)), fixes: label(results.map(r => r.fixes)), suggests: label(results.map(r => r.suggests)) }
  if (review.fails.length) return { ...review, stills: [] }
  const pages = results.map(r => r.page!)
  const take = results[1].take
  const scale = take.view?.scale ?? 1
  const [width, height] = await pageSize(pages[1].clip, scale)
  const texts = pages[1].captions.map(c => c.text)
  pages[0].captions.forEach((c, i) => {
    if (c.text !== texts[i]) review.suggests.push(`caption ${i + 1} reads "${c.text}" before and "${texts[i]}" after, and the clip shows the after one; caption both takes the same`)
  })
  const clips = [pages[0].clip, pages[1].clip] as [string, string]
  const frames = (await Promise.all(clips.map(frameCount))) as [number, number]
  const beats = pages.map(p => p.captions.map(c => Math.round(c.t * CLIP.fps))) as [number[], number[]]
  const sampled = clips.map(clip => sampleFrames(clip, width, height))
  const { w, h } = sampled[0]
  const edges = beats.map((b, i) => [0, ...b, frames[i]])
  const sample = (i: number, frame: number) => Math.min(sampled[i].frames.length - 1, Math.floor((frame * SAMPLE_FPS) / CLIP.fps))
  const steps = edges.map((e, i) => e.slice(1).map((end, j): [number, number] => [sample(i, e[j]), sample(i, end - 1) + 1])) as [[number, number][], [number, number][]]
  const differs = steps[0].map((_, j) => !!changedBox(sampled[0].frames[steps[0][j][1] - 1], sampled[1].frames[steps[1][j][1] - 1], w, h, CURSOR_AREA))
  if (!differs.some(Boolean)) return { ...review, fails: ['the two takes end every step the same; film the before take on the code before the change'], stills: [] }
  // A wipe, a stack cropped to the change and cards each fit one kind of change and read as a puzzle, so every clip shows both takes with whole pages, the same edit for any change. Waiting through the before take to see the new behavior read as weird, so a pair clip plays the two side by side from its first frame (the owner, 2026-11-25).
  const aligned = alignBeats(beats, frames, Math.round((CLIP.compareHoldS - CLIP.compareEndS) * CLIP.fps))
  const color = pageColor(sampled[1].frames[0], w, h)
  const trim = padBox(contentBox([...sampled[0].frames, ...sampled[1].frames], w, h, color), [width / w, height / h], width, height)
  const page = join(after, 'compare.mp4')
  let captions: Beat[] = []
  let titlePx: number | undefined
  const dir = mkdtempSync(join(tmpdir(), 'clip-tabs-'))
  try {
    // A bug clip is evidence, so it plays each take whole first; a pair clip plays side by side from its first frame.
    const canvas = take.repro ? undefined : CLIP.pairCanvas
    const outScale = canvas?.scale ?? scale
    const background = `0x${color.toString(16).padStart(6, '0')}`
    const style: CardStyle = canvas ? { labels: [...SIDES], colors: SIDE_COLOR } : { labels: opts.names ?? ['reference', 'beta'], colors: REFERENCE_COLOR }
    const at = await renderReplay(clips, aligned.plan, trim, { width, height, scale, background, frames: aligned.frames, takes: frames, canvas, style, dir }, page)
    const moved = canvas ? 0 : frames[0] + frames[1]
    const end = moved + aligned.frames
    const rendered = await frameCount(page)
    if (rendered !== end) throw new Error(`the page clip has ${rendered} frames, not the ${end} its cards and captions expect`)
    const text = take.textPx && !take.repro ? `, page text at ${phonePt(take.textPx * at.k, (canvas ?? { width }).width)} pt on a phone` : ''
    review.fixes.push(`${canvas ? 'played both' : 'played the before take, the after take, then both'} in ${at.across ? 'columns' : 'rows'} at ${tenth(at.k)}× size${text}`)
    const place = (c: Card, x: number, y: number, from: number, to: number): Mark => ({ file: c.file, x: String(x - c.dx), y: String(y - c.dy), from, to })
    const copies = SIDES.map((side, i) => place(at.card[side], at.x[i], at.y[i], 0, end))
    if (canvas) {
      captions = aligned.starts.map((f, i) => ({ t: (i ? f : 0) / CLIP.fps, text: texts[i] }))
      titlePx = (await renderClip(page, out, { bar: opts.bar, captions, scale: outScale, marks: copies, head: true })).titlePx
      return await finishCompare(review, out, take, titlePx, captions, after, pages[1].clip)
    }
    // Each part's first caption starts on the part's first frame, so a take's last caption never plays over the next part.
    const part = (b: number[], at: number, first: number) => b.map((f, i) => (i ? f + at : first))
    const starts = [...part(beats[0], 0, 0), ...part(beats[1], frames[0], frames[0]), ...part(aligned.starts, moved, frames[0] + frames[1])]
    captions = starts.map((f, i) => ({ t: f / CLIP.fps, text: texts[i % texts.length] }))
    titlePx = (await renderClip(page, out, { bar: opts.bar, captions, scale, marks: copies, route: take.repro, head: true })).titlePx

  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  return await finishCompare(review, out, take, titlePx, captions, after, pages[1].clip)
}

/** Reviews a rendered before-and-after clip's title, size and length, and writes its stills. */
async function finishCompare(review: Review, out: string, take: Take, titlePx: number | undefined, captions: Beat[], after: string, afterPage: string): Promise<Review & { stills: string[]; signals?: Signals }> {
  // Only a bug clip skips the pair head, so every other compare has the head's small title.
  if (!take.repro && titlePx && titlePx < CLIP.pairHead.titlePx) review.suggests.push(`the title shrank to ${titlePx} px to fit the head's line; shorten the title`)
  review.fails.push(...(await reviewFile(out, take.repro ? CLIP.reproMaxMB : CLIP.maxMB)))
  const seconds = await durationOf(out)
  const max = take.repro ? CLIP.reproMaxSeconds : CLIP.maxSeconds
  if (seconds > max + 0.05) review.fails.push(`${out} runs ${tenth(seconds)} s, over ${max} s; shorten either take`)
  return { ...review, stills: await stills(out, captions, join(after, 'stills-compare')), signals: await clipSignals(afterPage, take) }
}


const durationOf = async (file: string) => Number((await run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file])).trim())

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: 'pipe', stderr: 'pipe' })
  const [out, err, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited])
  if (code !== 0) throw new Error(`${cmd[0]} exited ${code}: ${err.trim().slice(0, 300)}`)
  return out
}

if (import.meta.main) {
  const [cmd, ...args] = process.argv.slice(2)
  const flag = (name: string) => {
    const at = args.indexOf(`--${name}`)
    return at === -1 ? undefined : args[at + 1]
  }
  if (cmd === 'review' && args[0]) {
    const { take, trail } = readTake(args[0])
    const review = reviewTake(take, trail)
    printReview(review)
    process.exit(review.fails.length ? 1 : 0)
  } else if (cmd === 'render' && args[0] && args[1] && !args[1].startsWith('--')) {
    const tag = flag('tag')
    const title = flag('title')
    const before = flag('before')
    const route = flag('route')
    const build = flag('build')
    const names = flag('names')?.split(',').map(n => n.trim())
    if (readTake(args[0]).take.repro && !route) {
      printReview({ fails: ['a bug clip names the page it films; pass --route <path>, and --build <commit> when you know the build'], fixes: [], suggests: [] })
      process.exit(1)
    }
    const bar = route ? { tag: 'chromium', title: build ? `${route} · ${build}` : route } : tag && title ? { tag, title } : undefined
    const opts = { bar, names: names?.length === 2 ? (names as [string, string]) : undefined }
    const barFails = checkBar(readTake(args[0]).take, opts.bar)
    if (barFails.length) {
      printReview({ fails: barFails, fixes: [], suggests: [] })
      process.exit(1)
    }
    const review = before ? await renderCompare(before, args[0], args[1], opts) : await renderTake(args[0], args[1], opts)
    printReview(review)
    process.exit(review.fails.length ? 1 : 0)
  } else if (cmd === 'pair' && args[0] && args[1] && args[2] && !args[2].startsWith('--')) {
    const tag = flag('tag')
    const title = flag('title')
    const review = await renderPair([args[0], args[1]], args[2], { bar: tag && title ? { tag, title } : undefined, scale: Number(flag('scale') ?? 1) })
    printReview({ ...review, stills: review.fails.length ? [] : [args[2]] })
    process.exit(review.fails.length ? 1 : 0)
  } else {
    console.error('usage: bun scripts/clip.ts review <take dir> | render <take dir> <out.mp4> [--before <take dir>] [--tag <tag> --title <title>] [--route <path> [--build <commit>] [--names <reference>,<beta>]] | pair <before.png> <after.png> <out.png> [--scale <n>] [--tag <tag> --title <title>]')
    process.exit(2)
  }
}
