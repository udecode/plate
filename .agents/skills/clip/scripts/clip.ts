import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { chromium, type Browser, type BrowserContext, type CDPSession, type Locator, type Page } from 'playwright-core'

const ASSETS = `${import.meta.dir}/../assets`

/** The page size a clip films, in CSS pixels, and how many video pixels each one takes. */
export type View = { width: number; height: number; scale: number }
export type Modifier = 'Alt' | 'Control' | 'Meta' | 'Shift'
// CDP's Input.dispatchMouseEvent modifiers bit field.
const MODIFIER_BITS: Record<Modifier, number> = { Alt: 1, Control: 2, Meta: 4, Shift: 8 }

const BAR_PX = 80
const FOOT_PX = 76
// X documents 16:9, 1:1, 4:5, 2:3 and 9:16 video. A clip with its bars is 2:3 (the owner, 2026-11-21).
const X_RATIO = { clip: 3 / 2 }
const x: View = { width: 540, height: 540 * X_RATIO.clip - BAR_PX - FOOT_PX, scale: 2 }
// X's phone feed shows a clip about 312 pt wide (an iPhone's 393 pt less the avatar column and margins, estimated, not measured).
const feedPt = 312
const titleMinPt = 14

export const CLIP = {
  fps: 60,
  wide: { width: 1100, height: 720, scale: 1 } as View,
  x,
  // A bug clip for an issue films the window the bug shows in, at 2× pixels, since a fixer watches it on a desktop (the owner, 2026-11-22).
  repro: { width: 760, height: 560, scale: 2 } as View,
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

// The replay's room at the page's edges and between its two copies, in CSS px, and how many frames the after take takes to shrink into its copy.
const REPLAY = { marginPx: 12, gapPx: 8, outline: '0xd4d4d4', moveFrames: 24 }

/** Each rule the checks below enforce, as the clips skill lists it. */
export const RULES: { rule: string; check: string }[] = [
  { rule: `Film and render at ${CLIP.fps} fps, and keep each filmed frame once and in order under the bars, captions and tabs.`, check: 'reviewFile, renderClip' },
  { rule: `A clip runs at most ${CLIP.maxSeconds} s and ${CLIP.maxMB} MB. An X clip aims for ${CLIP.xSeconds} s or less.`, check: 'reviewTake, reviewFile' },
  { rule: `The first caption shows within ${CLIP.firstBeatS} s, so the clip opens on the action.`, check: 'reviewTake' },
  { rule: `Each caption stays up at least ${CLIP.beatMinS} s.`, check: 'reviewTake' },
  { rule: `Nothing on screen sits still for more than ${CLIP.stillMaxS} s, or ${CLIP.endHoldS} s at the end. Render cuts the extra still frames on its own, but never takes a caption under ${CLIP.beatMinS} s and never cuts a hold the scene marks with \`read(ms)\`.`, check: 'squeezePlan, renderTake' },
  { rule: 'A caption is white text on a black footer under the clip, so it never reads as page text. Keys show as white keycaps in it.', check: 'captionHtml, renderClip' },
  { rule: `A caption is a short sentence of at most ${CLIP.captionWords} words with no closing period. It starts with a capital, unless it starts with a [Key]. It speaks to a viewer on a Mac in Chrome, in Mac keys, and names no platform or browser (the owner, 2026-11-23). Render fixes the capital and the period on its own.`, check: 'checkCaption, fixCaption' },
  { rule: 'A caption switches on as its action starts and off as the next one starts, with no fade.', check: 'captionOverlay' },
  { rule: `The drawn cursor shrinks toward its tip and fades out over ${CLIP.cursorFadeS} s once it has rested ${CLIP.cursorIdleS} s with no button down, and grows back as it moves, so a scene never moves it off the result. A cursor \`place\` parks stays hidden until it first moves.`, check: 'drawCursor, Clip' },
  { rule: `While a button is down, the drawn cursor stays within ${CLIP.heldLagPx} px of the pointer and never turns back on its own.`, check: 'checkTrail' },
  { rule: `The drawn cursor jumps at most ${CLIP.pressJumpPx} px at a press, and turns back at most ${CLIP.freeFlips} times on free moves.`, check: 'checkTrail' },
  { rule: `While a button is down, the pointer moves every frame, at most ${CLIP.heldGapMs} ms apart at the 90th percentile, so a stroke grows smoothly.`, check: 'checkTrail' },
  { rule: `A title bar holds a one-word lowercase tag and a lowercase title of at most ${CLIP.titleWords} words, on one line at ${CLIP.titlePx.max} px, shrunk as far as the line needs to fit. Under ${CLIP.titlePx.min} px, a phone shows it under ${titleMinPt} pt, so render suggests a shorter title.`, check: 'checkTitle, renderClip, renderTake' },
  { rule: 'A crop has even sides inside the viewport. Render rounds and clamps it on its own.', check: 'fitCrop' },
  {
    rule: `A clip films X's shape, a page ${CLIP.x.width} by ${CLIP.x.height} px at ${CLIP.x.scale}× pixels, so with its ${BAR_PX} px title bar and ${FOOT_PX} px caption footer the clip is 2:3, unless it opens with \`{ shape: 'wide' }\`. Its page text shows at ${CLIP.phoneTextPt} pt or more in a phone's feed, which shows a clip about ${CLIP.feedPt} pt wide.`,
    check: 'openClip, reviewTake',
  },
  { rule: 'Render refuses an X-shape clip without a title bar, so the clip a team chat gets is the one X can post.', check: 'checkBar' },
  {
    rule: `A change to how something a reader already saw behaves shows as one clip made from a take before the change and a take after it, which film the same shape and crop and caption the same beats. The clip plays the before take whole under a red BEFORE tab, then the after take whole under a green AFTER tab, each tab small and centered on the line under the title bar. Then the after page cuts to its first frame and shrinks into its copy over ${REPLAY.moveFrames} frames while the before copy slides in beside it, and both replay in rows, before above after, or in columns, before left of after, whichever shows them larger, rows on a tie, each tab on its copy's top edge, both playing each step at the same moment, so the reader sees each take at full size and then compares them line by line. Every clip edits this way, whatever the change. The replay trims the page margin that both takes leave blank in every frame, keeps ${CLIP.comparePadPx} px of page around what is left, and zooms both copies as far as the page allows but never past their own size, on the page's own color with a 1 px outline, above the caption footer. Each take holds its result ${CLIP.compareEndS} s at most, unless the scene marks a longer \`read(ms)\`, and the replay ends holding both results for ${CLIP.compareHoldS} s. Render refuses two takes that end every step the same, and the whole clip keeps the length and size limits.`,
    check: 'checkPair, renderCompare, alignBeats, pageColor, contentBox, replayLayout, renderMove, renderReplay, squeezePlan',
  },
  {
    rule: `A bug clip for an issue films with \`{ shape: 'repro' }\`, a ${CLIP.repro.width} by ${CLIP.repro.height} px window at ${CLIP.repro.scale}× pixels unless \`size\` names the window the bug needs. Render keeps its real time and cuts nothing, because a pause can be the bug. Its bar names the browser, the route and the build instead of a title. It ends holding the wrong state at least ${CLIP.reproHoldS} s, and runs at most ${CLIP.reproMaxSeconds} s and ${CLIP.reproMaxMB} MB. A bug with a reference page shows as the before-and-after clip of a take on the reference page and a take on beta, each tab naming its site, the reference gray and beta red.`,
    check: 'openClip, reviewTake, pageClip, renderClip, renderCompare',
  },
  {
    rule: 'A change to how something looks at rest, such as copy or a style, shows as one image, the still before the change stacked above the still after it, both cropped to the area where they differ, each under its own badge. It refuses two stills of different sizes or two that show the same thing.',
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

  /** Moves along `at(p)` as p goes from 0 to 1 over `ms` of wall clock, however long Chrome takes to handle each move. */
  async over(ms: number, at: (p: number) => readonly [number, number]) {
    const began = performance.now()
    const sent: Promise<unknown>[] = []
    for (let k = 1; ; k++) {
      const p = Math.min(1, (performance.now() - began) / ms)
      const [x, y] = at(p)
      this.pos = { x, y }
      sent.push(this.mouse('mouseMoved'))
      if (p >= 1) break
      await Bun.sleep(Math.max(0, began + k * (1000 / CLIP.fps) - performance.now()))
    }
    await Promise.all(sent)
  }

  /** A hand's move to (x, y), in Fitts' law time on a minimum-jerk curve that bows a little. The cursor's spring adds the landing. */
  async glide(x: number, y: number, { ms, bow = true }: { ms?: number; bow?: boolean } = {}) {
    const from = { ...this.pos }
    const d = Math.hypot(x - from.x, y - from.y)
    const arc = bow ? Math.min(24, d * 0.06) : 0
    const [nx, ny] = [-(y - from.y) / (d || 1), (x - from.x) / (d || 1)]
    await this.over(ms ?? fitts(d), p => {
      const t = minimumJerk(p)
      const off = Math.sin(Math.PI * p) * arc
      return [from.x + (x - from.x) * t + nx * off, from.y + (y - from.y) * t + ny * off]
    })
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

export async function openClip(
  url: string,
  {
    cursor = true,
    colorScheme = 'light',
    // One demo serves the team chat and X, so X's shape is the default (owner, 2026-11-20).
    shape = 'x',
    size,
    storageState,
  }: { cursor?: boolean; colorScheme?: 'light' | 'dark'; shape?: 'wide' | 'x' | 'repro'; size?: { width: number; height: number }; storageState?: string } = {},
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

/** An X-shape clip may go out on X alone, where the title bar is its headline. */
export function checkBar(take: Take, bar?: Bar): string[] {
  return isX(take) && !bar ? ['an X-shape clip needs a title bar; render it with --tag <tag> --title "<title>"'] : []
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
export function captionOverlay(w: { from: number; to: number }, base: string, img: string, out: string, foot = FOOT_PX): string {
  // Each edge sits half a frame early, so a caption switches on at its own frame and not one late.
  const f = (n: number) => (n - 0.5 / CLIP.fps).toFixed(4)
  return `[${base}][${img}]overlay=x=(W-w)/2:y=H-${foot}+(${foot}-h)/2:enable='gte(t,${f(w.from)})*lt(t,${f(w.to)})'[${out}]`
}

const esc = (s: string) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)

const KEYCAP = 'display:inline-block;min-width:1.4em;text-align:center;padding:3px 9px 2px;background:#fff;color:#0a0a0a;border:1px solid #d4d4d4;border-bottom-width:3px;border-radius:7px'

// A caption in the page's own colors read as page text and got missed, and the owner picked a black footer over a black pill (2026-11-19).
const FOOT_BG = '#0a0a0a'
const CAPTION = 'display:inline-flex;align-items:center;gap:8px;font:700 26px/1 Inter;color:#fff;padding:2px'
// A footer label was easy to miss, so each side shows as a badge (the owner, 2026-11-20), red before and green after, the way a diff marks removed and added lines (the owner, 2026-11-22).
const SIDES = ['Before', 'After'] as const
const BADGE: Record<(typeof SIDES)[number], string> = { Before: 'background:#ef4444;color:#fff', After: 'background:#16a34a;color:#fff' }
// A bug clip plays the reference page, which works, then beta, which shows the bug, so the reference is neutral and beta is red.
const REFERENCE_BADGE: Record<(typeof SIDES)[number], string> = { Before: 'background:#525252;color:#fff', After: 'background:#ef4444;color:#fff' }
const badgeStyle = (side: Side, px: number) =>
  `flex:none;align-self:center;font:700 ${px}px/1 Inter;letter-spacing:0.06em;text-transform:uppercase;padding:0.45em 0.8em 0.4em;border-radius:999px;box-shadow:0 1px 3px rgba(0,0,0,0.25);${BADGE[side]}`

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

const barHtml = (bar: Bar, width: number) =>
  `<div id="bar" style="width:${width}px;height:${BAR_PX}px;box-sizing:border-box;padding:2px 40px 0;background:#fafafa;border-bottom:1px solid #e5e5e5;font:600 ${CLIP.titlePx.max}px/1.1 Cal;color:#0a0a0a;white-space:nowrap;overflow:hidden;display:flex;align-items:center;gap:0.3em"><span style="flex:none;color:#a3a3a3">${esc(bar.tag)} /</span><span style="flex:none">${esc(bar.title)}</span></div>`

/** Shrinks the page's title bar until its line fits, and returns the size it fits at. */
const fitTitle = (page: Page) =>
  page.evaluate(async max => {
    await document.fonts.ready
    const el = document.getElementById('bar')!
    let size = max
    while (size > 1 && el.scrollWidth > el.clientWidth) el.style.fontSize = `${--size}px`
    return size
  }, CLIP.titlePx.max)

/** An image laid over a rendered clip from frame `from` until frame `to`, at `x` and `y` video px from the page's top left corner, written as ffmpeg overlay expressions, so they may use the image's `w` and `h` and the clip's time `t`. It fades in over its first `fadeFrames`. */
export type Mark = { file: string; x: string; y: string; from: number; to: number; fadeFrames?: number }

/** Stacks an optional title bar above the clip and a caption bar below it, lays each mark over the result, and encodes at 60 fps. Bars draw at the clip's `scale`, so they keep their size beside the page. Returns the title's size after it shrank to fit. */
export async function renderClip(
  clip: string,
  out: string,
  { bar, captions = [], scale = 1, marks = [], route = false }: { bar?: Bar; captions?: Beat[]; scale?: number; marks?: Mark[]; route?: boolean } = {},
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
  const foot = windows.length > 0
  try {
    const browser = await chromium.launch()
    try {
      const page = await browser.newPage({ deviceScaleFactor: scale })
      const style = fontStyle()
      if (foot) {
        await page.setContent(`${style}<div id="foot" style="width:${width}px;height:${FOOT_PX}px;background:${FOOT_BG}"></div>`)
        await page.locator('#foot').screenshot({ path: join(dir, 'foot.png') })
        for (const [i, w] of windows.entries()) {
          await page.setContent(`${style}<div id="keys" style="${CAPTION}">${captionHtml(w.text)}</div>`)
          await page.evaluate(() => document.fonts.ready)
          await page.locator('#keys').screenshot({ path: join(dir, `keys-${i}.png`), omitBackground: true })
        }
      }
      if (bar) {
        await page.setContent(`${style}${barHtml(bar, width)}`)
        titlePx = await fitTitle(page)
        await page.locator('#bar').screenshot({ path: join(dir, 'bar.png') })
      }
    } finally {
      await browser.close()
    }
    const layers = [bar && join(dir, 'bar.png'), clip, foot && join(dir, 'foot.png')].filter((f): f is string => !!f)
    // Every looped image runs at the page's 60 fps, because one at ffmpeg's default 25 fps adds frames that `-r` then drops or repeats.
    const loop = (f: string) => ['-loop', '1', '-framerate', String(CLIP.fps), '-i', f]
    const inputs = layers.flatMap(f => (f === clip ? ['-i', f] : loop(f)))
    let graph = layers.length > 1 ? `${layers.map((_, i) => `[${i}:v]`).join('')}vstack=inputs=${layers.length}:shortest=1[v0]` : '[0:v]null[v0]'
    windows.forEach((w, i) => {
      inputs.push(...loop(join(dir, `keys-${i}.png`)))
      graph += `;${captionOverlay(w, `v${i}`, `${layers.length + i}:v`, `v${i + 1}`, FOOT_PX * scale)}`
    })
    const top = bar ? BAR_PX * scale : 0
    // A window edge sits half a frame before its frame, so a mark never shows a frame early or late.
    const at = (frame: number) => ((frame - 0.5) / CLIP.fps).toFixed(4)
    marks.forEach((m, j) => {
      inputs.push(...loop(m.file))
      const fade = m.fadeFrames ? `,fade=t=in:st=${(m.from / CLIP.fps).toFixed(4)}:d=${(m.fadeFrames / CLIP.fps).toFixed(4)}:alpha=1` : ''
      const [from, to] = [`v${windows.length + j}`, `v${windows.length + j + 1}`]
      graph += `;[${layers.length + windows.length + j}:v]format=rgba${fade}[m${j}];[${from}][m${j}]overlay=x='${m.x}':y='${top}+(${m.y})':eval=frame:enable='between(t,${at(m.from)},${at(m.to)})'[${to}]`
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

const STACK_GAP = 2
const BADGE_INSET = 10
const GAP_BG = '#e5e5e5'
const PAGE_BG = '#f5f5f5'

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

// A tab names a take, sitting on top of the line above it. It stays small because its color carries the meaning (the owner, 2026-11-22).
const TAB_PX = 10

/** Where the replay puts two copies of a page's `trim` area on a `width`×`height` page, in CSS px, each zoomed as far as the page allows but never past its own size, with room above each copy that has none above it for its tab, `tabH` tall. Rows put before above after, columns put before left of after. Returns the arrangement that shows the copies larger, rows on a tie, with its zoom, each copy's size, and each copy's left edge and top. */
export function replayLayout(trim: Box, width: number, height: number, tabH: number) {
  const { marginPx: m, gapPx: g } = REPLAY
  // A tall crop in rows left each copy under half the frame, so a menu or a list showed as a thumbnail (the owner, 2026-11-23).
  const rows = Math.min(1, (width - 2 * m) / trim.w, (height - m - g - tabH) / 2 / trim.h)
  const columns = Math.min(1, (width - 2 * m - g) / 2 / trim.w, (height - m - tabH) / trim.h)
  const across = columns > rows
  const k = across ? columns : rows
  const panel = { w: trim.w * k, h: trim.h * k }
  if (across) {
    const [left, top] = [(width - 2 * panel.w - g) / 2, tabH + (height - m - tabH - panel.h) / 2]
    return { k, panel, across, x: [left, left + panel.w + g] as [number, number], y: [top, top] as [number, number] }
  }
  const top = (height - m - 2 * panel.h - g - tabH) / 2
  const x = (width - panel.w) / 2
  return { k, panel, across, x: [x, x] as [number, number], y: [top, top + panel.h + g + tabH] as [number, number] }
}

/** Renders a BEFORE and an AFTER tab at `scale` pixels per CSS px into `dir`, and returns each file with its height in video px. */
async function tabs(dir: string, scale: number, names?: [string, string]): Promise<Record<Side, { file: string; h: number }>> {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ deviceScaleFactor: scale })
    const out = {} as Record<Side, { file: string; h: number }>
    for (const side of SIDES) {
      await page.setContent(
        `${fontStyle()}<span id="t" style="display:inline-block;font:700 ${TAB_PX}px/1 Inter;letter-spacing:0.08em;text-transform:uppercase;padding:4px 8px 3px;border-radius:5px 5px 0 0;${names ? REFERENCE_BADGE[side] : BADGE[side]}">${esc(names ? names[SIDES.indexOf(side)] : side)}</span>`,
      )
      await page.evaluate(() => document.fonts.ready)
      const file = join(dir, `${side}.png`)
      await page.locator('#t').screenshot({ path: file, omitBackground: true })
      out[side] = { file, h: Math.round((await page.locator('#t').boundingBox())!.height * scale) }
    }
    return out
  } finally {
    await browser.close()
  }
}

const ease = (p: number) => p * p * (3 - 2 * p)
const lerp = (a: number, b: number, p: number) => a + (b - a) * p
const even = (v: number) => 2 * Math.round(v / 2)

/** Where the replay puts each copy, in video px of a `width`×`height` page: the crop of the page it shows, each copy's size, each copy's left edge and top, and the outline's width. */
export type ReplayPx = { crop: Box; w: number; h: number; x: [number, number]; y: [number, number]; line: number }

/** Writes the frames in which the after take's first frame shrinks from the whole page into its copy while the before copy slides in from above or from the left into its own, so the reader sees that the replay shows the same page beside its pair. The two never overlap, because the before copy keeps its place beside the after one. Returns the frames' file pattern. */
function renderMove(firsts: [before: string, after: string], at: ReplayPx, [width, height]: [number, number], background: string, dir: string): string {
  const { crop, line } = at
  for (let i = 0; i < REPLAY.moveFrames; i++) {
    const p = ease((i + 1) / REPLAY.moveFrames)
    const zoom = lerp(1, at.w / crop.w, p)
    const [cw, ch, cx, cy] = [even(lerp(width, crop.w, p)), even(lerp(height, crop.h, p)), even(lerp(0, crop.x, p)), even(lerp(0, crop.y, p))]
    const [dx, dy] = [even(lerp(0, at.x[1], p)), even(lerp(0, at.y[1], p))]
    const graph = [
      `color=c=${background}:s=${width}x${height}[pg]`,
      `[0:v]crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=${at.w}:${at.h}:flags=lanczos,pad=${at.w + 2 * line}:${at.h + 2 * line}:${line}:${line}:color=${REPLAY.outline}[bef]`,
      `[pg][bef]overlay=x=${at.x[0] - (at.x[1] - dx) - line}:y=${at.y[0] - (at.y[1] - dy) - line}[up]`,
      `[1:v]crop=${cw}:${ch}:${cx}:${cy},scale=${even(cw * zoom)}:${even(ch * zoom)}:flags=lanczos[aft]`,
      `[up][aft]overlay=x=${dx}:y=${dy}`,
    ].join(';')
    const png = join(dir, `move-${String(i).padStart(3, '0')}.png`)
    const r = Bun.spawnSync(['ffmpeg', '-v', 'error', '-y', '-i', firsts[0], '-i', firsts[1], '-filter_complex', graph, '-frames:v', '1', png], { stderr: 'pipe' })
    if (r.exitCode) throw new Error(`ffmpeg exited ${r.exitCode}: ${r.stderr.toString().trim().slice(0, 300)}`)
  }
  return join(dir, 'move-%03d.png')
}

/** Plays the before take whole, the after take whole, the after take shrinking into its copy, then both copies stacked as `plan` lines them up, each cropped to `trim` and zoomed as `replayLayout` says, on the page's own `background`, into one page clip. Returns where the copies sit, in video px. */
async function renderReplay(
  clips: [string, string],
  plan: Span[][],
  trim: Box,
  { width, height, scale, background, frames, tabH }: { width: number; height: number; scale: number; background: string; frames: number; tabH: number },
  out: string,
): Promise<ReplayPx & { k: number; across: boolean }> {
  const px = (v: number) => 2 * Math.round((v * scale) / 2)
  const layout = replayLayout(trim, width, height, tabH / scale)
  const crop = { w: px(trim.w), h: px(trim.h), x: 0, y: 0 }
  ;[crop.x, crop.y] = [Math.min(px(trim.x), px(width) - crop.w), Math.min(px(trim.y), px(height) - crop.h)]
  const at: ReplayPx = { crop, w: px(layout.panel.w), h: px(layout.panel.h), x: [px(layout.x[0]), px(layout.x[1])], y: [px(layout.y[0]), px(layout.y[1])], line: Math.max(1, Math.round(scale)) }
  const dir = mkdtempSync(join(tmpdir(), 'clip-replay-'))
  try {
    const firsts = clips.map((clip, i) => {
      const png = join(dir, `first-${i}.png`)
      Bun.spawnSync(['ffmpeg', '-v', 'error', '-y', '-i', clip, '-frames:v', '1', png])
      return png
    }) as [string, string]
    const move = renderMove(firsts, at, [px(width), px(height)], background, dir)
    const { crop: c, line } = at
    const renumber = `setpts=N/(${CLIP.fps}*TB)`
    const graph = [
      '[0:v]split=2[f0][r0]',
      '[1:v]split=2[f1][r1]',
      // Each part counts its frames from 0, because a take's cut can start a frame late and concat would fill that gap with a repeated frame.
      `[f0]${renumber},setsar=1,format=yuv420p[full0]`,
      `[f1]${renumber},setsar=1,format=yuv420p[full1]`,
      `[2:v]${renumber},setsar=1,format=yuv420p[move]`,
      ...clips.map((_, i) => `${spanGraph(`r${i}`, plan[i], `s${i}`)};[s${i}]crop=${c.w}:${c.h}:${c.x}:${c.y},scale=${at.w}:${at.h}:flags=lanczos,setsar=1,pad=${at.w + 2 * line}:${at.h + 2 * line}:${line}:${line}:color=${REPLAY.outline}[p${i}]`),
      // A rounded duration can give the background one frame more than the replay holds, so it stops at a frame count.
      `color=c=${background}:s=${px(width)}x${px(height)}:r=${CLIP.fps},trim=end_frame=${frames}[bg]`,
      `[bg][p0]overlay=x=${at.x[0] - line}:y=${at.y[0] - line}:shortest=1[b1]`,
      `[b1][p1]overlay=x=${at.x[1] - line}:y=${at.y[1] - line}:shortest=1,setsar=1,format=yuv420p,${renumber}[rep]`,
      '[full0][full1][move][rep]concat=n=4:v=1:a=0[v]',
    ].join(';')
    const inputs = ['-i', clips[0], '-i', clips[1], '-framerate', String(CLIP.fps), '-i', move]
    await run(['ffmpeg', '-v', 'error', '-y', ...inputs, '-filter_complex', graph, '-map', '[v]', '-c:v', 'libx264', '-crf', '16', '-r', String(CLIP.fps), out])
    return { ...at, k: layout.k, across: layout.across }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const pageSize = async (clip: string, scale: number) =>
  (await run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', clip])).trim().split(',').map(n => Number(n) / scale)

const frameCount = async (clip: string) =>
  Number((await run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', clip])).trim())

/** Stacks the still before a change above the still after it, both cropped to the area where they differ, each with its badge, under an optional title bar, as one PNG. `scale` is how many image pixels each CSS px takes, so the badges and the bar keep their size beside the page. Returns its review. */
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
  // A still has no clock to save, so each badge gets its own strip above its panel instead of covering the page.
  const panel = (side: Side, i: number) =>
    `<div style="${i ? `margin-top:${STACK_GAP}px;` : ''}padding:${BADGE_INSET}px;background:${PAGE_BG};display:flex"><span style="${badgeStyle(side, 15)}">${side}</span></div><div style="position:relative;overflow:hidden;width:${c.w}px;height:${c.h}px"><img src="${src[i]}" style="position:absolute;left:${-c.x}px;top:${-c.y}px;width:${width}px;height:${height}px;max-width:none"></div>`
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ deviceScaleFactor: scale })
    await page.setContent(`${fontStyle()}<div id="stage" style="width:${c.w}px;background:${GAP_BG}">${bar ? barHtml(bar, c.w) : ''}${SIDES.map(panel).join('')}</div>`)
    await page.evaluate(() => document.fonts.ready)
    if (bar) {
      checkTitle(bar.tag, bar.title)
      const titlePx = await fitTitle(page)
      if (titlePx < CLIP.titlePx.min) review.suggests.push(`the title bar shrank to ${titlePx} px to fit one line; shorten the title`)
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
  const { titlePx } = await renderClip(page.clip, out, { bar: opts.bar, captions: page.captions, scale: take.view?.scale, route: take.repro })
  if (!take.repro) review.suggests.push(...shortTitle(titlePx))
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
  // A wipe, a stack cropped to the change and cards each fit one kind of change and read as a puzzle, so every clip plays each take whole and then replays both with whole pages, the same edit for any change. Two copies side by side left half a phone's tall frame empty for most crops, so they stack unless the crop is tall enough that columns show it larger (the owner, 2026-11-22).
  const aligned = alignBeats(beats, frames, Math.round((CLIP.compareHoldS - CLIP.compareEndS) * CLIP.fps))
  const color = pageColor(sampled[1].frames[0], w, h)
  const trim = padBox(contentBox([...sampled[0].frames, ...sampled[1].frames], w, h, color), [width / w, height / h], width, height)
  const page = join(after, 'compare.mp4')
  let captions: Beat[] = []
  let titlePx: number | undefined
  const dir = mkdtempSync(join(tmpdir(), 'clip-tabs-'))
  try {
    const tab = await tabs(dir, scale, take.repro ? (opts.names ?? ['reference', 'beta']) : undefined)
    const at = await renderReplay(clips, aligned.plan, trim, { width, height, scale, background: `0x${color.toString(16).padStart(6, '0')}`, frames: aligned.frames, tabH: Math.max(tab.Before.h, tab.After.h) }, page)
    const [moved, end] = [frames[0] + frames[1] + REPLAY.moveFrames, frames[0] + frames[1] + REPLAY.moveFrames + aligned.frames]
    const rendered = await frameCount(page)
    if (rendered !== end) throw new Error(`the page clip has ${rendered} frames, not the ${end} its tabs and captions expect`)
    const text = take.textPx && !take.repro ? `, page text at ${phonePt(take.textPx * at.k, width)} pt on a phone` : ''
    review.fixes.push(`played the before take, the after take, then both in ${at.across ? 'columns' : 'rows'} at ${tenth(at.k)}× size${text}`)
    // The after take's tab rides its page's top edge as the page shrinks into its copy, on the same easing as the frames renderMove writes.
    const u = `clip((t-${((frames[0] + frames[1] - 1) / CLIP.fps).toFixed(4)})/${(REPLAY.moveFrames / CLIP.fps).toFixed(4)},0,1)`
    const center = '(W-w)/2'
    // The after tab's center rides from the page's center to its copy's, on the same easing.
    const afterX = `(W/2+(${at.x[1] + at.w / 2}-W/2)*${u}*${u}*(3-2*${u}))-w/2`
    const marks: Mark[] = [
      { file: tab.Before.file, x: center, y: '-h', from: 0, to: frames[0] },
      { file: tab.After.file, x: center, y: '-h', from: frames[0], to: frames[0] + frames[1] },
      { file: tab.After.file, x: afterX, y: `${at.y[1] - at.line}*${u}*${u}*(3-2*${u})-h`, from: frames[0] + frames[1], to: end },
      { file: tab.Before.file, x: `${at.x[0] + at.w / 2}-w/2`, y: `${Math.max(0, at.y[0] - at.line)}-h`, from: frames[0] + frames[1], to: end, fadeFrames: REPLAY.moveFrames },
    ]
    // Each part's first caption starts on the part's first frame, so a take's last caption never plays over the next part.
    const part = (b: number[], at: number, first: number) => b.map((f, i) => (i ? f + at : first))
    const starts = [...part(beats[0], 0, 0), ...part(beats[1], frames[0], frames[0]), ...part(aligned.starts, moved, frames[0] + frames[1])]
    captions = starts.map((f, i) => ({ t: f / CLIP.fps, text: texts[i % texts.length] }))
    titlePx = (await renderClip(page, out, { bar: opts.bar, captions, scale, marks, route: take.repro })).titlePx
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  if (!take.repro) review.suggests.push(...shortTitle(titlePx))
  review.fails.push(...(await reviewFile(out, take.repro ? CLIP.reproMaxMB : CLIP.maxMB)))
  const seconds = await durationOf(out)
  const max = take.repro ? CLIP.reproMaxSeconds : CLIP.maxSeconds
  if (seconds > max + 0.05) review.fails.push(`${out} runs ${tenth(seconds)} s, over ${max} s; shorten either take`)
  return { ...review, stills: await stills(out, captions, join(after, 'stills-compare')), signals: await clipSignals(pages[1].clip, take) }
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
