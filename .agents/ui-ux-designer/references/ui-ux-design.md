# UI/UX Design Reference

## Design Systems
- Design tokens: colors, typography, spacing, shadows, animation
- Component library: Button, Input, Card, Modal, Dialog, Form, Table, etc.
- Documentation: Storybook, design token catalog, usage guidelines
- States: default, hover, focus, active, disabled, loading, empty, error

## Accessibility (WCAG 2.2 AA)
- Color contrast: 4.5:1 text, 3:1 large text
- Keyboard navigation: all interactive elements reachable and operable
- Screen reader: ARIA labels, landmarks, live regions, alt text
- Focus: visible focus indicators, logical tab order
- Forms: labels associated with inputs, clear error messages

## Responsive Design
- Mobile-first CSS
- Breakpoints: 640px (tablet), 1024px (desktop), 1440px (wide)
- CSS Grid + Flexbox for layouts
- Fluid typography with clamp()
- Images: responsive with srcset and sizes

## CSS Approaches
| Approach | Pros | Cons |
|----------|------|------|
| Tailwind | Fast, consistent, small bundle | Ugly HTML, learning curve |
| CSS Modules | Scoped, zero runtime | Separate files |
| CSS-in-JS (styled-components) | Dynamic styles, co-located | Runtime cost |
| Vanilla CSS | No dependencies | Naming conventions needed |
| Panda CSS | Zero-runtime, type-safe | Newer ecosystem |

## Form Design
- Labels: visible (not placeholders as labels)
- Validation: inline, real-time, clear error messages
- Input types: email, tel, number, date for optimal mobile keyboard
- Autocomplete: proper autocomplete attributes for browser suggestions
- Error recovery: preserve user input, show clear fix instructions
