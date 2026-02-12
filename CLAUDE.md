# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (uses flat config with core-web-vitals + typescript rules)
- No test runner is configured

## Architecture

This is a Next.js 16 project using the **App Router** (`src/app/`), React 19, TypeScript (strict mode), and Tailwind CSS v4.

- **Path alias**: `@/*` maps to `./src/*`
- **React Compiler** is enabled in `next.config.ts` for automatic memoization
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font/google`, applied as CSS variables
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`; dark mode via `prefers-color-scheme` and Tailwind `dark:` utilities; theme variables defined in `src/app/globals.css`
