import { describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  alignBeats,
  captionWindows,
  cardLayout,
  changedBox,
  changedPct,
  checkBar,
  checkCaption,
  checkPair,
  checkTitle,
  checkTrail,
  CLIP,
  CLIP_CONFIG,
  contentBox,
  fitCrop,
  fixCaption,
  openClip,
  padBox,
  pageColor,
  pairLayout,
  projectShape,
  renderClip,
  renderPair,
  reproLayout,
  reviewTake,
  shiftBeats,
  squeezePlan,
  stillRuns,
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

  test('fails a jump at a press and skips setup before filming', () => {
    const t = trail(20, i => (i < 10 ? [0, 100, 0, 140, 0] : [1, 140, 0, 140, 0]))
    expect(checkTrail(t).problems).toEqual([expect.stringContaining('jumped 40 px at a press')])
    expect(checkTrail(t, t[9][0] + 1).problems).toEqual([])
  })

  test('fails pointer moves that arrive in uneven jumps while a button is down', () => {
    const t = trail(90, i => [1, Math.floor(i / 3) * 6, 0, Math.floor(i / 3) * 6, 0])
    expect(checkTrail(t).problems).toEqual([expect.stringContaining('50 ms apart')])
  })
})

describe('a take', () => {
  test('passes the debut pace, fixes minor caption issues, and fails short beats or overlong chat/repro clips', () => {
    expect(reviewTake(take([{ t: 0.45, text: 'Draw a note' }, { t: 4.9, text: 'Add a shape' }, { t: 8.2, text: 'Connect them' }, { t: 11, text: 'Sketch with the pen' }], 14.6), [], { x: true })).toEqual({ fails: [], fixes: [], suggests: [] })
    const fixed = reviewTake(take([{ t: 0.4, text: 'draw a note.' }]), [])
    expect(fixed.fixes).toEqual(['caption "draw a note." renders as "Draw a note"'])
    expect(fixed.fails).toEqual([])

    const short = reviewTake(take([{ t: 0.4, text: 'Draw a note' }, { t: 1, text: 'Add a shape' }], 21), [])
    expect(short.fails).toEqual([expect.stringContaining('runs 21.2 s'), expect.stringContaining('"Draw a note" shows for 0.6 s')])

    const repro = (captions: Take['captions'], seconds: number): Take => ({ ...take(captions, seconds), view: CLIP.repro, repro: true })
    expect(reviewTake(repro([{ t: 0.4, text: 'Type check' }, { t: 27, text: 'Only ch keeps the mark' }], 30), []).fails).toEqual([])
    expect(reviewTake(repro([{ t: 0.4, text: 'Type check' }, { t: 28.5, text: 'Only ch keeps the mark' }], 30), []).fails).toEqual([expect.stringContaining('read(2000)')])
    expect(reviewTake(repro([{ t: 0.4, text: 'Type check' }, { t: 60, text: 'Only ch keeps the mark' }], 63), []).fails).toEqual([expect.stringContaining('over 60 s')])
  })

  test('squeezes long still stretches while preserving caption read times, end holds, and read() holds', () => {
    expect(squeezePlan([[1.1, 3.3]], [0.2, 3.1, 5.9], 9)).toEqual([[1.5, 3.1]])
    expect(squeezePlan([[0.3, 1.5]], [0.2, 1.5], 4)).toEqual([[1.4, 1.5]])
    expect(squeezePlan([[7.5, 10]], [0.2, 4], 10)).toEqual([[8.1, 10]])
    expect(squeezePlan([[2, 2.3]], [0.2], 6)).toEqual([])
    expect(squeezePlan([[7.5, 10]], [0.2, 4], 10, [], CLIP.compareEndS)).toEqual([[7.9, 10]])
    expect(squeezePlan([[11.4, 14]], [0.2, 9], 14, [[11.4, 13.4]])).toEqual([[13.4, 14]])
    expect(shiftBeats([{ t: 0.2, text: 'A' }, { t: 3.1, text: 'B' }, { t: 5.9, text: 'C' }], [[1.8, 3.1], [5, 5.5]])).toEqual([
      { t: 0.2, text: 'A' },
      { t: 1.8, text: 'B' },
      { t: 4.1, text: 'C' },
    ])
    expect(reviewTake(take([{ t: 0.4, text: 'Draw a note' }, { t: 15, text: 'Connect them' }], 17), [], { x: true, cutS: 4 })).toEqual({ fails: [], fixes: [], suggests: [] })
  })

  test('enforces X phone text readability, X pace hints, opening timing, and required title bars', () => {
    const wide = { ...take([{ t: 0.4, text: 'Delete the whole table' }]), view: CLIP.wide, crop: { x: 0, y: 0, w: 1100, h: 720 } }
    expect(reviewTake(wide, [], { x: true }).fails).toEqual([expect.stringContaining('shows at 4.5 pt')])
    expect(reviewTake(wide, []).fails).toEqual([])
    expect(reviewTake({ ...wide, textPx: undefined }, [], { x: true }).suggests).toEqual([expect.stringContaining('no text size')])

    const long = take([{ t: 2, text: 'Draw a note' }, { t: 15, text: 'Connect them' }], 17)
    expect(reviewTake(long, []).suggests).toEqual([expect.stringContaining('an X clip reads best'), expect.stringContaining('the first caption shows at 2.2 s')])
    expect(reviewTake({ ...long, view: CLIP.wide }, []).suggests).toEqual([expect.stringContaining('the first caption shows at 2.2 s')])

    const one = take([{ t: 0.4, text: 'Draw a note' }])
    expect(checkBar(one)).toEqual([expect.stringContaining('needs a title bar')])
    expect(checkBar(one, { tag: 'board', title: 'notes in your doc' })).toEqual([])
    expect(checkBar({ ...one, view: CLIP.wide })).toEqual([])
    expect(checkBar({ ...one, view: CLIP.pair })).toEqual([expect.stringContaining('a before-and-after clip needs a title bar')])
  })

  test('counts typing as motion, a blinking caret as still, and measures pixel change percent and box', () => {
    const letters = [20, 24, 28, 32, 36]
    const frameAt = (i: number) => (i + 1) / 60
    const ms = (s: number) => Math.round(s * 1000) / 1000
    const changed = Array.from({ length: 60 }, (_, i): [number, number] => [frameAt(i), i === 10 ? 30 : letters.includes(i) ? 90 : 0])
    expect(stillRuns(changed, 1)).toEqual([[0, ms(frameAt(letters[0]))], [ms(frameAt(letters.at(-1)!)), 1]])

    const before = new Uint8Array(100).fill(250)
    const after = before.slice()
    after.fill(233, 0, 10)
    after.fill(247, 10, 20)
    expect(changedPct(before, after)).toBe(10)

    const [w, h] = [100, 100]
    const b2 = new Uint8Array(w * h * 3).fill(255)
    const a2 = b2.slice()
    const paint = (x0: number, y0: number, bw: number, bh: number) => {
      for (let y = y0; y < y0 + bh; y++) a2.fill(0, 3 * (y * w + x0), 3 * (y * w + x0 + bw))
    }
    paint(10, 20, 60, 6)
    paint(90, 90, 2, 2)
    expect(changedBox(b2, a2, w, h)).toEqual({ x: 6, y: 16, w: 68, h: 14 })
  })
})

