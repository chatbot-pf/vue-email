# vue-email

A Vue port of [React Email](https://react.email). High-quality, unstyled components for creating emails using Vue and TypeScript.

It reduces the pain of coding responsive emails with dark mode support and takes care of inconsistencies between Gmail, Outlook, and other email clients.


## Getting Started

### Git Hooks Setup

Git hooks are managed with [mise](https://mise.jdx.dev/).

> [mise](https://mise.jdx.dev/getting-started.html) must be installed. Run `mise install` to automatically install bun and other required tools.

```bash
mise trust
mise install
mise run setup
```

`mise run setup` installs dependencies via `bun install`, then sets up a `commit-msg` hook so [commitlint](https://commitlint.js.org/) runs automatically on each commit.


## Components

Vue ports of React Email components.

- Body
- Button
- CodeBlock
- CodeInline
- Column
- Container
- Font
- Head
- Heading
- Hr (Divider)
- Html
- Img (Image)
- Link
- Markdown
- Preview
- Row
- Section
- Tailwind
- Text (Paragraph)


## Project Structure

```
vue-email/
├── vendor/
│   └── react-email/    # React Email source (git submodule)
├── package.json
├── .mise.toml
└── commitlint.config.mjs
```


## Claude Code Setup

1. Run Claude Code in the project directory:

```bash
claude
```

2. Run the setup skill to configure Claude Code for this project:

```
/claude-code-setup:claude-code-setup
```

3. Initialize the Please workspace:

```
/please:setup
```

4. Set up code review tools:

```
/review:setup
```


## Documentation

| Document | Description |
|----------|-------------|
| [Product Guide](.please/docs/knowledge/product.md) | Vision, target users, core features, and constraints |
| [Product Guidelines](.please/docs/knowledge/product-guidelines.md) | API design principles, component design, and code style |
| [Tech Stack](.please/docs/knowledge/tech-stack.md) | Runtime, frameworks, build tools, and dev commands |
| [Workflow](.please/docs/knowledge/workflow.md) | TDD lifecycle, quality gates, and branch strategy |
| [Tracks Index](.please/docs/tracks/index.md) | Active and completed implementation tracks |
| [Workspace Index](.please/INDEX.md) | Full directory map of the `.please/` workspace |


## References

- [React Email](https://github.com/resend/react-email) - Original project
- [engineering-standards](https://github.com/chatbot-pf/engineering-standards/)
- [claude-code-plugins](https://github.com/pleaseai/claude-code-plugins)
- [commitlint](https://commitlint.js.org/)
