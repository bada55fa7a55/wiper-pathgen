import { execSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import type { HtmlTagDescriptor, Plugin } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import solid from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';
import { siteDescription, siteHtmlTitle, siteTitle } from './siteMeta';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const buildTimestamp = new Date().toISOString();
const gitHash = (() => {
  try {
    return execSync('git rev-parse HEAD', { cwd: projectRoot, stdio: 'pipe' }).toString().trim();
  } catch {
    return 'unknown';
  }
})();

const simpleAnalyticsPlugin = (enabled: boolean, hostname?: string): Plugin => ({
  name: 'simple-analytics-inline-events',
  transformIndexHtml(html: string) {
    if (!enabled) {
      return html;
    }

    const hostnameAttr: HtmlTagDescriptor['attrs'] = hostname ? { 'data-hostname': hostname } : {};

    const tags: HtmlTagDescriptor[] = [
      {
        tag: 'script',
        injectTo: 'body',
        attrs: {
          async: true,
          defer: true,
          src: 'https://wiper-pathgen.6d6178.com/proxy.js',
          'data-simple-analytics': 'true',
          ...hostnameAttr,
        },
      },
      {
        tag: 'script',
        injectTo: 'body',
        attrs: {
          async: true,
          src: 'https://wiper-pathgen.6d6178.com/inline-events.js',
          ...hostnameAttr,
        },
      },
    ];

    return { html, tags };
  },
});

const siteMetaPlugin = (siteUrl: string, googleSiteVerification?: string): Plugin => ({
  name: 'site-meta-inject',
  transformIndexHtml(html) {
    const replaced = html
      .replaceAll('%APP_SITE_URL%', siteUrl)
      .replaceAll('%APP_TITLE%', siteTitle)
      .replaceAll('%APP_DESCRIPTION%', siteDescription)
      .replaceAll('%APP_HTML_TITLE%', siteHtmlTitle);

    const tags: HtmlTagDescriptor[] = [];
    if (googleSiteVerification) {
      tags.push({
        tag: 'meta',
        injectTo: 'head',
        attrs: { name: 'google-site-verification', content: googleSiteVerification },
      });
    }

    return { html: replaced, tags };
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '');
  const siteUrl = (env.VITE_SITE_URL || 'https://wiper-pathgen.6d6178.com').replace(/\/+$/, '');
  const googleSiteVerification = env.GOOGLE_SITE_VERIFICATION || undefined;
  const simpleAnalyticsEnabled = env.VITE_SA_ENABLED === 'true';
  const simpleAnalyticsHostname = env.VITE_SA_HOSTNAME || undefined;

  return {
    define: {
      __BUILD_DATE__: JSON.stringify(buildTimestamp),
      __GIT_HASH__: JSON.stringify(gitHash),
    },
    plugins: [
      tailwindcss(),
      solid({ ssr: true }),
      tsconfigPaths(),
      simpleAnalyticsPlugin(simpleAnalyticsEnabled, simpleAnalyticsHostname),
      siteMetaPlugin(siteUrl, googleSiteVerification),
    ],
    resolve: {
      //dedupe: ['solid-js', 'solid-js/web', 'solid-js/store'],
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    optimizeDeps: {
      // include: ['solid-js', 'solid-js/web', 'solid-js/store'],
    },
  };
});
