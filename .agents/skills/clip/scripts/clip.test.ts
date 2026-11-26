import { describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  captionHtml,
  captionOverlay,
  captionWindows,
  changedBox,
  changedPct,
  checkBar,
  checkCaption,
  checkPair,
  checkTitle,
  checkTrail,
  CLIP,
  CLIP_CONFIG,
  projectShape,
  renderClip,
  alignBeats,
  renderPair,
  contentBox,
  padBox,
  pageColor,
  pairLayout,
  cardLayout,
  reproLayout,
  fitCrop,
  openClip,
  fixCaption,
  reviewTake,
  shiftBeats,
  squeezePlan,
  stillRuns,
  stroke,
  type Take,
  type TrailRow,
} from './clip.ts'

const trail = (n: number, at: (i: number) => [number, number, number, number, number]): TrailRow[] =>
  Array.from({ length: n }, (_, i) => [i * (1000 / 60), ...at(i)] as TrailRow)

const take = (captions: Take['captions'], seconds = 10): Take => ({ video: 'clip.webm', startMs: 200, endMs: 200 + seconds * 1000, trailFrom: 0, captions, view: CLIP.x, textPx: 16 })

describe('the cursor trail', () => {
  test('passes a cursor glued to the pointer while held and settling on free moves', () => {
    const t = trail(120, i => (i < 60 ? [0, i * 2 - (i < 50 ? 3 : 0), 0, i * 2, 0] : [1, i * 2, 0, i * 2, 0]))
    expect(checkTrail(t).problems).toEqual([])
  })

  test('fails a spring that diverges while a button is down', () => {
    const t = trail(60, i => [1, i * 3 + (i % 2 ? 9 : -9), 0, i * 3, 0])
    const { problems } = checkTrail(t)
    expect(problems.some(p => p.includes('turned back on its own'))).toBe(true)
    expect(problems.some(p => p.includes('left the pointer'))).toBe(true)
  })

  test('fails a jump at a press', () => {
    const t = trail(20, i => (i < 10 ? [0, 100, 0, 140, 0] : [1, 140, 0, 140, 0]))
    expect(checkTrail(t).problems).toEqual([expect.stringContaining('jumped 40 px at a press')])
  })

  test('fails pointer moves that arrive in uneven jumps while a button is down', () => {
    const t = trail(90, i => [1, Math.floor(i / 3) * 6, 0, Math.floor(i / 3) * 6, 0])
    expect(checkTrail(t).problems).toEqual([expect.stringContaining('50 ms apart')])
  })

  test('skips the setup before filming', () => {
    const t = trail(20, i => (i < 10 ? [0, 100, 0, 140, 0] : [1, 140, 0, 140, 0]))
    expect(checkTrail(t, t[9][0] + 1).problems).toEqual([])
  })
})

