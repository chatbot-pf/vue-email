# vue-email — Tech Stack

## Runtime & Language

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Runtime | Bun | 1.3.10 | Ultra-fast JS/TS runtime |
| Language | TypeScript | strict mode | Primary language |
| Framework | Vue 3 | latest | Composition API only |

## Package Management

- **Package Manager**: Bun (`bun install`, `bun add`)
- **Lockfile**: `bun.lock` (text format)
- **Version Manager**: mise (`.mise.toml`)

## Build & Tooling

| Tool | Purpose |
|------|---------|
| tsdown (Rolldown-powered) | Library build & bundling |
| commitlint | Conventional commit enforcement |
| mise | Task runner & version manager |

## Testing

- **Test Runner**: Vitest (`vitest`)
- **Strategy**: HTML snapshot testing for component render output

## Development Commands

```bash
# Install dependencies
bun install

# Run tests
vitest

# Lint commit messages
commitlint --edit

# mise setup (git hooks, dependencies)
mise trust && mise install && mise run setup
```
