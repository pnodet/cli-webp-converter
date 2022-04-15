#!/usr/bin/env node
import {
	accessSync,
	rmSync,
	constants,
	createWriteStream,
	mkdtempSync,
} from 'node:fs';
import process from 'node:process';
import stream from 'node:stream';
import {promisify} from 'node:util';
import meow from 'meow';
import ora from 'ora';
import sharp from 'sharp';
import got from 'got';

const cli = meow(
	`
	Usage
	  $ cli-wepb-converter <url>

	Options
	  --png  Download the image as png rather than jpeg
	
	Example
		$ cli-wepb-converter 'https://www.gstatic.com/webp/gallery/4.sm.webp'
`,
	{
		importMeta: import.meta,
		flags: {
			png: {
				type: 'boolean',
			},
		},
	},
);

let spinner = ora(`Loading...`).start();
const {input} = cli;

if (input.length === 0) {
	spinner.fail('Specify an url.');
	process.exit(1);
}

const format = cli.flags.png ? 'png' : 'jpeg';
const imageID = `image.webp`;
const imageResultID = `output.${format}`;
const imageUrl = input[0];
const directory = mkdtempSync(`tmp`);
const options = {
	png: {quality: 100, force: true},
	jpeg: {quality: 100, chromaSubsampling: '4:4:4', force: true},
};

spinner.text = 'Checking access to directory';

try {
	accessSync(`./`, constants.R_OK | constants.W_OK);
	spinner.succeed(`Can read/write in the directory`);
} catch {
	spinner.fail(`No access to the current directory.`);
	process.exit(1);
}

const pipeline = promisify(stream.pipeline);
const downloadImage = async (url, imagePath) =>
	pipeline(got.stream(url), createWriteStream(imagePath));

(async () => {
	spinner = ora(`Downloading image from ${input[0]}...`).start();
	await downloadImage(imageUrl, `./${directory}/${imageID}`);
	spinner.succeed(`Image succesfully downloaded`);
	spinner = ora(`Converting image...`).start();

	switch (format) {
		case 'png':
			await sharp(`./${directory}/${imageID}`)
				.toFormat(`${format}`)
				.png(options.png)
				.toFile(`./${imageResultID}`);
			break;

		case 'jpeg':
		default:
			await sharp(`./${directory}/${imageID}`)
				.toFormat(`${format}`)
				.jpeg(options.jpeg)
				.toFile(`./${imageResultID}`);
			break;
	}

	spinner.succeed(`Image succesfully converted`);
	spinner = ora(`Removing temporary files...`).start();
	rmSync(directory, {recursive: true});
	spinner.succeed(`Image availabe here: ${import.meta.url}/${imageResultID}`);
})().catch(error => {
	console.log(error);
	process.exit(1);
});