describe('a take', () => {
  test('passes the debut pace', () => {
    const r = reviewTake(take([{ t: 0.45, text: 'Draw a note' }, { t: 4.9, text: 'Add a shape' }, { t: 8.2, text: 'Connect them' }, { t: 11, text: 'Sketch with the pen' }], 14.6), [], { x: true })
    expect(r).toEqual({ fails: [], fixes: [], suggests: [] })
  })

  test('fixes a lowercase caption and a closing period on its own', () => {
    const r = reviewTake(take([{ t: 0.4, text: 'draw a note.' }]), [])
    expect(r.fixes).toEqual(['caption "draw a note." renders as "Draw a note"'])
    expect(r.fails).toEqual([])
  })

  test('fails a beat too short to read and a clip too long for a chat upload', () => {
    const r = reviewTake(take([{ t: 0.4, text: 'Draw a note' }, { t: 1, text: 'Add a shape' }], 21), [])
    expect(r.fails).toEqual([expect.stringContaining('runs 21.2 s'), expect.stringContaining('"Draw a note" shows for 0.6 s')])
  })

  test('lets a bug clip run past a chat clip, but fails one that does not hold the wrong state', () => {
    const repro = (captions: Take['captions'], seconds: number): Take => ({ ...take(captions, seconds), view: CLIP.repro, repro: true })
    expect(reviewTake(repro([{ t: 0.4, text: 'Type check' }, { t: 27, text: 'Only ch keeps the mark' }], 30), []).fails).toEqual([])
    expect(reviewTake(repro([{ t: 0.4, text: 'Type check' }, { t: 28.5, text: 'Only ch keeps the mark' }], 30), []).fails).toEqual([expect.stringContaining('read(2000)')])
    expect(reviewTake(repro([{ t: 0.4, text: 'Type check' }, { t: 60, text: 'Only ch keeps the mark' }], 63), []).fails).toEqual([expect.stringContaining('over 60 s')])
  })

  test('cuts a long still stretch down, splitting it where a caption starts', () => {
    // The popover clip: the popover sat open for 2.2 s, across the start of the next caption at 3.1 s.
    expect(squeezePlan([[1.1, 3.3]], [0.2, 3.1, 5.9], 9)).toEqual([[1.5, 3.1]])
  })

  test('keeps each caption up long enough to read', () => {
    expect(squeezePlan([[0.3, 1.5]], [0.2, 1.5], 4)).toEqual([[1.4, 1.5]])
  })

  test('holds the last frame a little longer than a still in the middle', () => {
    expect(squeezePlan([[7.5, 10]], [0.2, 4], 10)).toEqual([[8.1, 10]])
    expect(squeezePlan([[2, 2.3]], [0.2], 6)).toEqual([])
  })

  test('ends each take of a before-and-after clip sooner, since the clip then holds both results', () => {
    expect(squeezePlan([[7.5, 10]], [0.2, 4], 10, [], CLIP.compareEndS)).toEqual([[7.9, 10]])
  })

  test('keeps a read hold whole, such as a toast at the end', () => {
    // The table clip's refusal toast lost 2.4 s of reading time to the end hold before read() existed.
    expect(squeezePlan([[11.4, 14]], [0.2, 9], 14, [[11.4, 13.4]])).toEqual([[13.4, 14]])
    expect(squeezePlan([[11.4, 14]], [0.2, 9], 14)).toEqual([[12, 14]])
  })

  test('moves later captions back by the time cut before them', () => {
    expect(shiftBeats([{ t: 0.2, text: 'A' }, { t: 3.1, text: 'B' }, { t: 5.9, text: 'C' }], [[1.8, 3.1], [5, 5.5]])).toEqual([
      { t: 0.2, text: 'A' },
      { t: 1.8, text: 'B' },
      { t: 4.1, text: 'C' },
    ])
  })

  test('judges the length after the still cut, and each caption on the filmed clock', () => {
    const r = reviewTake(take([{ t: 0.4, text: 'Draw a note' }, { t: 15, text: 'Connect them' }], 17), [], { x: true, cutS: 4 })
    expect(r).toEqual({ fails: [], fixes: [], suggests: [] })
  })

  test('fails an X clip whose page text is too small to read on a phone', () => {
    const wide = { ...take([{ t: 0.4, text: 'Delete the whole table' }]), view: CLIP.wide, crop: { x: 0, y: 0, w: 1100, h: 720 } }
    expect(reviewTake(wide, [], { x: true }).fails).toEqual([expect.stringContaining('shows at 4.5 pt')])
    expect(reviewTake(wide, []).fails).toEqual([])
    expect(reviewTake({ ...wide, textPx: undefined }, [], { x: true }).suggests).toEqual([expect.stringContaining('no text size')])
  })

  test('judges an X-shape take at the X pace without being asked', () => {
    const long = take([{ t: 0.4, text: 'Draw a note' }, { t: 15, text: 'Connect them' }], 17)
    expect(reviewTake(long, []).suggests).toEqual([expect.stringContaining('an X clip reads best')])
    expect(reviewTake({ ...long, view: CLIP.wide }, []).suggests).toEqual([])
  })

  test('refuses an X-shape clip without a title bar, so the chat clip is the one X can post', () => {
    const one = take([{ t: 0.4, text: 'Draw a note' }])
    expect(checkBar(one)).toEqual([expect.stringContaining('needs a title bar')])
    expect(checkBar(one, { tag: 'board', title: 'notes in your doc' })).toEqual([])
    expect(checkBar({ ...one, view: CLIP.wide })).toEqual([])
    expect(checkBar({ ...one, view: CLIP.pair })).toEqual([expect.stringContaining('a before-and-after clip needs a title bar')])
  })

  test('counts typing as motion and a blinking caret as still', () => {
    // Measured changes per frame on the board clips: a caret blink and a typed letter.
    const caret = 30
    const letter = 90
    const letters = [20, 24, 28, 32, 36]
    const frameAt = (i: number) => (i + 1) / 60
    const ms = (s: number) => Math.round(s * 1000) / 1000
    const changed = Array.from({ length: 60 }, (_, i): [number, number] => [frameAt(i), i === 10 ? caret : letters.includes(i) ? letter : 0])
    expect(stillRuns(changed, 1)).toEqual([[0, ms(frameAt(letters[0]))], [ms(frameAt(letters.at(-1)!)), 1]])
  })

  test('measures how much of the frame the result changed', () => {
    const before = new Uint8Array(100).fill(250)
    const after = before.slice()
    after.fill(233, 0, 10)
    after.fill(247, 10, 20)
    expect(changedPct(before, after)).toBe(10)
  })

  test('suggests opening on the action and a shorter X clip', () => {
    const r = reviewTake(take([{ t: 2, text: 'Draw a note' }], 17), [], { x: true })
    expect(r.suggests).toEqual([expect.stringContaining('an X clip reads best'), expect.stringContaining('the first caption shows at 2.2 s')])
  })
})

