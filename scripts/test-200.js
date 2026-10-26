import { spawn } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteBin = path.join(projectRoot, 'node_modules/vite/bin/vite.js');
const stationId = process.env.TEST_STATION_ID || '1';
const routesDirectory = path.join(projectRoot, 'src/routes');

if (!/^\d+$/.test(stationId)) {
	console.error('TEST_STATION_ID must be a numeric station ID.');
	process.exit(1);
}

async function getAvailablePort() {
	const server = createServer();
	server.listen(0, '127.0.0.1');
	await once(server, 'listening');
	const { port } = server.address();
	await new Promise((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
	});
	return port;
}

async function stopServer(server) {
	if (server.exitCode !== null || server.signalCode !== null) return;

	server.kill('SIGTERM');
	await Promise.race([once(server, 'exit'), new Promise((resolve) => setTimeout(resolve, 5000))]);
}

function toUrlPath(segments) {
	return `/${segments
		.filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))
		.map((segment) => {
			const restParam = segment.match(/^\[\.\.\.(.+)\]$/);
			const optionalParam = segment.match(/^\[\[(.+)\]\]$/);
			const param = segment.match(/^\[(.+)\]$/);
			if (restParam) return 'test';
			if (optionalParam || param) {
				const name = (optionalParam || param)[1];
				return name === 'id' ? stationId : 'test';
			}
			return segment;
		})
		.join('/')}`;
}

async function discoverGetUrls(directory = routesDirectory, segments = []) {
	const entries = await readdir(directory, { withFileTypes: true });
	const filenames = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));
	const urls = [];

	if ([...filenames].some((filename) => /^\+page(?:@[^/]*)?\.svelte$/.test(filename))) {
		urls.push(toUrlPath(segments));
	}

	const serverFile = [...filenames].find((filename) => /^\+server\.(ts|js|mjs)$/.test(filename));
	if (serverFile) {
		const source = await readFile(path.join(directory, serverFile), 'utf8');
		if (/\bexport\s+(?:const\s+)?GET\b|\bexport\s+(?:async\s+)?function\s+GET\b/.test(source)) {
			urls.push(toUrlPath(segments));
		}
	}

	for (const entry of entries) {
		if (entry.isDirectory()) {
			urls.push(
				...(await discoverGetUrls(path.join(directory, entry.name), [...segments, entry.name]))
			);
		}
	}

	return urls;
}

async function main() {
	const urls = [...new Set(await discoverGetUrls())].sort();
	const port = await getAvailablePort();
	const baseUrl = `http://127.0.0.1:${port}`;
	const server = spawn(
		process.execPath,
		[viteBin, 'dev', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
		{ cwd: projectRoot, stdio: 'inherit' }
	);
	let passed = true;

	try {
		let ready = false;
		const deadline = Date.now() + 45_000;

		while (Date.now() < deadline) {
			if (server.exitCode !== null) {
				throw new Error(`Vite server exited with code ${server.exitCode}.`);
			}

			try {
				const response = await fetch(`${baseUrl}/api/prakiraan`, {
					signal: AbortSignal.timeout(3000)
				});
				if (response.status < 500) {
					ready = true;
					break;
				}
			} catch {
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		}

		if (!ready) throw new Error('Vite server did not become ready within 45 seconds.');

		for (const route of urls) {
			const isProtectedAdminRoute =
				(route === '/admin' || route.startsWith('/admin/')) && route !== '/admin/login';
			const expectedStatus = isProtectedAdminRoute ? 303 : 200;
			try {
				const response = await fetch(`${baseUrl}${route}`, {
					redirect: 'manual',
					signal: AbortSignal.timeout(20_000)
				});
				if (response.status === expectedStatus) {
					console.log(`PASS ${route} returned ${expectedStatus}`);
				} else {
					passed = false;
					console.error(`FAIL ${route} returned ${response.status}, expected ${expectedStatus}`);
				}
			} catch (error) {
				passed = false;
				console.error(`FAIL ${route}: ${error.message}`);
			}
		}
	} finally {
		await stopServer(server);
	}

	if (!passed) process.exitCode = 1;
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
