# Figma Design-to-Development Workflow

## Figma Variables

- **Local vs linked**: Local variables scoped to a file; linked (publish as library) variables shared across team files
- **Variable modes**: Used for themes (light/dark, brand A/B); each mode holds different values for the same variable name
- **Token mapping**: Figma variable collection → design token category (e.g., `primitives/blue-600` → `color.primary`)
- **Restrictions**: Variables can't yet reference other variables in all contexts; Style Dictionary + Figma Tokens plugin bridges gap
- **Export**: Figma Tokens plugin exports to JSON; usable with Style Dictionary directly

## Figma API

- **REST API**: Fetch file nodes, component metadata, styles, and images via `GET /v1/files/:key`
- **Component properties**: Read `componentPropertyDefinitions` for boolean, instance swap, text, variant properties
- **Image export**: `GET /v1/images/:key` with `ids`, `format`, `scale` params; supports PNG, JPG, SVG, PDF
- **Webhooks**: `FILE_UPDATE`, `FILE_VERSION_CHANGE` triggers for auto-sync pipelines
- **Plugin API**: `figma.getNodeById`, `figma.currentPage.selection` for reading node trees

## Dev Mode Inspection

- **CSS copy**: One-click copy of computed CSS (layout, typography, fills, strokes, effects) per layer
- **Measurements**: Select layers to see distances, alignment guides, padding between siblings
- **Asset export**: Right-click → Export with `@2x`, `@3x` suffixes; SVG with merged paths when possible
- **Section annotations**: Redlines, descriptions, and links added by designers visible in Dev Mode
- **Code snippets**: Auto-generated React, SwiftUI, or Kotlin Compose code from component properties

## Component Property Mapping

- **Boolean props**: `variant="primary"`, `disabled={true}` → maps to Figma boolean property toggles
- **Instance swap**: Slot-based children; `icon={<SearchIcon />}` swaps icon instances
- **Text props**: `label="Submit"` drives Figma text-layer content overrides
- **Variant props**: `size="sm"`, `size="lg"` maps to Figma variant combos
- **Convention**: Keep Figma property names kebab-cased, map to camelCase in code

## Responsive Breakpoints

- **Design in fixed widths**: Desktop 1440px, Tablet 768px, Mobile 375px
- **Auto layout**: Figma Auto Layout with `hug`, `fill`, `fixed` constraints emulates CSS flexbox
- **Grid systems**: 12-column grids in design files; CSS Grid `repeat(12, 1fr)` alignment
- **Breakpoint tokens**: Match CSS breakpoints exactly — `breakpoint.md = 768px` in both Figma and style-dictionary

## Asset Export

- **SVG optimization**: Export SVG, then run through SVGO (`npx svgo icon.svg`) to strip metadata
- **Responsive images**: Export at 1x, 2x, 3x; use `<picture>` + `srcSet` for art-directed crops
- **Format selection**: Vector → SVG, photos → WebP/AVIF, icons → SVG sprite or icon font (avoid)
- **Naming**: `icon-{name}-{size}.svg` matching component hierarchy; avoid Figma auto-generated hashes
- **Batch export**: Use Figma Export API or plugins to download all assets in one pipeline

## Spacing and Grid Systems

- **8px grid**: All spacing, padding, margins in increments of 8px (`8, 16, 24, 32, 40...`)
- **4px baseline**: Dense UI elements can use 4px steps for fine-tuning (`4, 12, 20`)
- **Auto Layout spacing**: Figma Auto Layout `gap` equals CSS `gap`; `padding` maps to component token
- **Consistency**: A single spacing scale used across both design tokens and CSS utility classes

## Typography Scale Generation

- **Modular scale**: Ratio-based sizing (e.g., 1.25 Major Third); `text-sm: 14px`, `text-base: 16px`, `text-lg: 20px`...
- **Type ramp tokens**: `typography.heading.1` through `typography.caption`
- **Line-height**: Computed as unitless multiplier (`1.5` for body, `1.2` for headings) for accessibility
- **Font stacks**: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI'...`) vs web fonts (`@font-face` + `font-display: swap`)

## Color Palette Generation

- **Primitives → semantic**: Base palette (blue-50 through blue-900) → semantic alias (`color.text.link = blue-600`)
- **OKLCH color space**: More perceptually uniform than HSL; better interpolation for dark themes
- **Contrast verification**: Validate every foreground + background combination from Figma against WCAG 4.5:1
- **Opacity tokens**: Avoid; prefer solid tints (`blue-100` vs `blue-600 at 20% opacity`) for consistency across themes
