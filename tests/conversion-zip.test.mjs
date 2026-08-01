import assert from 'node:assert/strict';
import test from 'node:test';
import { createZip } from '../lib/conversion/zip-writer.ts';
import { assertZipUpload, readZip, sanitizeFilename } from '../lib/conversion/zip.ts';

test('valid ZIP upload passes structure validation', () => {
  const zip = createZip([{ name: 'pack.mcmeta', data: '{"pack":{"pack_format":15}}' }, { name: 'assets/minecraft/textures/block/stone.png', data: Buffer.from([1, 2, 3]) }]);
  assertZipUpload(zip, 'safe-pack.zip', 1024 * 1024);
  const parsed = readZip(zip);
  assert.equal(parsed.entries.length, 2);
});

test('invalid file content is rejected', () => {
  assert.throws(() => assertZipUpload(Buffer.from('not a zip'), 'pack.zip', 1024), /bukan ZIP/);
});

test('path traversal ZIP entries are rejected', () => {
  const zip = createZip([{ name: '../evil.txt', data: 'bad' }]);
  assert.throws(() => readZip(zip), /path tidak aman/);
});

test('oversized archive is rejected before analysis', () => {
  const zip = createZip([{ name: 'pack.mcmeta', data: '{}' }]);
  assert.throws(() => assertZipUpload(zip, 'pack.zip', 10), /melebihi batas/);
});

test('unsafe upload filenames are sanitized', () => {
  assert.equal(sanitizeFilename('../../My Pack!.zip'), 'my-pack-.zip');
});
