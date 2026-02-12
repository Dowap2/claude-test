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

## 코딩 규칙

### 일반

- 모든 주석은 한국어로 작성
- 변수명/함수명은 camelCase, 컴포넌트명은 PascalCase
- 가능하면 `any` 타입 사용 금지, 명확한 타입 정의

### 컴포넌트

- 컴포넌트는 반드시 `src/components/` 에 생성
- 비즈니스 로직은 커스텀 훅으로 분리 (`src/hooks/`)
- 하나의 컴포넌트가 너무 커지면 작게 쪼개기

### API

- API 호출 로직은 `src/lib/` 또는 `src/api/` 에 분리
- 모든 API 호출은 try/catch로 감싸기
- 에러는 사용자에게 명확하게 표시

### 상태 관리

- 서버 상태는 React Query 사용
- 클라이언트 상태는 useState / Zustand 사용

### 스타일

- Tailwind CSS 사용, 인라인 스타일 금지
- 반응형은 모바일 우선 (mobile-first)
