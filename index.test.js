const postcss = require('postcss');
const { equal } = require('node:assert');
const { test } = require('node:test');

const plugin = require('./dist');

async function run(input, output, opts = {}) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined });
  equal(result.css, output);
  equal(result.warnings().length, 0);
}

test('does something', async () => {
  await run('a{ }', 'a{ }', {});
});
