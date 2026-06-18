import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function getScript(id) {
  const pattern = new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/script>`);
  const match = html.match(pattern);
  assert.ok(match, `script #${id} should exist`);
  return match[1];
}

const sandbox = {
  window: {},
  document: {
    addEventListener() {},
    getElementById() {
      return null;
    },
    querySelector() {
      return null;
    },
  },
  Blob: class Blob {},
  URL: { createObjectURL() {}, revokeObjectURL() {} },
  navigator: { clipboard: null, mediaDevices: null },
  MediaRecorder: undefined,
  webkitSpeechRecognition: undefined,
  SpeechRecognition: undefined,
  setTimeout,
  clearTimeout,
};

vm.createContext(sandbox);
vm.runInContext(getScript('app-script'), sandbox);

const helpers = sandbox.window.__recordingAppTest;
assert.ok(helpers, 'test helpers should be exposed');

assert.equal(helpers.formatTitle('一二三四五六七八九十'), '一二三四五六七八九十');
assert.equal(helpers.formatTitle('一二三四五六七八九十一二'), '一二三四五六七八九十...');

const csv = helpers.toCsv([
  { id: 1, createdAt: '2026-06-18 14:30:00', text: '第一条文本', note: '普通备注' },
  { id: 2, createdAt: '2026-06-18 14:31:00', text: '带,逗号和"引号"', note: '多\n行' },
]);

assert.equal(
  csv,
  '\uFEFF序号,创建时间,文本内容,备注\r\n1,2026-06-18 14:30:00,第一条文本,普通备注\r\n2,2026-06-18 14:31:00,"带,逗号和""引号""","多\n行"'
);

assert.match(html, /class="record-list"/, 'page should include the waterfall record list');
assert.match(html, /data-action="note"/, 'record actions should include note editing');
assert.match(html, /data-action="copy"/, 'record actions should include copy text');
assert.match(html, /data-action="delete"/, 'record actions should include delete');
assert.match(html, /id="recordButton"/, 'page should include the hold-to-record button');
assert.match(html, /id="exportButton"/, 'page should include the CSV export button');

console.log('recording-page tests passed');
