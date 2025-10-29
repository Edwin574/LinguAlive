## LinguAlive

LinguAlive is a community-driven platform dedicated to documenting and preserving indigenous languages, starting with the Ogiek language. The project brings storytellers, elders, linguists, and learners together around a living archive of voice recordings enriched with human-provided context. LinguAlive focuses on respectful stewardship, accessibility, and a smooth path from an MVP to a production-grade system.

### What LinguAlive Is

- **A living audio archive**: Community members can record or upload short voice clips that capture songs, words, proverbs, greetings, conversations, and stories. Submissions include optional context like transcription, speaker details, and location to make recordings discoverable and meaningful.
- **A gentle, mobile-first experience**: The interface emphasizes low friction and clarity—large controls, clear feedback, and minimal mandatory fields—so contributors of varying technical familiarity can participate.
- **A bridge to long-term preservation**: The current client-only build stores data locally to enable rapid iteration and demos. The architecture, types, and UX are intentionally designed to transition cleanly to a server-backed system (Django, Postgres, object storage) for durable, shared preservation.

### Key Goals and Principles

- **Preserve voices faithfully**: Keep recordings in their original form and pair them with human context rather than auto-generated approximations. Context is optional but encouraged.
- **Honor the contributors**: Make it easy to contribute but clear what will be stored and how it may be used later. Emphasize informed participation and respectful defaults.
- **Design for longevity**: Choose patterns that scale from a one-device demo to a multi-user archive without major rewrites. Keep schemas explicit and portable.
- **Inclusive by design**: Favor readable typography, large hit targets, keyboard access, and motion that communicates meaning without distraction.

## Product Overview

### Core User Journeys

- **Contribute a recording**
  - Record directly in the browser or upload an audio file.
  - Optionally add a transcription, a theme (e.g., Song, Word, Proverb, Conversation, Greeting, Story), age range, gender, location, and additional context.
  - Receive instant feedback and see the contribution reflected in the library.

- **Explore the archive**
  - Search recordings by keywords that match transcription, theme, and location.
  - Filter by theme and scan a grid of well-presented cards.
  - Play audio inline with a simple, accessible player.

- **Reach out**
  - Share suggestions or partnership ideas via a contact form (stored locally in the client build, migrating to the backend later).


## Accessibility and Inclusivity

- High-contrast palette, large tap targets, and keyboard-operable controls.
- Descriptive labels and simple language to support a broad audience.
- Motion and animation are informative rather than decorative, and intensity is kept modest.


## Why This Matters

Indigenous language materials are often fragile, scattered, or locked in formats that don’t support daily use by communities. LinguAlive aims to make preservation participatory and practical—easy to contribute, easy to explore, and ready to grow from a local prototype into a shared, durable archive managed with community guidance.

## Repository Layout (Highlights)

- `client/` — SPA source (pages, components, hooks, UI primitives)
- `shared/` — shared types/schemas designed to align with future Django models
- `attached_assets/` — images and design artifacts for the experience
- `uploads/` — placeholder directory (unused in the client-only build)

This structure supports fast iteration today and sets a clean path toward a multi-service architecture tomorrow.


