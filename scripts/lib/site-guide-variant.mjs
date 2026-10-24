import { hash } from './locked-inputs.mjs';

export function siteGuideVariant(input) {
  const text = input.toString('utf8');
  const lines = text.split('\n');
  const edits = [];
  let inFile = false, inExplanation = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```') && !inFile && !inExplanation) {
      if (/^```[\w+.-]+\s+file=\S+$/.test(lines[i])) inFile = true;
      else if (lines[i] === '```json') {
        edits.push({ sourceLine: i + 1, before: lines[i], after: '~~~json' });
        lines[i] = '~~~json'; inExplanation = true;
      } else throw new Error(`Unexpected explanatory fence at source line ${i + 1}`);
    } else if (lines[i] === '```') {
      if (inExplanation) {
        edits.push({ sourceLine: i + 1, before: lines[i], after: '~~~' });
        lines[i] = '~~~'; inExplanation = false;
      } else inFile = false;
    }
  }
  if (edits.length !== 2 || inFile || inExplanation) throw new Error('Variant v1 requires exactly one complete explanatory JSON block');
  const notice = '> 网站专用派生指南 `dawnlight-v5-guide-site-v1`。原始指南保持在 `../docs/ShaderPackAuthorGuideP11V5.md`；仅将非文件 JSON 说明块改用波浪号围栏，使其不参与 Analyzer 的 file= 文件提取。原始指南的 DLTOOL2001 失败仍保留。\n\n';
  const output = Buffer.from(notice + lines.join('\n'));
  return {
    output,
    record: {
      id: 'dawnlight-v5-guide-site-v1', contractVersion: 1,
      sourcePath: 'authoring/docs/ShaderPackAuthorGuideP11V5.md',
      outputPath: 'authoring/site-variants/ShaderPackAuthorGuideP11V5.site-v1.md',
      source: { length: input.length, sha256: hash(input) },
      output: { length: output.length, sha256: hash(output) },
      transformation: 'Add variant notice; change the sole explanatory JSON fence pair to tilde fences. All seven file= blocks remain byte-identical.',
      edits, originalGuideExpectedFailure: { exitCode: 1, code: 'DLTOOL2001' }
    }
  };
}