describe('a before-and-after pair', () => {
  const at = (view = CLIP.pair, crop?: Take['crop']): Take => ({ ...take([{ t: 0, text: 'Open the menu' }]), view, crop })

  test('validates pair shapes, matching frame sizes, repro pairs, and matching beat counts', () => {
    expect(checkPair(at(), at())).toEqual([])
    expect(checkPair(at(CLIP.x), at(CLIP.x))).toHaveLength(2)
    expect(checkPair(at(CLIP.wide), at(CLIP.wide))).toHaveLength(2)
    expect(checkPair(at(CLIP.pair, { x: 0, y: 0, w: 600, h: 400 }), at(CLIP.pair, { x: 0, y: 0, w: 600, h: 400 }))).toHaveLength(2)
    expect(checkPair(at(), at(CLIP.x))[0]).toContain('film both with the same shape and crop size')
    const repro = { ...at(CLIP.repro), repro: true }
    expect(checkPair(repro, repro)).toEqual([])
    expect(checkPair(at(), { ...at(), captions: [...at().captions, { t: 2, text: 'Undo it' }] })[0]).toContain('caption the same beats in both')
  })

  test('aligns beats in lockstep, detects content bounds with padding, and chooses side-by-side vs stacked layouts within bounds', () => {
    const { plan, starts, frames } = alignBeats([[12, 100], [12, 160]], [200, 220], 30)
    expect(starts).toEqual([12, 160])
    expect(frames).toEqual(290)
    for (const spans of plan) expect(spans.reduce((n, [a, b, held]) => n + b - a + held, 0)).toBe(frames)

    const size = 64
    const frame = (x0: number, y0: number, n: number) => {
      const f = new Uint8Array(size * size * 3).fill(250)
      for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) f.fill(20, 3 * (y * size + x), 3 * (y * size + x) + 3)
      return f
    }
    const framesRgb = [frame(10, 20, 5), frame(30, 24, 8)]
    expect(pageColor(framesRgb[0], size, size)).toBe(0xfafafa)
    const box = contentBox(framesRgb, size, size, 0xfafafa)
    expect(box).toEqual({ x: 10, y: 20, w: 28, h: 12 })
    expect(contentBox([frame(0, 0, 0)], size, size, 0xfafafa)).toBeUndefined()
    expect(padBox(undefined, [2, 2], 128, 128)).toEqual({ x: 0, y: 0, w: 128, h: 128 })

    const zoom = CLIP.pair.scale / CLIP.pairCanvas.scale
    expect(pairLayout({ x: 0, y: 0, w: CLIP.pair.width, h: CLIP.pair.height }, zoom).k).toBe(1)
    expect(pairLayout({ x: 0, y: 0, w: 100, h: 50 }, zoom).k).toBe(zoom)
    expect(pairLayout({ x: 0, y: 0, w: 300, h: 900 }, zoom).height + CLIP.pairHead.height).toBeCloseTo((CLIP.pairCanvas.width * 9) / 16)

    const { width, height } = CLIP.x
    expect(cardLayout({ x: 0, y: 0, w: width, h: 330 }, width, height, 1, true).across).toBe(false)
    expect(cardLayout({ x: 0, y: 0, w: 200, h: 540 }, width, height, 1, true).across).toBe(true)

    const small = reproLayout({ x: 0, y: 0, w: 300, h: 200 })
    expect(small.k).toBe(1)
    expect(small.across).toBe(true)
    const whole = reproLayout({ x: 0, y: 0, w: CLIP.repro.width, h: CLIP.repro.height })
    expect(whole.across).toBe(false)
    expect(whole.width).toBeLessThanOrEqual(CLIP.reproStage.width)
    expect(whole.height).toBeLessThanOrEqual(CLIP.reproStage.height)
    expect(reproLayout({ x: 0, y: 0, w: 120, h: 80 }).width).toBe(CLIP.reproStage.minWidth)
  })

  test('renders a before/after still pair cropped to where they differ and refuses identical or mismatched sizes', async () => {
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
    expect(w).toBeGreaterThan(800)
    expect(h).toBeLessThan(300)
    expect((await renderPair([before, before], out)).fails[0]).toContain('show the same thing')

    const tall = (name: string, color: string) => {
      const file = join(dir, `${name}.png`)
      Bun.spawnSync(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', `color=c=white:s=400x860,drawbox=x=0:y=100:w=400:h=700:color=${color}:t=fill`, '-frames:v', '1', file])
      return file
    }
    expect((await renderPair([tall('phone-before', 'gray'), tall('phone-after', 'black')], out)).fails).toEqual([])
    const [pw, ph] = Bun.spawnSync(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', out]).stdout.toString().trim().split(',').map(Number)
    expect(pw).toBeGreaterThan(800)
    expect(ph).toBeLessThan(1000)

    const other = join(dir, 'other.png')
    Bun.spawnSync(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=white:s=640x480', '-frames:v', '1', other])
    expect((await renderPair([before, other], out)).fails[0]).toContain('take both at one size')
  }, 60_000)
})

describe('captions, titles, crop, and rendering', () => {
  test('validates captions, titles, caption windows, and even crops', () => {
    expect(() => checkCaption('Hold [Shift] for a circle')).not.toThrow()
    expect(() => checkCaption('[Cmd] [D] copies it')).not.toThrow()
    expect(() => checkCaption('draw a note')).toThrow('starts with a capital')
    expect(() => checkCaption('Draw a note.')).toThrow('without a period')
    expect(() => checkCaption('Or [Ctrl] [D] on Windows')).toThrow('"Windows"')
    expect(() => checkCaption('Draw a note then type a long label in it')).toThrow(`more than ${CLIP.captionWords} words`)
    expect(fixCaption(' sketch with the pen. ')).toBe('Sketch with the pen')

    expect(captionWindows([{ t: 0.5, text: 'Draw a note' }, { t: 2, text: '[R]' }, { t: 7.9, text: '[Esc]' }], 8).map(x => [x.from, x.to])).toEqual([[0.5, 2], [2, 7.9], [7.9, 9.1]])

    expect(() => checkTitle('board', 'draw it the size you drag')).not.toThrow()
    expect(() => checkTitle('Board', 'draw it')).toThrow('one lowercase word')
    expect(() => checkTitle('board', 'Draw It')).toThrow('lowercase')
    expect(() => checkTitle('board', 'one two three four five six seven')).toThrow(`${CLIP.titleWords} words`)
    expect(fitCrop({ x: -3, y: 11, w: 1201, h: 401 })).toEqual({ x: 0, y: 12, w: 1100, h: 400 })
  })

  test('shrinks a long title to fit one line and keeps each page frame once in order under bars, captions, and marks', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'clip-render-'))
    const [clip, mark, out] = [join(dir, 'page.mp4'), join(dir, 'mark.png'), join(dir, 'out.mp4')]
    Bun.spawnSync(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'nullsrc=s=540x400:r=60:d=0.5,geq=lum=16+N*7:cb=128:cr=128', '-c:v', 'libx264', '-crf', '0', '-pix_fmt', 'yuv420p', clip])
    Bun.spawnSync(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=20x10', '-frames:v', '1', mark])
    expect((await renderClip(clip, join(dir, 'long.mp4'), { bar: { tag: 'markdown', title: 'keep your yaml front matter intact' } })).titlePx).toBeLessThan(CLIP.titlePx.max)
    const short = await renderClip(clip, out, { bar: { tag: 'board', title: 'notes' }, captions: [{ t: 0.1, text: 'Draw a note' }], marks: [{ file: mark, x: '0', y: '0', from: 10, to: 20 }] })
    expect(short.titlePx).toBe(CLIP.titlePx.max)
    const page = Bun.spawnSync(['ffmpeg', '-v', 'error', '-i', out, '-vf', 'crop=100:100:220:230,extractplanes=y,scale=1:1:flags=area', '-f', 'rawvideo', '-']).stdout
    expect([...page].map(v => Math.round((v - 16) / 7))).toEqual(Array.from({ length: 30 }, (_, n) => n))
  }, 60_000)

  test('hides a parked cursor, fades it once it rests, and shows it again as it moves', async () => {
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
})

describe('drag and drop', () => {
  const editor = async () => {
    const clip = await openClip(`data:text/html,${encodeURIComponent('<div contenteditable style="font:20px sans-serif"><p>alpha beta gamma</p><p>delta epsilon</p></div>')}`)
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

  test('resolves wide, default x, scene-first precedence, and rejects unknown shapes', () => {
    expect(projectShape([project('{"shape":"wide"}')])).toBe('wide')
    expect(projectShape([project()])).toBe('x')
    expect(projectShape([project('{"shape":"x"}'), project('{"shape":"wide"}')])).toBe('x')
    expect(() => projectShape([project('{"shape":"mobile"}')])).toThrow('use "wide" or "x"')
  })
})
