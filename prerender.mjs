import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, 'dist');
const clientHtmlPath = path.resolve(distDir, 'index.html');
const ssrEntryPath = path.resolve(distDir, 'server/entry-server.js');

const template = await readFile(clientHtmlPath, 'utf-8');
const { render } = await import(pathToFileURL(ssrEntryPath).href);

const { html: appHtml, styles } = await render();
const htmlWithApp = template.replace('<!--app-html-->', appHtml);
const html = styles ? htmlWithApp.replace('</head>', `${styles}</head>`) : htmlWithApp;

if (htmlWithApp === template) {
  throw new Error('Failed to inject prerendered HTML (placeholder not found)');
}

await writeFile(clientHtmlPath, html, 'utf-8');
console.log('Pre-rendered app shell written to dist/index.html');
