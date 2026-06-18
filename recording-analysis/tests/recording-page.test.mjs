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

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

assert.equal(helpers.formatTranscript('今天开会讨论项目进度然后安排明天任务'), '今天开会讨论项目进度，然后安排明天任务。');
assert.equal(helpers.formatTranscript('这个问题怎么处理'), '这个问题怎么处理？');
assert.equal(helpers.formatTranscript('已经有标点。继续保留！'), '已经有标点。继续保留！');

let interaction = helpers.applyRecordingResult([], 'user', '请介绍这个项目然后给出建议', '2026-06-18 14:30:00', 1);
assert.deepEqual(plain(interaction), {
  records: [
    {
      id: 1,
      createdAt: '2026-06-18 14:30:00',
      userText: '请介绍这个项目，然后给出建议。',
      aiText: '',
      note: ''
    }
  ],
  nextId: 2
});

interaction = helpers.applyRecordingResult(interaction.records, 'ai', '这是一个记录语音互动的工具', '2026-06-18 14:31:00', interaction.nextId);
assert.deepEqual(plain(interaction.records[0]), {
  id: 1,
  createdAt: '2026-06-18 14:30:00',
  userText: '请介绍这个项目，然后给出建议。',
  aiText: '这是一个记录语音互动的工具。',
  note: ''
});
assert.equal(interaction.nextId, 2);

const directAi = helpers.applyRecordingResult([], 'ai', '我可以先记录回复', '2026-06-18 14:32:00', 1);
assert.deepEqual(plain(directAi.records[0]), {
  id: 1,
  createdAt: '2026-06-18 14:32:00',
  userText: '',
  aiText: '我可以先记录回复。',
  note: ''
});

const csv = helpers.toCsv([
  { id: 1, userText: '用户问题', aiText: 'AI 回复', note: '普通备注', createdAt: '2026-06-18 14:30:00' },
  { id: 2, userText: '带,逗号和"引号"', aiText: '多\n行回复', note: '多\n行', createdAt: '2026-06-18 14:31:00' },
]);

assert.equal(
  csv,
  '\uFEFF序号,用户输入,AI回复,备注,创建时间\r\n1,用户问题,AI 回复,普通备注,2026-06-18 14:30:00\r\n2,"带,逗号和""引号""","多\n行回复","多\n行",2026-06-18 14:31:00'
);

assert.match(html, /class="record-list"/, 'page should include the waterfall record list');
assert.match(html, /data-action="note"/, 'record actions should include note editing');
assert.match(html, /data-action="copy"/, 'record actions should include copy text');
assert.match(html, /data-action="delete"/, 'record actions should include delete');
assert.match(html, /id="userRecordButton"/, 'page should include the user input recording button');
assert.match(html, /id="aiRecordButton"/, 'page should include the AI reply recording button');
assert.match(html, /id="exportButton"/, 'page should include the CSV export button');
assert.match(html, /-webkit-touch-callout:\s*none/, 'record button should disable mobile long-press callout');
assert.match(html, /-webkit-user-select:\s*none/, 'record button should disable mobile text selection');
assert.match(html, /addEventListener\('touchstart',\s*preventRecordButtonDefault,\s*\{\s*passive:\s*false\s*\}\)/, 'record button should prevent touchstart defaults');
assert.match(html, /addEventListener\('selectstart',\s*preventRecordButtonDefault\)/, 'record button should prevent selection defaults');
assert.match(html, /addEventListener\('dragstart',\s*preventRecordButtonDefault\)/, 'record button should prevent drag defaults');
assert.match(html, /record\.userText/, 'record title should render user input text');
assert.match(html, /record\.aiText/, 'record body should render AI reply text');
assert.doesNotMatch(html, /formatTitle\(record\./, 'record text should be rendered in full without ellipsis formatting');

console.log('recording-page tests passed');
