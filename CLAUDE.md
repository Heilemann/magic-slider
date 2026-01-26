# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start the Vite dev server (runs the demo app from `demo/` directory)
- `npm run build` - Build the library (Vite build + TypeScript declarations)
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Architecture

This is an npm package (`react-magic-slider`) that exports a single React slider component.

### Key Files

- `src/index.tsx` - The complete Slider component implementation and all exports
- `src/main.tsx` - Entry point that re-exports from index.tsx
- `vite.config.ts` - Library build configuration (ES + UMD formats)
- `demo/` - Demo app for development, accessed via `npm run dev`

### Component Structure

The Slider component in `src/index.tsx` contains:
- CSS injection via `injectStyles()` - styles are embedded in JS, no separate CSS import required
- Sub-components: `SliderLabel`, `SliderValue`, `SliderHandle`, `ClickableArea` (memoized)
- Main `Slider` generic component supporting both controlled and uncontrolled modes
- Full accessibility: ARIA attributes, keyboard navigation (arrows, Home/End)
- Touch support for mobile devices

### Build Output

- `dist/index.esm.js` - ES module
- `dist/index.js` - UMD bundle (as "MagicSlider")
- `dist/index.d.ts` - TypeScript declarations
- External peer dependencies: `react`, `react-dom`, `@react-spring/web`
