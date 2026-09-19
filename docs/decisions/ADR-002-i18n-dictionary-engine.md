# ADR-002 — i18n via the I18N dictionary engine (attribute spans forbidden)

Status: accepted (replaces the failed attribute-span approach)

## Context

The first bilingual attempt put translations in `data-en=`/`data-de=` attribute
spans. On language switch, content silently vanished. The dictionary engine was
built as the replacement and has been stable since.

## Decision

All translation lives in the `I18N` dictionary; DOM nodes reference keys via
`data-i18n` (textContent) and `data-i18n-aria` (aria-label). `setLang()` is the
only mutation path and persists the choice. Full contract: docs/CONTRACT.md §2.

## Consequences

- Adding visible text = adding a dictionary key (en + de, both mandatory).
- Dynamically created DOM must re-run `setLang` after creation.
- The English text lives inline in the HTML, keeping the site JS-off safe.
