# Design

FEEDBOX is a quiet, work-focused QA tool. Optimize for scanning, repeated actions, and clear state rather than decorative or marketing-style UI.

## Tailwind

- Use Tailwind CSS v4 and CSS-first configuration.
- Define the custom color system through Tailwind v4 theme variables.
- Use Tailwind's default tokens for spacing, sizing, typography, radius, shadow, and breakpoints.
- Do not add a custom non-color scale without an explicit design-system decision.
- Avoid arbitrary size utilities such as `w-[...]` or `text-[...]`. Use them only when an intrinsic format cannot be represented by a default token.

## Color Tokens

Color usage follows this strict order:

1. Semantic tokens: `surface`, `foreground`, `muted`, `border`, `primary`, `danger`, `success`, and their state variants.
2. Project primitives: explicitly defined brand and neutral ramps.
3. Nothing else.

Preferred:

```tsx
<div className="border-border bg-surface text-foreground" />
<button className="bg-primary text-on-primary hover:bg-primary-hover" />
```

Allowed only when no semantic meaning exists:

```tsx
<div className="bg-brand-100 text-brand-700" />
```

Forbidden:

- raw hex, RGB, HSL, or OKLCH values in components
- arbitrary color utilities such as `bg-[#...]`
- undefined Tailwind default colors such as `gray-*`, `indigo-*`, or `red-*`
- inline style colors

Official third-party brand assets may retain their official colors. Keep those colors inside the isolated asset or integration component; they are not application tokens.

## Token Semantics

- Name semantic tokens by purpose, never by hue.
- Define interaction states centrally: default, hover, active, focus, selected, and disabled.
- Components consume semantic tokens and must not resolve theme colors themselves.
- Opacity modifiers are allowed only on defined tokens.
- New color values require a primitive and a justified semantic mapping before use.

## Components

- Reuse existing components before creating new markup.
- Put generic UI primitives in `apps/web/components/ui`.
- Put domain-specific composites in `apps/web/features/<domain>/components`.
- Keep route files focused on page composition.
- Extract a component when UI repeats or owns meaningful variants, state, accessibility, or behavior.
- Component APIs express intent such as `variant="danger"` or `status="open"`, not raw color classes.
- Do not create abstractions for one simple static fragment.

## Icons

- Use Heroicons from `react-icons/hi2`.
- Import icons as `import { IconName } from "react-icons/hi2";`.
- Use `react-icons/hi` only when no suitable icon exists in `hi2`.
- Do not use other icon sets, hand-written SVG icons, or emoji as interface icons.
- Avoid icons in primary action buttons; primary actions should normally be text-only.
- Icon-only buttons are allowed only as ghost buttons for compact utility actions.
- Icon-only ghost buttons require an accessible name and a tooltip when the action is not universally understood.

## Interaction And Layout

- Every interactive state must include keyboard focus and disabled behavior where applicable.
- Meet WCAG AA contrast; never communicate status by color alone.
- Use stable responsive dimensions so labels, loading states, and dynamic content do not shift or overlap.
- Text must wrap or truncate intentionally at mobile and desktop widths.
- Prefer a subtle semantic border over shadows for surface separation.
- Reserve shadows for overlays that require elevation, such as menus, popovers, and modals.
- Scale radius with element size while preserving visual balance across the screen.
- Use only default radius tokens; nested elements should use the same or a smaller radius than their container.
- Reserve fully rounded shapes for avatars, status badges, and controls whose form requires them.
- Use cards only for repeated items, modals, or genuinely framed tools; do not nest cards.

## Migration

Existing raw colors and default palette classes are migration debt, not precedent. New UI follows this document. When editing an existing surface, migrate the touched component without expanding into an unrelated visual refactor.
