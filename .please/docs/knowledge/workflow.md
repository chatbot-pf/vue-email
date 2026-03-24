# vue-email — Workflow

## Development Principles

1. **TDD (Test-Driven Development)**: Write failing tests first, then implement to make them pass.
2. **High Code Coverage**: Maintain >80% code coverage across the project.
3. **Conventional Commits**: All commits follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
4. **Per-Task Commits**: Each task gets its own commit upon completion.

## Standard Task Lifecycle

1. **RED** — Write a failing test that defines the expected behavior
2. **GREEN** — Write the minimum code to make the test pass
3. **REFACTOR** — Clean up the implementation while keeping tests green
4. **COMMIT** — Commit the completed task with a conventional commit message

## Quality Gates

| Gate          | Threshold    | Tool            |
| ------------- | ------------ | --------------- |
| Unit Tests    | All passing  | Vitest          |
| Code Coverage | >80%         | Vitest coverage |
| Type Check    | No errors    | `tsc --noEmit`  |
| Commit Lint   | Conventional | commitlint      |

## Phase Completion Protocol

1. Run all tests: `vitest run`
2. Verify type checking: `tsc --noEmit`
3. Review coverage report
4. Wait for user confirmation before proceeding to next phase

## Development Commands

```bash
# Install dependencies
bun install

# Run tests (watch mode)
vitest

# Run tests (single run)
vitest run

# Run tests with coverage
vitest run --coverage

# Type check
tsc --noEmit

# Lint commit message
commitlint --edit
```

## Branch Strategy

- `main` — stable release branch
- `feat/<track-slug>` — feature development branches
- `fix/<track-slug>` — bugfix branches
