# vue-email — Product Guidelines

## API Design Principles

1. **React Email API Alignment**: Keep component names and props as close to React Email as possible, so users can reference React Email documentation.
2. **Vue 3 Idioms**: Use Composition API, `defineComponent`, slots, `v-bind`, and other Vue-native patterns.
3. **Simplicity First**: Each component has a single responsibility. Minimize internal state.

## Component Design

- All components are **unstyled** — styling is controlled by the user
- `style` prop for direct inline style injection
- Default slot for content insertion (child components/text)
- Standard HTML attributes pass through via `$attrs`

## Code Style

- **Language**: TypeScript first, strict type definitions
- **File Naming**: kebab-case (`e-button.tsx`, `e-container.tsx`)
- **Component Prefix**: `E` (Email) — `EButton`, `EContainer`, `EHeading`
- **Composable Prefix**: `use` (Composition API composables)
- **Testing**: Verify each component's render output with HTML snapshots

## Documentation

- JSDoc comments on all public APIs
- Specify the corresponding React Email component
- Include example code
