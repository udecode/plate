import { describe, expect, it } from 'bun:test';
import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  acquireRegistryBuildLock,
  createRegistryGeneration,
  fingerprintRegistryDirectory,
  publishRegistryGeneration,
  recoverRegistryBuildLock,
  releaseRegistryBuildLock,
} from './registry-build-publication.mts';

describe('registry build publication', () => {
  it('rejects another writer and releases only the owner', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'registry-lock-'));

    try {
      const owner = await acquireRegistryBuildLock({
        buildRoot: root,
        sourceIdentity: 'source',
      });

      await expect(
        acquireRegistryBuildLock({
          buildRoot: root,
          sourceIdentity: 'other',
        })
      ).rejects.toThrow('Registry build lock is owned');
      await expect(
        recoverRegistryBuildLock({
          buildRoot: root,
          token: owner.lock.token,
        })
      ).rejects.toThrow('is still alive');
      await releaseRegistryBuildLock(owner);
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('fingerprints deterministic payloads and publishes the marker last', async () => {
    const root = path.join(os.tmpdir(), `registry-publish-${randomUUID()}`);
    const stage = path.join(root, 'stage');
    const output = path.join(root, 'output');

    try {
      await mkdir(path.join(stage, 'r'), { recursive: true });
      await mkdir(output, { recursive: true });
      await writeFile(path.join(stage, 'r/item.json'), '{"name":"item"}');
      await writeFile(path.join(stage, 'generation.json'), '{"id":"next"}');
      await writeFile(path.join(output, 'generation.json'), '{"id":"old"}');

      const payloads = await fingerprintRegistryDirectory(
        path.join(stage, 'r')
      );
      expect(createRegistryGeneration(payloads, 'source')).toHaveLength(64);

      await publishRegistryGeneration({
        marker: {
          destination: path.join(output, 'generation.json'),
          staged: path.join(stage, 'generation.json'),
        },
        targets: [
          {
            destination: path.join(output, 'r'),
            staged: path.join(stage, 'r'),
          },
        ],
        token: 'test',
      });

      expect(await readFile(path.join(output, 'r/item.json'), 'utf-8')).toBe(
        '{"name":"item"}'
      );
      expect(
        await readFile(path.join(output, 'generation.json'), 'utf-8')
      ).toBe('{"id":"next"}');
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('restores every prior output when publication fails before the marker', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'registry-rollback-'));
    const stage = path.join(root, 'stage');
    const output = path.join(root, 'output');

    try {
      await mkdir(path.join(stage, 'r'), { recursive: true });
      await mkdir(path.join(output, 'r'), { recursive: true });
      await writeFile(path.join(stage, 'r/item.json'), 'next');
      await writeFile(path.join(output, 'r/item.json'), 'old');
      await writeFile(path.join(stage, 'generation.json'), 'next-marker');
      await writeFile(path.join(output, 'generation.json'), 'old-marker');

      await expect(
        publishRegistryGeneration({
          marker: {
            destination: path.join(output, 'generation.json'),
            staged: path.join(stage, 'generation.json'),
          },
          targets: [
            {
              destination: path.join(output, 'r'),
              staged: path.join(stage, 'r'),
            },
            {
              destination: path.join(output, 'missing'),
              staged: path.join(stage, 'missing'),
            },
          ],
          token: 'rollback',
        })
      ).rejects.toThrow('Missing staged registry target');

      expect(await readFile(path.join(output, 'r/item.json'), 'utf-8')).toBe(
        'old'
      );
      expect(
        await readFile(path.join(output, 'generation.json'), 'utf-8')
      ).toBe('old-marker');
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('recovers only the exact dead writer token', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'registry-recover-'));
    const token = randomUUID();

    try {
      await mkdir(path.join(root, `run-${token}`));
      await writeFile(
        path.join(root, 'lock'),
        `${JSON.stringify({
          pid: 2_147_483_647,
          sourceIdentity: 'dead-source',
          startedAt: new Date(0).toISOString(),
          token,
        })}\n`
      );

      await expect(
        recoverRegistryBuildLock({ buildRoot: root, token: 'wrong' })
      ).rejects.toThrow('does not own the lock');
      await recoverRegistryBuildLock({ buildRoot: root, token });
      await expect(
        readFile(path.join(root, 'lock'), 'utf-8')
      ).rejects.toThrow();
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
