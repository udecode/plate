import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
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
  renderClip,
  alignBeats,
  renderPair,
  contentBox,
  padBox,
  pageColor,
  replayLayout,
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
  const at = (crop?: Take['crop'], view = CLIP.wide): Take => ({ ...take([{ t: 0, text: 'Open the menu' }]), view, crop })

  test('plays as one clip when both takes film the same shape and crop size', () => {
    expect(checkPair(at({ x: 0, y: 0, w: 600, h: 400 }), at({ x: 40, y: 20, w: 600, h: 400 }))).toEqual([])
  })

  test('refuses takes whose frames differ, naming both sizes', () => {
    expect(checkPair(at({ x: 0, y: 0, w: 600, h: 400 }), at({ x: 0, y: 0, w: 640, h: 400 }))).toEqual([
      'the before take films 1100x720@1 crop 600x400 and the after take 1100x720@1 crop 640x400; film both with the same shape and crop size',
    ])
    expect(checkPair(at(undefined, CLIP.wide), at(undefined, CLIP.x))).toHaveLength(1)
  })

  test('refuses takes with different beats, which leave nothing to line them up by', () => {
    const one = take([{ t: 0, text: 'Bold it' }])
    const two = take([{ t: 0, text: 'Bold it' }, { t: 2, text: 'Undo it' }])
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

  test('replays two copies in rows, or in columns when that shows a tall crop larger, each as large as the page allows but never past its own size', () => {
    const { width, height } = CLIP.x
    const tab = 17
    const whole = replayLayout({ x: 0, y: 0, w: width, h: height }, width, height, tab)
    expect(whole.k).toBeCloseTo((height - 12 - 8 - tab) / 2 / height)
    expect(whole.y[0]).toBeCloseTo(0)
    expect(whole.y[1] - whole.y[0]).toBeCloseTo(whole.panel.h + 8 + tab)
    expect(whole.y[1] + whole.panel.h).toBeCloseTo(height - 12)
    expect(whole.across).toBe(false)
    expect(whole.x[0]).toBeCloseTo((width - whole.panel.w) / 2)
    const narrow = replayLayout({ x: 100, y: 0, w: 200, h: 300 }, width, height, tab)
    expect(narrow.k).toBe(1)
    expect(narrow.panel).toEqual({ w: 200, h: 300 })
    expect(narrow.across).toBe(false)
    expect(narrow.y[0]).toBeCloseTo((height - 12 - 600 - 8 - tab) / 2)
    const wide = replayLayout({ x: 0, y: 0, w: width, h: 100 }, width, height, tab)
    expect(wide.panel.w).toBeCloseTo(width - 24)
    expect(wide.x[0]).toBeCloseTo(12)
    const tall = replayLayout({ x: 0, y: 0, w: 200, h: 640 }, width, height, tab)
    expect(tall.across).toBe(true)
    expect(tall.k).toBeCloseTo(Math.min(1, (width - 24 - 8) / 2 / 200, (height - 12 - tab) / 640))
    expect(tall.k).toBeGreaterThan((height - 12 - 8 - tab) / 2 / 640)
    expect(tall.y).toEqual([tall.y[0], tall.y[0]])
    expect(tall.y[0]).toBeGreaterThanOrEqual(tab)
    expect(tall.x[1] - tall.x[0]).toBeCloseTo(tall.panel.w + 8)
    expect(tall.x[0] + tall.x[1] + tall.panel.w).toBeCloseTo(width)
  })

  test('an X clip with its bars is 2:3', () => {
    expect((CLIP.x.height + 80 + 76) / CLIP.x.width).toBe(3 / 2)
  })

  test('stacks a before still above an after still, cropped to where they differ', async () => {
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
    expect(w).toBe(400)
    // Each panel is 150 px of page under a strip that holds its badge.
    expect(h).toBeGreaterThan(2 * 150 + 8 + 2 * 20)
    expect(h).toBeLessThan(2 * 150 + 8 + 2 * 60)
    expect((await renderPair([before, before], out)).fails[0]).toContain('show the same thing')
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
