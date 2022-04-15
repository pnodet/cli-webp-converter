import fs from 'node:fs';
import test from 'ava';
import execa from 'execa';

test('main', async t => {
	await execa('./cli.js', ['https://www.gstatic.com/webp/gallery/4.sm.webp']);
	t.true(fs.existsSync('./output.jpeg'));
});
