// Based off KilledByAPixel's build.bat file, for example:
// https://github.com/deathraygames/shikken-13k/blob/main/build.bat
// He's since improved it, doing what this file is doing:
// https://github.com/KilledByAPixel/LittleJS/blob/main/examples/js13k/build.js

// TODO:
// [ ] Remove whitespace from HTML
// [ ] Handle cssReplaceString
// [ ] Remove whitespace from CSS
// [ ] Use something like https://www.npmjs.com/package/css-minify for CSS
// [ ] Get roadroller working https://github.com/lifthrasiir/roadroller


import { exec } from 'child_process';
import fs from 'node:fs';
import CleanCSS from 'clean-css';

// Note: Roadroller can create code that vite (and maybe other servers?) don't like, so the
// built index.html won't be served by vite. For this reason I have roadroller turned off by
// default.
const USE_ROADROLLER = false;
const MAX_BYTES = 13312;
const ZIP_NAME = 'game.zip';
const BUILD_FOLDER = 'build';
const BUILD_FILENAME = 'index.js';
const OUTPUT_HTML_FILENAME = 'index.html';

const LOG_PATH = [BUILD_FOLDER, 'log.json'].join('/');
const SOURCE_HTML_PATH = 'index.html';
const ZIP_PATH = [BUILD_FOLDER, ZIP_NAME].join('/');
const OUTPUT_HTML_PATH = [BUILD_FOLDER, OUTPUT_HTML_FILENAME].join('/');

async function command(s) {
	return new Promise((resolve, reject) => {
		console.log('Command >>', s);
		exec(s, (err, stdout, stderr) => {
			if (err) {
				console.error(err);
				reject(err);
				return;
			}
			console.log(stdout);
			resolve(stdout);
		});
	});
}

function findReplaceString(html, code) {
	const i = html.indexOf(code);
	if (i === -1) {
		console.warn('No replace code', code);
		return '';
	}
	const chunks = html.split(code);
	return chunks[1].split('-->')[0].trim();
}

function findSource(replaceString) {
	let i = replaceString.indexOf('src=');
	if (i === -1) {
		i = replaceString.indexOf('href=');
		if (i === -1) {
			console.error('Could not find source (src or href)', replaceString);
			throw new Error('Could not findSource');
		}
		i += 5;
	} else {
		i += 4;
	}
	const spaceIndex = replaceString.indexOf(' ', i);
	const bracketIndex = replaceString.indexOf('>', i);
	const end = Math.min(spaceIndex, bracketIndex);
	return replaceString.substring(i, end).replaceAll('"', '');
}

function readLog() {
	let log = [];
	try {
		const logString = fs.readFileSync(LOG_PATH, 'utf8');
		log = JSON.parse(logString);
	} catch (err) {
		// no worries
	}
	return log;
}

function writeLog(log = [], size = null) {
	log.push({
		date: Number(new Date()),
		size,
	});
	const logString = JSON.stringify(log, null, ' ');
	fs.writeFileSync(LOG_PATH, logString);
}

async function clean() {
	console.log('Removing zip', ZIP_PATH);
	try {
		fs.unlinkSync(ZIP_PATH);
	} catch (err) {
		// no worries
	}
	await command(`rmdir /s /q ${BUILD_FOLDER}`);
	await command(`mkdir ${BUILD_FOLDER}`);
}

function buildHtml(htmlPath, jsPath) {
	let html = fs.readFileSync(htmlPath, 'utf8');
	console.log('Read original HTML', SOURCE_HTML_PATH, ':', html.length, 'characters');
	const jsReplaceString = findReplaceString(html, 'BUILD_JS:');
	const cssReplaceString = findReplaceString(html, 'BUILD_CSS:');
	html = html.replace(/<!--(.|\n)*?-->/g, ''); // Remove html comments
	html = html.replaceAll('\t', '');
	console.log('Removed comments:', html.length, 'characters');
	const js = fs.readFileSync(jsPath);
	if (jsReplaceString) {
		html = html.replace(jsReplaceString, `<script>\n${js}\n</script>`);
		console.log('Replaced', jsReplaceString, 'with', jsPath, ':', html.length, 'characters');
	}
	const cssPath = findSource(cssReplaceString);
	const css = fs.readFileSync(cssPath);
	if (cssReplaceString) {
		const minCss = (new CleanCSS({ level: 2 }).minify(css)).styles;
		html = html.replace(cssReplaceString, `<style>${minCss}</style>`);
		console.log('Replaced', cssReplaceString, 'with', cssPath, ':', css.length, ' --> ', minCss.length, 'characters');
	}
	// TODO: Compress HTML (At least remove tabs, remove line breaks)
	fs.writeFileSync(OUTPUT_HTML_PATH, html);
}

async function compressJavaScript() {
	const bundle_path = 'build/js_0_bundle.js';
	const closure_path = 'build/js_1_closure.js';
	const uglify_path = 'build/js_2_ugly.js';
	const roadrolled_path = 'build/js_3_roadroller.js';
	await command(`npx rollup ./src/game.js --file ${bundle_path} --format iife`);
	// fs.copyFileSync('build/game_bundle.js', 'build/game_bundle.js')
	await command(`npx google-closure-compiler --js=${bundle_path} --js_output_file=${closure_path} --compilation_level=SIMPLE --language_out=ECMASCRIPT_2019 --warning_level=VERBOSE --jscomp_off=* --assume_function_wrapper`);
	// more minification with uglify or terser (they both do about the same)
	await command(`npx uglifyjs -o ${uglify_path} --compress --mangle -- ${closure_path}`);
	if (!USE_ROADROLLER) return uglify_path;
	// roadroller compresses the code better then zip
	await command(`npx roadroller ${uglify_path} -o ${roadrolled_path}`);
	// TODO: Use roadrolled result instead of uglify
	return roadrolled_path;
}

async function zip() {
	await command(`.\\node_modules\\ect-bin\\vendor\\win32\\ect.exe -9 -strip -zip .\\${ZIP_PATH} ${OUTPUT_HTML_PATH}`);
	// ^ add additional file names separated by a space if needed, e.g.,  build\tiles.png;
	return ZIP_PATH;
}

async function checkSize(zipPath) {
	const { size } = fs.statSync(zipPath);
	const percent = Math.round(1000 * (size / MAX_BYTES)) / 10;
	console.log(
		'Max allowed for js13k: 13312 byes\nYour zip size:', size, '(', percent, '%)\n',
		(size === MAX_BYTES) ? 'Exact match!' : (
			(size > MAX_BYTES) ? `Too big! You need to decrease by ${MAX_BYTES - size} bytes.`
				: `You have room: ${MAX_BYTES - size} bytes`
		)
	);
	return size;
	// command(`npm run check`);
}

async function run() {
	const log = readLog();
	await clean();
	const jsPath = await compressJavaScript();
	await buildHtml(SOURCE_HTML_PATH, jsPath);
	const zipPath = await zip();
	const size = await checkSize(zipPath);
	writeLog(log, size);
}

run();