describe('a before-and-after pair', () => {
  const at = (view = CLIP.pair, crop?: Take['crop']): Take => ({ ...take([{ t: 0, text: 'Open the menu' }]), view, crop })

  test('plays as one clip when both takes film the 16:9 pair shape', () => {
    expect(checkPair(at(), at())).toEqual([])
  })

  test('refuses a take in any other shape or with a crop, so both copies fit the clip side by side', () => {
    expect(checkPair(at(CLIP.x), at(CLIP.x))).toEqual([
      "the before take films 540x654@2; film a before-and-after take with openClip's { shape: 'pair' } and no crop, so both copies fit the clip side by side",
      "the after take films 540x654@2; film a before-and-after take with openClip's { shape: 'pair' } and no crop, so both copies fit the clip side by side",
    ])
    expect(checkPair(at(CLIP.wide), at(CLIP.wide))).toHaveLength(2)
    expect(checkPair(at(CLIP.pair, { x: 0, y: 0, w: 600, h: 400 }), at(CLIP.pair, { x: 0, y: 0, w: 600, h: 400 }))).toHaveLength(2)
  })

  test('refuses takes whose frames differ, naming both sizes', () => {
    expect(checkPair(at(), at(CLIP.x))[0]).toBe('the before take films 612x530@3 and the after take 540x654@2; film both with the same shape and crop size')
  })

  test("lets a bug clip's reference and beta takes keep their repro window", () => {
    const repro = { ...at(CLIP.repro), repro: true }
    expect(checkPair(repro, repro)).toEqual([])
  })

  test('refuses takes with different beats, which leave nothing to line them up by', () => {
    const one = at()
    const two = { ...at(), captions: [...at().captions, { t: 2, text: 'Undo it' }] }
    expect(checkPair(one, two)).toEqual(['the before take has 1 captions and the after take 2; caption the same beats in both, so they play in step'])
  })

  test('lines both takes up caption by caption, holding the shorter one', () => {
    const { plan, starts, frames } = alignBeats([[12, 100], [12, 160]], [200, 220], 30)
    expect(starts).toEqual([12, 160])
    expect(frames).toEqual(12 + 148 + 100 + 30)
    expect(plan[0]).toEqual([[0, 12, 0], [12, 100, 60], [100, 200, 30]])
    expect(plan[1]).toEqual([[0, 12, 0], [12, 160, 0], [160, 220, 70]])
    for (const spans of plan) expect(spans.reduce((n, [a, b, held]) => n + b - a + held, 0)).toBe(frames)
  })

  test('trims the margin both takes leave blank, on the page color, with some page around what is left', () => {
    const size = 64
    const frame = (x0: number, y0: number, n: number) => {
      const f = new Uint8Array(size * size * 3).fill(250)
      for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) f.fill(20, 3 * (y * size + x), 3 * (y * size + x) + 3)
      return f
    }
    const frames = [frame(10, 20, 5), frame(30, 24, 8)]
    expect(pageColor(frames[0], size, size)).toBe(0xfafafa)
    const box = contentBox(frames, size, size, 0xfafafa)
    expect(box).toEqual({ x: 10, y: 20, w: 28, h: 12 })
    expect(contentBox([frame(0, 0, 0)], size, size, 0xfafafa)).toBeUndefined()
    const pad = CLIP.comparePadPx
    expect(padBox(box, [2, 2], 128, 128)).toEqual({ x: 20 - pad, y: 40 - pad, w: 56 + 2 * pad, h: 24 + 2 * pad })
    expect(padBox({ x: 0, y: 0, w: 64, h: 64 }, [2, 2], 128, 128)).toEqual({ x: 0, y: 0, w: 128, h: 128 })
    expect(padBox(undefined, [2, 2], 128, 128)).toEqual({ x: 0, y: 0, w: 128, h: 128 })
  })

  test('puts a whole pair take beside its pair at full size and zooms a small one up to its own pixels, on a canvas as tall as its cards and never past 16:9', () => {
    const { width } = CLIP.pairCanvas
    const zoom = CLIP.pair.scale / CLIP.pairCanvas.scale
    const at = pairLayout({ x: 0, y: 0, w: CLIP.pair.width, h: CLIP.pair.height }, zoom)
    expect(at.k).toBe(1)
    // Each card's border sits 2 px outside its copy, its band 28 px above, and the cards keep 16 px from the canvas edges and between them.
    expect(at.x[0] - 2).toBe(16)
    expect(at.x[1] - at.x[0] - at.panel.w - 4).toBe(16)
    expect(at.y[0] - 28).toBe(16)
    expect(at.y[0] + at.panel.h + 2).toBe(at.height - 16)
    const wide = pairLayout({ x: 0, y: 0, w: 380, h: 100 }, zoom)
    expect(wide.k).toBeGreaterThan(1.5)
    expect(wide.height).toBe(16 + 28 + 100 * wide.k + 2 + 16)
    expect(pairLayout({ x: 0, y: 0, w: 100, h: 50 }, zoom).k).toBe(zoom)
    expect(pairLayout({ x: 0, y: 0, w: 300, h: 900 }, zoom).height + CLIP.pairHead.height).toBeCloseTo((width * 9) / 16)
  })

  test('replays two cards in columns, or in rows when that shows a wide crop larger, each copy as large as the page allows but never past its own size', () => {
    const { width, height } = CLIP.x
    // Each card adds a 28 px band above its copy and a 2 px border around it, and the cards keep 16 px from the page's edges and between them.
    const card = { b: 28, e: 2, m: 16, g: 16 }
    const whole = cardLayout({ x: 0, y: 0, w: width, h: 330 }, width, height, 1, true)
    expect(whole.across).toBe(false)
    expect(whole.k).toBeCloseTo((height - 2 * card.m - card.g - 2 * (card.b + card.e)) / 2 / 330)
    expect(whole.y[0]).toBeCloseTo(card.m + card.b)
    expect(whole.y[1] - whole.y[0]).toBeCloseTo(whole.panel.h + card.e + card.g + card.b)
    expect(whole.y[1] + whole.panel.h + card.e).toBeCloseTo(height - card.m)
    expect(whole.x[0]).toBeCloseTo((width - whole.panel.w) / 2)
    const narrow = cardLayout({ x: 100, y: 0, w: 200, h: 200 }, width, height, 1, true)
    expect(narrow.k).toBe(1)
    expect(narrow.panel).toEqual({ w: 200, h: 200 })
    expect(narrow.across).toBe(true)
    const tall = cardLayout({ x: 0, y: 0, w: 200, h: 540 }, width, height, 1, true)
    expect(tall.across).toBe(true)
    expect(tall.y).toEqual([tall.y[0], tall.y[0]])
    expect(tall.y[0]).toBeGreaterThanOrEqual(card.m + card.b)
    expect(tall.x[1] - tall.x[0]).toBeCloseTo(tall.panel.w + 2 * card.e + card.g)
    expect(tall.x[0] + tall.x[1] + tall.panel.w).toBeCloseTo(width)
    expect(cardLayout({ x: 0, y: 0, w: 200, h: 540 }, width, height, 1, false).across).toBe(true)
  })

  test("fits a bug clip's page to its two cards, never past its bound", () => {
    const card = { b: 28, e: 2, m: 16, g: 16 }
    const bound = CLIP.reproStage
    // A small crop plays in columns at 1×, so the page is two cards wide and one card tall.
    const small = reproLayout({ x: 0, y: 0, w: 300, h: 200 })
    expect(small.k).toBe(1)
    expect(small.across).toBe(true)
    expect(small.panel).toEqual({ w: 300, h: 200 })
    expect(small.width).toBe(2 * (300 + 2 * card.e) + card.g + 2 * card.m)
    expect(small.height).toBe(card.b + 200 + card.e + 2 * card.m)
    expect(small.x[0] + small.x[1] + small.panel.w).toBeCloseTo(small.width)
    // The whole repro window plays stacked, shrunk to fit the bound but larger than side by side.
    const window = reproLayout({ x: 0, y: 0, w: CLIP.repro.width, h: CLIP.repro.height })
    expect(window.across).toBe(false)
    expect(window.k).toBeLessThan(1)
    expect(window.k).toBeGreaterThan(0.8)
    expect(window.width).toBeLessThanOrEqual(bound.width)
    expect(window.height).toBeLessThanOrEqual(bound.height)
    // A narrow crop still gets a page wide enough for the head.
    expect(reproLayout({ x: 0, y: 0, w: 120, h: 80 }).width).toBe(bound.minWidth)
  })

  test('an X clip with its bars is 2:3', () => {
    expect((CLIP.x.height + 80 + 76) / CLIP.x.width).toBe(3 / 2)
  })

  test('puts a before still beside an after still in cards, cropped to where they differ', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'clip-pair-'))
    const still = (name: string, boxes: string) => {
      const file = join(dir, `${name}.png`)
      Bun.spawnSync(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', `color=c=white:s=800x600${boxes}`, '-frames:v', '1', file])
      return file
    }
    const before = still('before', ',drawbox=x=100:y=400:w=200:h=30:color=gray:t=fill')
    const after = still('after', ',drawbox=x=100:y=400:w=200:h=30:color=black:t=fill')
    const out = join(dir, 'pair.png')
    expect((await renderPair([before, after], out)).fails).toEqual([])
    const [w, h] = Bun.spawnSync(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', out]).stdout.toString().trim().split(',').map(Number)
    // Two 400 px crops fit the 800 px page side by side, each in a card with a 2 px border and a 16 px gap, inside 16 px of margin.
    expect(w).toBe(2 * (400 + 4) + 16 + 32)
    // Each card is 150 px of page under its 28 px band, over its 2 px border.
    expect(h).toBe(28 + 150 + 2 + 32)
    expect((await renderPair([before, before], out)).fails[0]).toContain('show the same thing')
    // Two phone screens that differ across their whole width still go side by side, because stacked they make a strip four times as tall as wide.
    const tall = (name: string, color: string) => {
      const file = join(dir, `${name}.png`)
      Bun.spawnSync(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', `color=c=white:s=400x860,drawbox=x=0:y=100:w=400:h=700:color=${color}:t=fill`, '-frames:v', '1', file])
      return file
    }
    expect((await renderPair([tall('phone-before', 'gray'), tall('phone-after', 'black')], out)).fails).toEqual([])
    const [pw, ph] = Bun.spawnSync(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', out]).stdout.toString().trim().split(',').map(Number)
    expect([pw, ph]).toEqual([2 * (400 + 4) + 16 + 32, 28 + 860 + 2 + 32])
    const other = join(dir, 'other.png')
    Bun.spawnSync(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=white:s=640x480', '-frames:v', '1', other])
    expect((await renderPair([before, other], out)).fails[0]).toContain('take both at one size')
  }, 60_000)
})

describe('captions and bars', () => {
  test('captions are short sentences with keycaps', () => {
    expect(() => checkCaption('Hold [Shift] for a circle')).not.toThrow()
    expect(() => checkCaption('[Enter] type')).not.toThrow()
    expect(() => checkCaption('draw a note')).toThrow('starts with a capital')
    expect(() => checkCaption('Draw a note.')).toThrow('without a period')
    expect(() => checkCaption('Or [Ctrl] [D] on Windows')).toThrow('"Windows"')
    expect(() => checkCaption('[Cmd] [D] copies it')).not.toThrow()
    expect(() => checkCaption('Draw a note then type a long label in it')).toThrow(`more than ${CLIP.captionWords} words`)
    expect(fixCaption(' sketch with the pen. ')).toBe('Sketch with the pen')
    expect(captionHtml('Hold [Shift] for a circle').match(/border-radius/g)).toHaveLength(1)
    expect(captionHtml('[N] [Enter]').match(/border-radius/g)).toHaveLength(2)
  })

  test('shows each caption until the next, and the last one long enough to read', () => {
    const w = captionWindows([{ t: 0.5, text: 'Draw a note' }, { t: 2, text: '[R]' }, { t: 7.9, text: '[Esc]' }], 8)
    expect(w.map(x => [x.from, x.to])).toEqual([[0.5, 2], [2, 7.9], [7.9, 9.1]])
  })

  test('cuts from one caption to the next with no frame showing both', () => {
    const f = captionOverlay({ from: 2, to: 4 }, 'v0', '3:v', 'v1')
    expect(f).toContain("enable='gte(t,1.9917)*lt(t,3.9917)'")
    expect(f).not.toContain('fade')
  })

  test('titles are lowercase and short', () => {
    expect(() => checkTitle('board', 'draw it the size you drag')).not.toThrow()
    expect(() => checkTitle('Board', 'draw it')).toThrow('one lowercase word')
    expect(() => checkTitle('board', 'Draw It')).toThrow('lowercase')
    expect(() => checkTitle('board', 'one two three four five six seven')).toThrow(`${CLIP.titleWords} words`)
  })

  test('rounds a crop to even sides inside the viewport', () => {
    expect(fitCrop({ x: -3, y: 11, w: 1201, h: 401 })).toEqual({ x: 0, y: 12, w: 1100, h: 400 })
  })

  test('a pen stroke starts moving and lands on its end', () => {
    expect(stroke(0)).toBe(0)
    expect(stroke(1)).toBeCloseTo(1)
    expect(stroke(0.05)).toBeGreaterThan(0.02)
  })
})

describe('the title bar', () => {
  test('shrinks a long title until it fits one line', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'clip-bar-'))
    const clip = join(dir, 'page.mp4')
    Bun.spawnSync(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=white:s=540x400:d=0.3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', clip])
    expect((await renderClip(clip, join(dir, 'long.mp4'), { bar: { tag: 'markdown', title: 'keep your yaml front matter intact' } })).titlePx).toBeLessThan(CLIP.titlePx.max)
    expect((await renderClip(clip, join(dir, 'short.mp4'), { bar: { tag: 'board', title: 'notes' } })).titlePx).toBe(CLIP.titlePx.max)
  }, 60_000)

  test('keeps each page frame once and in order under the bars, a caption and a mark', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'clip-frames-'))
    const [clip, mark, out] = [join(dir, 'page.mp4'), join(dir, 'mark.png'), join(dir, 'out.mp4')]
    Bun.spawnSync(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'nullsrc=s=540x400:r=60:d=0.5,geq=lum=16+N*7:cb=128:cr=128', '-c:v', 'libx264', '-crf', '0', '-pix_fmt', 'yuv420p', clip])
    Bun.spawnSync(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=20x10', '-frames:v', '1', mark])
    const marks = [{ file: mark, x: '0', y: '0', from: 10, to: 20 }]
    await renderClip(clip, out, { bar: { tag: 'board', title: 'notes' }, captions: [{ t: 0.1, text: 'Draw a note' }], marks })
    const page = Bun.spawnSync(['ffmpeg', '-v', 'error', '-i', out, '-vf', 'crop=100:100:220:230,extractplanes=y,scale=1:1:flags=area', '-f', 'rawvideo', '-']).stdout
    expect([...page].map(v => Math.round((v - 16) / 7))).toEqual(Array.from({ length: 30 }, (_, n) => n))
  }, 60_000)

  test('hides a parked cursor, fades it once it rests and shows it again as it moves', async () => {
    const clip = await openClip('data:text/html,<body></body>')
    const opacity = () => clip.page.evaluate(() => Number([...document.documentElement.children].find(el => el.querySelector('svg'))!.style.opacity))
    try {
      await clip.place(60, 60)
      await clip.page.waitForTimeout(150)
      expect(await opacity()).toBe(0)
      await clip.page.mouse.move(100, 100)
      await clip.page.mouse.move(200, 200, { steps: 10 })
      await clip.page.waitForTimeout(150)
      expect(await opacity()).toBeGreaterThan(0.9)
      await clip.page.waitForTimeout((CLIP.cursorIdleS + CLIP.cursorFadeS) * 1000 + 300)
      expect(await opacity()).toBe(0)
      await clip.page.mouse.move(260, 260, { steps: 10 })
      await clip.page.waitForTimeout(150)
      expect(await opacity()).toBeGreaterThan(0.9)
    } finally {
      await clip.page.context().browser()!.close()
    }
  }, 30_000)

  test('a moved cursor does not widen the changed area', () => {
    const [w, h] = [100, 100]
    const before = new Uint8Array(w * h * 3).fill(255)
    const after = before.slice()
    const paint = (x0: number, y0: number, bw: number, bh: number) => {
      for (let y = y0; y < y0 + bh; y++) after.fill(0, 3 * (y * w + x0), 3 * (y * w + x0 + bw))
    }
    paint(10, 20, 60, 6)
    paint(90, 90, 2, 2)
    expect(changedBox(before, after, w, h)).toEqual({ x: 6, y: 16, w: 68, h: 14 })
  })
})

