# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lumicrea is a Spec-Driven-Development (SDD) demo pack: a premium, immersive front-end showcase for a design switches/outlets brand (collection "Vendôme"). The Nuxt app lives in `src/`; everything else at the repo root (`docs/`) is the specification the app must follow.

**Read before changing code**: the docs under `docs/` are the source of truth for scope, copy, design direction and acceptance criteria — not just background reading. In particular:
- `docs/README.md` — index and SDD working method (read specs before touching code, don't invent prices/stock/certifications, don't copy reference sites verbatim).
- `docs/04-technique/TECHNICAL_SPEC.md` — stack, layering rules, Nuxt/SSR rules, Three.js lifecycle, materials, asset loading.
- `docs/adr/0001-architecture-en-couches.md` and `0002-three-direct-plutot-que-tresjs.md` — the two binding architecture decisions (layered/hexagonal architecture; Three.js used directly, no TresJS).
- `docs/04-technique/ACCEPTANCE_CRITERIA.md`, `docs/06-planning/CHECKLIST_DEMO.md` — what "done" means for the demo.

## Commands

Run from `src/` (the Nuxt project root):

```
npm run dev       # nuxt dev --port 15349
npm run build     # nuxt build
npm run preview   # nuxt preview
```

There is no test runner or lint script configured yet in `package.json`, despite `TECHNICAL_SPEC.md` listing `vitest`/`@nuxt/eslint` as the target stack — check `package.json` before assuming either is available.

## Architecture

Layered/hexagonal architecture (ADR 0001), dependencies point inward toward the domain:

```
Presentation (pages/, components/) → Application (composables/) → Domain ← Infrastructure (adapters/)
```

- **`domain/`** — pure TypeScript. Must never import `vue`, `nuxt`, `three`, or `gsap`. Holds entities (e.g. `domain/product/Finish.ts`) and ports/interfaces (e.g. `domain/scene/SceneRenderer.ts`, `domain/scene/ProductViewer.ts`).
- **`adapters/`** — concrete implementations of domain ports. `adapters/three/` implements the 3D rendering ports directly with Three.js (`ThreeSceneRenderer`, `ThreeProductViewer`, plus mesh/texture/interaction helpers). No GSAP adapter exists yet even though it's anticipated in the spec.
- **`providers/container.ts`** — the *only* place that wires ports to concrete adapter implementations. Adapters are imported dynamically here (`await import(...)`) specifically so Three.js stays out of the initial bundle. New ports/adapters should be wired the same way, not imported directly from composables or components.
- **`composables/`** — application layer; orchestrate use cases through domain ports (e.g. `useOrder.ts`, `useCart.ts`, `useTheme.ts`). Should depend on domain interfaces, not reach into `adapters/` directly.
- **`components/`** — presentation, thin and without business logic. Organized by role: `layout/`, `sections/` (home page sections), `product/`, `scene/`, `shop/`, `ui/`.
- **`data/`** — static typed demo data (`collections.ts`, `finishes.ts`, `finishPhotos.ts`, `mechanisms.ts`, `pricing.ts`). This stands in for the "infrastructure/data" adapter described in the spec; keep finish/product names centralized here rather than duplicated across components.

Nuxt config note: `nuxt.config.ts` sets `srcDir: '.'` and registers components with `pathPrefix: false` — component subfolders are for organization only and don't become part of the component's tag name.

## Key constraints to respect when editing

- **No `window`/`document`/WebGL access during SSR.** Three.js must only initialize client-side; components doing WebGL work are `*.client.vue` (see `SceneCanvas.client.vue`, `ProductViewerCanvas.client.vue`) or initialize post-mount.
- **Three.js lifecycle is manual**: on unmount, cancel animations, remove listeners, and dispose geometries/materials/textures/render targets/renderer explicitly (no framework handles this for you).
- **Core content and CTAs must work without WebGL** — always provide a fallback path (`SceneFallback.vue`).
- **Don't add dependencies speculatively.** TresJS, `@nuxt/ui`, Tailwind, and Pinia are deliberately excluded (ADR 0002, `TECHNICAL_SPEC.md` §1) — the client wants hand-written code, not assembled components. Check the spec before adding any new package.
- **Don't invent product facts.** No prices, stock, certifications, or commercial promises beyond what's in `data/` or the docs.
