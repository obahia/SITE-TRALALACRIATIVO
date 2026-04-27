# Learnings — Redesign Tralalá Criativo

## Conventions & Patterns

_(Agents will append findings here after each task)_

## Task 2: Vitest + Testing Library Setup

### Key Findings
- **Vitest Configuration**: Simple setup with jsdom environment works out of the box
- **No Path Aliases Yet**: vite.config.js doesn't define resolve.alias, so vitest.config.js kept minimal
- **Setup File Pattern**: @testing-library/jest-dom must be imported in setup file for matchers like toBeInTheDocument()
- **Globals Pattern**: Vitest globals: true allows using describe/it/expect without imports

### Successful Patterns
1. **Minimal vitest.config.js**: Only needs environment, globals, and setupFiles
2. **Smoke Test Structure**: Simple component render + assertion validates entire setup
3. **Test Scripts**: Both "test" (run once) and "test:watch" (watch mode) are useful

### Dependencies Installed
- vitest@4.1.5
- @testing-library/react (latest)
- @testing-library/jest-dom (latest)
- @testing-library/user-event (latest)
- jsdom (latest)

### Next Steps
- Task 13 will add business logic tests
- Path aliases should be added to both vite.config.js and vitest.config.js when needed
