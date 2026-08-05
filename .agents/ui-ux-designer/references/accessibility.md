# Web Accessibility (WCAG)

## WCAG 2.2 Principles (POUR)

- **Perceivable**: Content must be presentable to at least one sense. Provide text alternatives, captions, adaptable layouts
- **Operable**: UI and navigation must be usable. All functionality via keyboard, give users enough time, don't cause seizures
- **Understandable**: Text readable, predictable behavior, input assistance
- **Robust**: Content must be interpretable by a wide range of user agents (screen readers, assistive tech)

## Conformance Levels

- **A** (minimum): 30 success criteria; essential support (e.g., non-text content has alt text)
- **AA** (target): 20 additional criteria; industry standard (color contrast 4.5:1, captions for live audio)
- **AAA** (gold): 28 additional criteria; specialized (contrast 7:1, sign language for prerecorded media)

## Color and Contrast

- **Normal text**: 4.5:1 minimum contrast ratio against background
- **Large text** (≥18px bold or ≥24px regular): 3:1 minimum
- **UI components and graphical objects**: 3:1 minimum
- **Non-text contrast**: Active UI elements, focus indicators, meaningful icons require 3:1
- **Tools**: WebAIM Contrast Checker, axe DevTools, Color Contrast Analyzer
- **Don't rely on color alone**: Use patterns, icons, or labels as redundant signals

## Semantic HTML

- **Landmarks**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- **Heading hierarchy**: Single `<h1>`, nested `<h2>`–`<h6>` without skipping levels
- **Lists**: `<ul>` / `<ol>` for grouped items; screen readers announce item count
- **Forms**: `<label>` associated via `for` attribute or wrapping; `<fieldset>` + `<legend>` for groups

## ARIA

- **Roles**: `role="button"`, `role="dialog"`, `role="alert"`, `role="tabpanel"` — only when native semantics insufficient
- **States and properties**: `aria-expanded`, `aria-pressed`, `aria-disabled`, `aria-current`, `aria-selected`
- **Live regions**: `aria-live="polite"`, `aria-live="assertive"`, `role="status"`, `role="alert"`
- **First rule**: Don't use ARIA if a native HTML element works (use `<button>` not `<div role="button">`)

## Keyboard Navigation

- **Tab order**: Logical DOM order; `tabindex="0"` for interactive, `tabindex="-1"` for scripted focus
- **Focus management**: Move focus after dynamic content changes (modals open, content loads, route changes)
- **Skip links**: First focusable element in page; hidden until focused (`skip-to-content`)
- **Roving tabindex**: For list-like widgets (tabs, menus); only one child has `tabindex="0"`, others `-1`

## Screen Reader Support

- **Alt text**: Concise, functional (`<img alt="Search">` not `<img alt="magnifying glass icon">`)
- **Descriptive links**: Link text conveys destination — avoid "click here" or "read more"
- **Announcements**: Use `aria-live` regions or a visually-hidden `.sr-only` class for dynamic updates
- **Status messages**: `role="status"` for non-critical updates, `role="alert"` for immediate info

## Focus Indicators

- **Visible focus**: `:focus-visible` pseudo-class; minimum 2px outline, 3:1 contrast against adjacent colors
- **Custom indicators**: `outline: 2px solid var(--color-focus); outline-offset: 2px`
- **Never**: `outline: none` without a visible replacement focus style

## Automated Testing Tools

- **axe DevTools**: Browser extension, CI integration (`@axe-core/playwright`, `@axe-core/cypress`)
- **Lighthouse**: Built into Chrome DevTools; accessibility score with actionable audits
- **WAVE**: Visual overlay showing issues, alerts, ARIA usage on page
- **Pa11y**: CLI tool for continuous integration pipelines

## Manual Testing

- **Keyboard-only**: Tab through all interactive elements; verify focus order, visible focus, no traps
- **Screen reader**: VoiceOver (macOS), NVDA (Windows), TalkBack (Android), VoiceOver (iOS)
- **Zoom 200%**: Content must not overflow or clip; text must reflow without horizontal scroll
- **Reduced motion**: `prefers-reduced-motion: reduce` media query disables animations, transitions, parallax
- **Reduced transparency**: `prefers-reduced-transparency: reduce` disables backdrop filters, opacity effects

## Touch Targets

- **Minimum 44x44px**: WCAG 2.5.8 Target Size (AA); applies to all interactive elements on touch devices
- **Sufficient spacing**: Inline links can be exempt if they are part of a sentence with adequate inter-line spacing
- **Pointer cancellation**: No down-event execution unless up-event confirms (no "fat finger" traps)
