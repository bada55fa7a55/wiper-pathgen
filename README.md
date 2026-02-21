# Core One Wiper Path Generator

For use with [Core One Nozzle Wiper V2 with Purge Bin](https://www.printables.com/model/1499858) and similar front-mounted nozzle wiper arms.

A browser-based tool for generating a nozzle wiping path for the Prusa Core One that uses a Bambu Lab A1 (or equal) silicone wiper pad. The app guides you through calibrating the pad position, configuring plunge depth/feed rates, sketching the wiping path on an overlay of the pad, and exporting ready-to-run G-code.

https://wiper-pathgen.6d6178.com/

> This is an unofficial, community project. Always verify G-code before running it on your printer.

Built with SolidJS, Vite, and Tailwind CSS.

## Prerequisites
- Node.js 20+ and npm
- Modern browser for running the UI locally

## Install dependencies
```bash
npm install
```

## Run the app in development
```bash
npm run dev
```
Then open the URL shown in the terminal (defaults to http://localhost:5173). The dev server reloads on file saves.

## Build for production
```bash
npm run build
```
Outputs the optimized static assets to `dist/`. You can sanity-check the build locally with:
```bash
npm run preview
```

### Material Symbols icon font

The icon font is a self-hosted subset containing only the icons used in the app (see `src/assets/fonts/`). To update the subset when adding new icons:

1. Build the full icon list from `symbol=` props and `msIcon=` props across the codebase.
2. Fetch a new subset from Google Fonts:
   ```
   https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=check,close,...
   ```
   Use a browser User-Agent header to get woff2 format.
3. Download the woff2 file and replace `src/assets/fonts/material-symbols-rounded-subset.woff2`.

## Code quality
- `npm run lint`: lint the codebase with Biome
- `npm run format`: format files in-place
