# vue-email — Tech Stack

## Runtime & Language

| Layer     | Technology | Version     | Notes                    |
| --------- | ---------- | ----------- | ------------------------ |
| Runtime   | Bun        | 1.3.10      | Ultra-fast JS/TS runtime |
| Language  | TypeScript | strict mode | Primary language         |
| Framework | Vue 3      | latest      | Composition API only     |

## Package Management

- **Package Manager**: Bun (`bun install`, `bun add`)
- **Lockfile**: `bun.lock` (text format)
- **Version Manager**: mise (`.mise.toml`)

## Build & Tooling

| Tool                      | Purpose                         |
| ------------------------- | ------------------------------- |
| tsdown (Rolldown-powered) | Library build & bundling        |
| tailwindcss v4            | Tailwind CSS → inline styles    |
| css-tree                  | CSS AST parsing & manipulation  |
| commitlint                | Conventional commit enforcement |
| mise                      | Task runner & version manager   |

## CLI & Preview Server (`@mail-please/cli`)

| Layer             | Technology   | Notes                              |
| ----------------- | ------------ | ---------------------------------- |
| CLI framework     | Commander.js | CLI argument parsing               |
| Preview UI        | Nuxt 4       | Vue meta-framework                 |
| UI Components     | Nuxt UI 4    | Accessible component library       |
| Hot reload        | Socket.io    | Real-time file change broadcasting |
| File watching     | chokidar     | File system monitoring             |
| Template bundling | Vite SSR     | .vue/.tsx template compilation     |
| Code highlighting | Shiki        | Syntax highlighting                |
| Email sending     | Resend SDK   | Test email delivery                |

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
