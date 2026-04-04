# ACLS v. NEH Case Analysis Site

## Styling Rules

### Dropdown Menus
- **NEVER truncate text in dropdown menu items.** All dropdown options must display their full text.
- Use `max-h-[300px] overflow-y-auto` on SelectContent for scrollable dropdowns.
- Set `min-w-[var(--radix-select-trigger-width)]` plus extra width so items are always fully readable.
- If a dropdown item text is long, the dropdown should expand to accommodate it — never cut off words with ellipsis.

### General
- Use shadcn/ui components consistently.
- Support both light and dark mode — test both.
- Mobile-first responsive design using Tailwind breakpoints (sm, md, lg, xl).
- All data text (names, descriptions, titles) must display in full — never truncate unless explicitly providing a "show more" mechanism.
- Neutral investigative journalism tone throughout.

## Data
- JSON data files live in `public/` and are loaded via `fetch()`.
- Source exhibit PDFs are hosted at `https://www.acls.org/wp-content/uploads/2026/03/248-{N}.pdf`.
- The memo is at `https://www.acls.org/wp-content/uploads/2026/03/247-Memo-of-law-in-support-of-motion-for-summary-judgment.pdf`.