describe('drag and drop', () => {
  const editor = async () => {
    // A page set with setContent drops the drawn cursor's listeners, so the fixture loads as the page itself.
    const clip = await openClip(`data:text/html,${encodeURIComponent('<div contenteditable style="font:20px sans-serif"><p>alpha beta gamma</p><p>delta epsilon</p></div>')}`)
    // The middle of "beta" in the first paragraph, and the gap before "epsilon" in the second.
    const [from, to] = await clip.page.evaluate(() => {
      const [a, b] = [...document.querySelectorAll('p')].map(p => p.firstChild!)
      const at = (node: Node, start: number, end: number) => {
        const r = document.createRange()
        r.setStart(node, start)
        r.setEnd(node, end)
        return r
      }
      const word = at(a, 6, 10).getBoundingClientRect()
      const gap = at(b, 6, 6).getBoundingClientRect()
      return [[word.x + word.width / 2, word.y + word.height / 2], [gap.x + 1, gap.y + gap.height / 2]] as [number, number][]
    })
    return { clip, from, to, text: () => clip.page.evaluate(() => [...document.querySelectorAll('p')].map(p => p.textContent)) }
  }

  test('drops a dragged text selection where the pointer lets go, with the drawn cursor following', async () => {
    const { clip, from, to, text } = await editor()
    try {
      await clip.place(from[0] - 40, from[1] + 60)
      await clip.glide(from[0], from[1])
      await clip.wait(300)
      await clip.dblclick()
      expect(await clip.page.evaluate(() => getSelection()!.toString())).toBe('beta')
      await clip.dragDrop(from, to)
      const [source, target] = await text()
      expect(source).not.toContain('beta')
      expect(target).toMatch(/^delta beta ?epsilon$/)
      await clip.wait(100)
      const rows: TrailRow[] = await clip.page.evaluate(() => (window as any).__trail)
      const held = rows.filter(r => r[1] === 1)
      expect(Math.hypot(held.at(-1)![4] - held[0][4], held.at(-1)![5] - held[0][5])).toBeGreaterThan(20)
      const last = rows.at(-1)!
      expect([last[1], Math.round(last[2]), Math.round(last[3])]).toEqual([0, Math.round(to[0]), Math.round(to[1])])
    } finally {
      await clip.browser.close()
    }
  }, 30_000)

  test('refuses a drag that starts nothing, instead of faking one', async () => {
    const { clip, from, to, text } = await editor()
    try {
      await expect(clip.dragDrop(from, to)).rejects.toThrow('started a drag')
      expect((await text())[1]).toBe('delta epsilon')
    } finally {
      await clip.browser.close()
    }
  }, 30_000)
})

describe('the project shape', () => {
  const project = (config?: string) => {
    const root = mkdtempSync(join(tmpdir(), 'clip-project-'))
    if (config !== undefined) {
      mkdirSync(join(root, '.agents'))
      writeFileSync(join(root, CLIP_CONFIG), config)
    }
    const scene = join(root, 'docs/plans/artifacts/run')
    mkdirSync(scene, { recursive: true })
    return scene
  }

  test('a project whose config names wide films every clip wide, from a scene deep inside it', () => {
    expect(projectShape([project('{"shape":"wide"}')])).toBe('wide')
  })

  test('a project with no config films X\'s shape', () => {
    expect(projectShape([project()])).toBe('x')
  })

  test('the scene\'s project decides before the working folder\'s', () => {
    expect(projectShape([project('{"shape":"x"}'), project('{"shape":"wide"}')])).toBe('x')
  })

  test('a config naming an unknown shape fails with the file and the shapes it takes', () => {
    expect(() => projectShape([project('{"shape":"mobile"}')])).toThrow('use "wide" or "x"')
  })
})
