import { spawn } from 'node:child_process';

// The pinned graph CLI uses empty options. JSON-RPC is required for branch graphs.
export async function analyzerRpc(exe, method, params, { cwd, timeoutMs = 20000, numberOptions = [] } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(exe, [], { cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let bytes = Buffer.alloc(0), stderr = '', done = false;
    const timer = setTimeout(() => finish(new Error(`Analyzer RPC timeout: ${method}`)), timeoutMs);
    function finish(error, result) {
      if (done) return; done = true; clearTimeout(timer);
      child.stdin.end(); child.kill();
      if (error) reject(error); else resolve(result);
    }
    child.on('error', error => finish(error));
    child.on('exit', code => { if (!done) finish(new Error(`Analyzer RPC exited ${code}: ${stderr}`)); });
    child.stderr.on('data', part => { stderr += part; });
    child.stdout.on('data', part => {
      bytes = Buffer.concat([bytes, part]);
      for (;;) {
        const boundary = bytes.indexOf('\r\n\r\n');
        if (boundary < 0) return;
        const length = Number(bytes.subarray(0, boundary).toString().match(/Content-Length:\s*(\d+)/i)?.[1]);
        if (!Number.isInteger(length)) return finish(new Error('Invalid RPC frame'));
        if (bytes.length < boundary + 4 + length) return;
        const message = JSON.parse(bytes.subarray(boundary + 4, boundary + 4 + length));
        bytes = bytes.subarray(boundary + 4 + length);
        if (message.id !== 1) continue;
        if (message.error) return finish(new Error(JSON.stringify(message.error)));
        return finish(null, message.result);
      }
    });
    const wireParams = { ...params, ...(params.inputs ? { inputs: { ...params.inputs, options: Object.fromEntries(Object.entries(params.inputs.options).map(([key, value]) => [key, numberOptions.includes(key) && typeof value === 'number' && Number.isInteger(value) ? JSON.rawJSON(value + '.0') : value])) } } : {}) };
    const body = Buffer.from(JSON.stringify({ jsonrpc: '2.0', id: 1, method, params: wireParams }));
    child.stdin.write(Buffer.concat([Buffer.from(`Content-Length: ${body.length}\r\n\r\n`), body]));
  });
}
