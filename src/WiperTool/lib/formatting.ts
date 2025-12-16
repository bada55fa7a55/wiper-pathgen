import { umToMm } from './conversion';

export function formatMicronsToMmString(microns: number | undefined) {
  return microns === undefined ? '' : umToMm(microns).toFixed(2);
}

export function formatDateISO(date: Date) {
  const pad = (value: number, length = 2) => value.toString().padStart(length, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}
