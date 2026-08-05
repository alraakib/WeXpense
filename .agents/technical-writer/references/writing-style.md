# Technical Writing Style Reference

## Google Developer Documentation Style Guide

- **Use active voice**: "The API returns a JSON object" not "A JSON object is returned"
- **Present tense**: "The server starts" not "The server will start"
- **Second person**: "You can configure" or imperative "Configure the timeout"
- **Short sentences**: <20 words for instructions, <25 for explanations
- **Parallel structure**: Lists should have consistent grammar ("Install...", "Configure...", "Run...")
- **Positive form**: "Use HTTPS" not "Don't use HTTP" — tell users what to do

## Microsoft Style Guide

- **Consistent terminology**: Pick one term and use it throughout (e.g., "click", not "press/select/tap")
- **Abbreviations**: Spell out on first use: "API (Application Programming Interface)"
- **Numbers**: Spell out 0-9, use numerals for 10+
- **Dates**: Use ISO 8601 (2026-05-30) for international audiences
- **UI elements**: Bold labels, quotation marks for phrases: "Select **Save**."
- **Procedures**: Use numbered lists for sequential steps, bullet lists for options

## Active vs Passive Voice

| Passive (avoid) | Active (prefer) |
|-----------------|-----------------|
| The button should be clicked | Click **Save** |
| The error is logged by the server | The server logs the error |
| The configuration file can be found at... | Find the configuration file at... |
| It is recommended that... | We recommend... |

- Exception: Use passive when the actor is unknown or irrelevant: "The connection was closed" (don't know who closed it)

## Consistent Terminology

- Create a glossary file (`docs/glossary.md`) for project-specific terms
- Never use synonyms for the same concept (e.g., "delete", "remove", "erase" should be one term)
- Define terms on first use: "The **shard** (a horizontal partition of the database)..."
- Use `:` or **bold** for term definitions, not quotes
- Reject ambiguous language: "soon", "later", "recently" — use dates or version numbers

## Code Examples Formatting

```
```typescript
const result = await api.createUser({
  email: "alice@example.com",
  name: "Alice"
});
// => { id: "abc-123", email: "alice@example.com", name: "Alice" }
```
```

- Always specify the language for syntax highlighting
- Show real, runnable examples (never pseudo-code unless abstracting complexity)
- Include expected output in comments
- Use realistic data (not "foo", "bar")
- Keep examples focused — one concept per snippet
- Use ellipsis (`...`) to truncate irrelevant code
- Prefer command-line snippets over GUI instructions

## Error Message Writing

- **Format**: `[error_code] description — resolution`
- **Be specific**: "User not found (email: alice@example.com)" not "Invalid input"
- **Provide resolution**: "Set the `AUTH_SECRET` environment variable" not "Configuration error"
- **Include request ID**: "Contact support with trace ID: abc-123"
- **Don't blame**: "Connection timed out" not "You caused a timeout"
- **Avoid jargon**: "The file could not be found" not "ENOENT: no such file or directory"

## Cross-Referencing and Linking

- **Relative links**: `./configuration.md#database` not `/docs/configuration.md#database`
- **Descriptive link text**: "See the [deployment guide](./deployment.md)" not "Click [here](./deployment.md)"
- **Bidirectional references**: API docs link to guides, guides link to API docs
- **Anchor links**: Use lowercase, hyphenated headings for anchors (automatically generated)
- **External links**: Open in new tab only when linking outside the docs site
- **Link health**: Check for broken links in CI (`broken-link-checker`, `lychee`)

## Versioning and Deprecation Notices

**Deprecation callout format:**

```
> **Deprecated:** `v1/listUsers()` is deprecated since v2.1.0.
> Use `v2/searchUsers()` instead. The old method will be removed in v3.0 (2026-12-31).
```

- Use version tags in URLs: `docs/v1/`, `docs/v2/`
- Deprecation notice requires: version deprecated, replacement, removal date
- Document migration path alongside deprecation
- Surface deprecation warnings in CLI tools and SDKs

## Inclusive Language

- **Gender-neutral**: "they" for singular, "developers" instead of "guys"
- **Avoid ableist terms**: "terminate" not "kill", "primary/replica" not "master/slave"
- **Avoid cultural references**: "allowlist/blocklist" not "whitelist/blacklist"
- **Avoid charged language**: "crash" is better than "abort"
- **Avoid idioms**: "simplify" not "low-hanging fruit", "element" not "building block"
- **Be specific**: "stops responding" not "goes crazy", "exits" not "dies"

## Writing for Global Audiences (i18n)

- **Simple English**: Short sentences, common vocabulary, avoid idioms and metaphors
- **Date/time formats**: Use ISO 8601 (`2026-05-30T14:30:00Z`) not locale-specific (`5/30/2026`)
- **Currency**: Include ISO code (`USD 50`, `EUR 40`) not just symbols (`$50`)
- **Colors**: Don't rely on color alone to convey meaning — add text labels
- **Screen readers**: Tag images with proper alt text
- **Numbers**: Use commas or spaces? (1,000 vs 1 000) — prefer SI standard with spaces
- **Avoid**: Cultural references, sports metaphors, puns, jokes, pop culture

## Accessibility in Documentation

- **Alt text**: Every image needs descriptive alt text: `![Architecture diagram showing API Gateway → Auth → Service → Database]`
- **Heading hierarchy**: `h1` → `h2` → `h3` — never skip levels (no `h2` after `h1` then back to `h1`)
- **Descriptive links**: "Deployment guide" not "Click here" (screen readers skim links)
- **Color contrast**: Ensure code blocks and callouts have sufficient contrast ratios
- **Semantic HTML**: Use `<table>` for tabular data, not visual columns; use `<code>` for inline code
- **Code blocks**: Always label the language for screen reader announcements
