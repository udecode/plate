import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Usage: node reads.mjs <arm letter>...; lists what each arm's newest transcript read, to confirm it loaded its own method.
const projects = join(process.env.HOME, '.claude/projects');
const prefix = '-private-tmp-claude-501--Users-zbeyens-git-plate-2-ac862676-9124-4cbd-8ab3-5c886b30fb97-scratchpad-snap-';
for (const arm of process.argv.slice(2)) {
  const dir = join(projects, prefix + arm);
  const newest = readdirSync(dir)
    .filter((name) => name.endsWith('.jsonl'))
    .map((name) => join(dir, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
  const reads = new Set();
  const denied = [];
  for (const line of readFileSync(newest, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);
    for (const part of entry.message?.content ?? []) {
      if (part.type === 'tool_use') {
        const target = part.input?.file_path ?? part.input?.path ?? part.input?.command ?? part.input?.pattern ?? '';
        reads.add(`${part.name} ${String(target).replace(/\/private\/tmp\/claude-501\/[^ ]*?scratchpad\/snap-[A-Za-z]+/g, '<snap>').slice(0, 140)}`);
      }
      if (part.type === 'tool_result' && /haven't granted|permission|denied/i.test(JSON.stringify(part.content))) denied.push(JSON.stringify(part.content).slice(0, 120));
    }
  }
  console.log(`== ${arm} ${newest.split('/').pop()} tool calls ${reads.size}, refusals ${denied.length}`);
  for (const read of reads) if (/qa-|round-data|verify|sweep|section|next-round/.test(read)) console.log(`  ${read}`);
  for (const refusal of denied.slice(0, 5)) console.log(`  refused: ${refusal}`);
}
