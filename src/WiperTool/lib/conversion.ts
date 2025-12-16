export function umToMm(microns: number) {
  return microns / 1000;
}

export function mmToUm(microns: number) {
  return Math.round(microns * 1000);
}
