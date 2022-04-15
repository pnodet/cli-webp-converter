import test from 'ava';
import execa from 'execa';

test('main', async t => {
	await execa('./cli.js', ['--force']);
	t.pass();
});
