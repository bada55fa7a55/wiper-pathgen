import { SHARE_PARAM } from './common';

export function clearShareTokenFromUrl() {
  window.location.hash = '';
}

export function getShareTokenFromUrl(): string | null {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash);
  return params.get(SHARE_PARAM);
}

export function buildShareUrl(token: string): string {
  const url = new URL(window.location.href);
  const params = new URLSearchParams();
  params.set(SHARE_PARAM, token);
  url.hash = params.toString();
  return url.toString();
}
