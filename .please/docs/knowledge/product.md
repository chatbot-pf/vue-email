# vue-email — Product Guide

## Vision

Provide the best email authoring experience in the Vue ecosystem. Port React Email's proven design to Vue 3, enabling Vue developers to build email templates using familiar patterns.

## Target Users

- Vue.js/Nuxt.js developers who want to programmatically compose emails
- Teams managing marketing and transactional email templates as code
- Projects requiring cross-client compatibility (Gmail, Outlook, Apple Mail, etc.)

## Core Features

1. **Email Component Library**: 18 core components — Body, Button, Container, Heading, Image, Link, Section, Row, Column, and more
2. **Cross-Client Compatibility**: Consistent rendering across major email clients (Gmail, Outlook, Apple Mail)
3. **Dark Mode Support**: Emails that display correctly in dark mode environments
4. **Tailwind CSS Integration**: Converts Tailwind utility classes to inline styles
5. **TypeScript First**: Full type support for an enhanced developer experience

## Constraints

- Respect React Email's API design as much as possible, adapting to Vue 3 Composition API idioms
- Final output must be table-based HTML for email client compatibility
- Minimize runtime dependencies
- Support sub-path exports to enable tree shaking
