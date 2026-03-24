# Core Email Components

## Summary

Port the foundational React Email components to Vue 3 using Composition API and TypeScript. This track establishes the component library's core architecture and delivers the essential building blocks for composing emails.

## Goals

- Provide Vue 3 equivalents for all core React Email components
- Maintain API compatibility with React Email where possible
- Ensure cross-client email rendering compatibility
- Establish project structure, build pipeline, and testing patterns

## Components in Scope

| Vue Component | React Email Equivalent | Purpose |
|--------------|----------------------|---------|
| `EHtml` | `<Html>` | Root email wrapper |
| `EHead` | `<Head>` | Email head section |
| `EBody` | `<Body>` | Email body wrapper |
| `EContainer` | `<Container>` | Centered content container |
| `ESection` | `<Section>` | Table-based section |
| `ERow` | `<Row>` | Table row |
| `EColumn` | `<Column>` | Table cell |
| `EText` | `<Text>` | Paragraph text |
| `ELink` | `<Link>` | Anchor link |
| `EButton` | `<Button>` | Call-to-action button |
| `EHeading` | `<Heading>` | h1-h6 headings |
| `EHr` | `<Hr>` | Horizontal rule |
| `EImg` | `<Img>` | Image |
| `EPreview` | `<Preview>` | Preview text |
| `EFont` | `<Font>` | Web font declaration |

## Out of Scope

- `Tailwind` component (separate track)
- `Markdown` component (separate track)
- `CodeBlock` / `CodeInline` components (separate track)
- Email preview server / dev tools
- npm publishing and CI/CD

## Success Criteria

- All 15 components render valid email-compatible HTML
- Snapshot tests pass for each component
- TypeScript strict mode — no type errors
- Components accept `style` prop and pass through `$attrs`
