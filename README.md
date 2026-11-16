# Vimal Resort — The Immersive Digital Experience

Cinematic, self-playing website for **Vimal Resort & Entertainment Park**, Gadag, Karnataka.

## Run
```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

## What's inside
- **Opening film** (`src/scenes/Arrival.tsx`): preloader → live "little planet" from the 8K drone 360° (`src/components/PlanetIntro.tsx`, WebGL) → real drone approach to the gate → Kling AI fly-over the arch → Flow AI buggy ride → drone orbit over the hills. Loops; never waits for scroll.
- **Discover** (`src/scenes/Discover.tsx`): aerial with hotspots pinned only where a zone is visible in the photo.
- **Space films** (`src/components/SpaceFilms.tsx`, `src/data/films.ts`): self-playing films for rooms, tents, adventure, pool, halls, lawn and restaurant, with style, details and published prices beside them.
- **Content data** in `src/data/` (resort facts, packages, zones, media manifest) with a source on every fact.
- `CONTENT_INVENTORY.md`: audit, verified facts, conflicts, asset manifest, what's still needed.
- `tools/films.py` + `tools/films.json`: renders the space films from real photos / 360° panoramas (Python, OpenCV, FFmpeg).

## Stack
React · Vite · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Three.js

## Media
AI-generated clips (Google Flow, Kling) are labelled on screen. Everything else is real resort photography, drone footage and 360° photos.
