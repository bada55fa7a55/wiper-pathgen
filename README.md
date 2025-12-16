# Core One Wiper Path

Browser-based tool for generating a nozzle wiping path for the Prusa Core One that uses a Bambu Lab A1 (or equal) silicone wiper pad. The app guides you through calibrating the pad position, configuring plunge depth/feed rates, sketching the wiping path on an overlay of the pad, and exporting ready-to-run G-code.

https://wiper-pathgen.6d6178.com/

Built with SolidJS, Vite, and Tailwind CSS.

> This is an unofficial, community project. Always verify G-code before running it on your printer.

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

## Code quality
- `npm run lint` — lint the codebase with Biome
- `npm run format` — format files in-place
