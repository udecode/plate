import { adb, sleep, tap } from './kit.mjs';
export const dump = () => { adb('shell', 'uiautomator', 'dump', '/sdcard/app.xml'); return adb('exec-out', 'cat', '/sdcard/app.xml'); };
export const nodes = (xml) => [...xml.matchAll(/<node [^>]*>/g)].map((m) => { const t = m[0]; const a = (n) => t.match(new RegExp(`${n}="([^"]*)"`))?.[1] ?? ''; const b = a('bounds').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/)?.slice(1).map(Number) ?? [0, 0, 0, 0]; return { text: a('text'), desc: a('content-desc'), id: a('resource-id'), checked: a('checked'), checkable: a('checkable'), clickable: a('clickable'), x: (b[0] + b[2]) / 2, y: (b[1] + b[3]) / 2, bounds: b }; });
export const find = (pattern, xml = dump()) => nodes(xml).find((n) => pattern.test(n.text) || pattern.test(n.desc));
export const click = async (pattern, wait = 1200) => { const n = find(pattern); if (!n) throw new Error(`no node ${pattern}`); tap(n.x, n.y); await sleep(wait); return n; };
export const texts = (xml = dump()) => nodes(xml).map((n) => n.text || n.desc).filter(Boolean);
