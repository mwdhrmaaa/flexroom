# Flexroom

> Premium Gaming Achievements Showcase & Trophy Card Generator

Flexroom is a minimalist web application for archiving personal gaming milestones and generating high-resolution digital trophy cards (*Flexcards*) ready for sharing.

---

## Architectural Highlights

* **Semantic Atomic Structure**: Zero monolithic God-files. The application is refactored into focused, single-responsibility ES modules with a ~150-line soft cap per file.
* **Canvas Trophy Engine**: Modular canvas rendering pipeline supporting multiple distinct aesthetic layouts (`brutalist`, `crimson`, `cyber`).
* **Containerized Trifecta**: Single-enter bash orchestration (`deploy.sh`, `redeploy.sh`, `runtest.sh`) paired with production Nginx Docker containerization.
* **Resilient Client Storage**: Type-checked, XSS-escaped localStorage persistence with fallback mechanisms for corrupted records.
* **Automated Test Coverage**: Native Node.js test suite covering storage validation, dimension scaling, and canvas frame positioning.

---

## Project Structure

```text
flexroom/
├── Dockerfile                  # Production Nginx 1.25-alpine SPA server
├── docker-compose.yml          # Container orchestration (port 8080)
├── deploy.sh                   # Single-enter test-and-deploy bundle
├── redeploy.sh                 # Zero-friction git pull and redeploy bundle
├── runtest.sh                  # Isolated automated test runner
├── package.json                # Project manifest and test runner commands
├── index.html                  # Semantic application markup
├── css/
│   ├── base.css                # Core design tokens, resets, and glass utilities
│   ├── layout.css              # App shell, sticky header, and hero layout
│   ├── cards.css               # Achievement card and dynamic grid styling
│   ├── upload_modal.css        # Dropzone and upload modal styles
│   ├── share_modal.css         # Flexcard preview and template switcher styles
│   └── style.css               # Aggregator root stylesheet
├── src/
│   ├── app.js                  # Modular entrypoint and DOM event wiring
│   ├── core/
│   │   └── storage/
│   │       └── achievement_storage.js  # Storage persistence and validation
│   └── features/
│       ├── achievements/
│       │   ├── achievement_card.js     # Card markup and SVG icons
│       │   └── achievement_grid.js     # Grid rendering and slot balance
│       ├── modals/
│       │   ├── upload_modal.js         # Upload dropzone and form handling
│       │   └── share_modal.js          # Template switcher and PNG export
│       ├── upload/
│       │   └── image_compressor.js     # Aspect-ratio canvas compression
│       └── trophy_generator/
│           ├── canvas_context.js       # Offscreen canvas setup and bounds
│           ├── trophy_generator.js     # Template registry and dispatcher
│           └── templates/
│               ├── brutalist_template.js
│               ├── crimson_template.js
│               └── cyber_template.js
└── tests/
    ├── storage.test.js
    ├── image_compressor.test.js
    └── trophy_generator.test.js
```

---

## Quickstart

### 1. Single-Enter Shell Deployment
```bash
./deploy.sh
```

### 2. Docker Compose
```bash
docker compose up -d --build
```
Access endpoint: `http://localhost:8080`

### 3. Local Development (Node.js)
```bash
npm run dev
```

---

## Testing

Run the automated test runner:
```bash
npm test
# or via bash bundle:
./runtest.sh
```

---

## License

MIT License. Authored by [Mahendra Wira Dharma](https://github.com/mwdhrmaaa).
