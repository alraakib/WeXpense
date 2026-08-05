# Accessibility Testing

## WCAG (Web Content Accessibility Guidelines)

- **Principle 1 — Perceivable**: Text alternatives, captions, adaptable content, distinguishable (color contrast)
- **Principle 2 — Operable**: Keyboard accessible, enough time, no seizures (flashing <3Hz), navigable
- **Principle 3 — Understandable**: Readable language, predictable behavior, input assistance
- **Principle 4 — Robust**: Compatible with current/future user agents, assistive technologies
- **Levels**: A (minimum), AA (standard, most common target), AAA (highest, specialized)
- **WCAG 2.2 additions**: Focus appearance (AA), draggable movement (AA), accessible authentication (AA/AAA)

## Automated Accessibility Testing Tools

- **axe-core**: Deque's engine used by most tools; 90+ rules, CI integration, flows mode
- **WAVE**: Browser extension by WebAIM; visual overlay for issues, contrast checker, structure panel
- **Lighthouse**: Built into Chrome DevTools; accessibility audit as part of broader report
- **Pa11y**: CLI tool for CI pipelines; `pa11y-ci` for multi-page sitemap crawling
- **Accessibility Insights**: Microsoft's scan/assessment/ad hoc modes; guided assessments for WCAG 2.1 AA
- **CI integration**: `axe-core` via `@axe-core/playwright` or `cypress-axe`; fail builds on violations

---

## Manual Testing

- **Keyboard navigation**: Tab through all interactive elements; verify visible focus indicators, logical order, no keyboard traps
- **Screen reader**: NVDA (Windows, free) or VoiceOver (macOS built-in) — navigate by headings, landmarks, buttons, links
- **Zoom testing**: 200% browser zoom without horizontal scrolling or content loss
- **Color contrast**: 4.5:1 for normal text (AA), 3:1 for large text (18px+ bold or 24px+), 3:1 for UI components
- **Reduced motion**: Windows "Show animations" / macOS "Reduce motion" — ensure animations degrade gracefully

## Assistive Technology Support

- **Screen readers**: JAWS (most common Windows), NVDA (open source), VoiceOver (macOS/iOS), TalkBack (Android), Narrator (Windows)
- **Voice control**: Dragon NaturallySpeaking, Windows Speech Recognition, Apple Voice Control
- **Switch devices**: Single-switch scanning, dwell click, joystick controls
- **ARIA (Accessible Rich Internet Applications)**: Use semantic HTML first, ARIA as supplement
  - `role="button"`, `aria-label`, `aria-labelledby`, `aria-describedby`
  - `aria-expanded`, `aria-selected`, `aria-current`, `aria-hidden="true"`
  - `aria-live="polite"` / `"assertive"` for dynamic content regions
  - Never use `role="presentation"` on focusable elements

---

## Common Accessibility Issues

- Missing form labels (use `<label for="">` or `aria-label`)
- Low color contrast (ratio < 4.5:1 for body text)
- Non-descriptive link text ("click here" instead of "Download report")
- Missing heading hierarchy (skip levels, empty headings)
- No focus indicators (`:focus-visible` removed without replacement)
- Images missing `alt` text or decorative images with empty/null alt
- CAPTCHA without audio alternative

## Testing Tools by Category

| Category | Tools |
|---|---|
| Color contrast | WebAIM Contrast Checker, Colour Contrast Analyser (CCA) |
| Screen reader | NVDA, VoiceOver, JAWS |
| Automated scanning | axe-core, WAVE, Lighthouse, Pa11y |
| PDF accessibility | PAC 2024, Adobe Acrobat Accessibility Check |
| Mobile | Accessibility Scanner (Android), Xcode Accessibility Inspector (iOS) |

## Reporting & Governance

- Violation severity: Critical (keyboard trap, missing alt on meaningful image), Major (low contrast, missing label), Minor (heading skip, ARIA misuse)
- Track accessibility debt alongside technical/functional debt
- Use tracking tools: Deque WorldSpace, Level Access AMP, or custom axe-reporting dashboards
- Remediation SLAs: Critical (24h), Major (1 sprint), Minor (backlog with priority)
