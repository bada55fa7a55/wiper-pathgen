import { SHARE_PARAM } from './common';

export function clearShareTokenFromUrl() {
  window.location.hash = '';
}

export function getShareTokenFromUrl(): string | null {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash);
  return params.get(SHARE_PARAM);
}
