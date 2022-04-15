#!/usr/bin/env node
import meow from 'meow';
import ora from 'ora';

const cli = meow(
	`
	Usage
	  $ cli …

	Options
	  --dry-run, -d  Blah blah blah

	Examples
	  $ cli
`,
	{
		importMeta: import.meta,
		flags: {
			dryRun: {
				type: 'boolean',
				alias: 'd',
			},
		},
	},
);

(async () => {
	if (cli.flags.dryRun) {
		console.log('with --dry-run');
	}

	const spinner = ora('Loading unicorns').start();
	console.log(cli.input);
	spinner.succeed();
})();
