# CONTRIBUTING — operating contract for humans AND agents

The full operating system lives in [AGENT-HANDOFF.md](AGENT-HANDOFF.md) — read
it top-to-bottom before writing any code. This file carries the repo-specific
rules, commands and traps. Where the two disagree, the handoff doc wins.

## The short version

1. **No code lands on `main` without a PR.** Every unit of work = task spec file
   (`docs/tasks/T###-slug.md`) mirrored by a GitHub issue.
2. **Claim before you code:** comment on the issue with your branch name and the
   exact files you will touch.
3. **Touch ONLY the files the spec lists.** New dependency not named in the
   spec = STOP and ask on the issue.
4. **Evidence on done:** the PR body carries the pasted output of the spec's
   Verify commands. "Tests pass" without output is not evidence.
5. Ambiguity → ask on the issue; never guess silently.
6. Deploy to the VPS happens **after merge**, only for files that actually
   changed, copied individually (never `rsync --delete`). Server details live in
   the local-only `PORTFOLIO_CONTEXT.md` — gitignored, never committed.

## Local gate ladder (run ALL before every push)

```bash
npm ci                      # tooling only — the site itself has zero deps
npm run lint                # htmlhint on the HTML files
npm run format:check        # prettier on md/json/yml/ts (NOT index.html — see traps #7)
npm run check:js            # syntax-check every inline <script> block
npm audit --audit-level=high          # all deps
npm audit --audit-level=high --omit=dev   # prod-only (none exist — must stay clean)
npx playwright test         # hermetic e2e smoke (boots its own static server)
```

CI (`.github/workflows/ci.yml`) re-runs all of this on every PR and on pushes
to `main`. No `continue-on-error`, no `|| true`, anywhere.

## Branches / commits / PRs

- Branch `feat/T###-slug` / `fix/...` / `docs/...` / `ci/...` off an up-to-date
  `main`. Commit title `feat(T###): ...` — see AGENT-HANDOFF §3.4.
- Merge with **merge commits** (`gh pr merge N --merge --delete-branch`) so the
  PR number stays greppable in history.
- Plain `git push` hangs on this machine. Always push with:

```bash
git -c credential.helper= -c credential.helper='!gh auth git-credential' push origin HEAD
```

## Regenerating the CV

`cv_print.html` is the source of truth. Regenerate `Amir_Khosravi_CV.pdf` with
headless Chrome `--headless=new --print-to-pdf --virtual-time-budget=8000`.
The photo `img src` MUST be the absolute `file:///D:/Z.Ai/portfolio/amir.jpg` —
a relative src silently drops the photo in headless print (traps #3).

## Traps (living list — add every gotcha that costs >15 min, same day)

1. **Attribute-based i18n destroys content.** The original `data-en=`/`data-de=`
   span approach made content vanish on language switch. Only the `I18N`
   dictionary engine (docs/CONTRACT.md §2) may translate. Every new key needs
   BOTH `en` and `de` or DE renders empty.
2. **Plain `git push` hangs on this PC.** Use the gh credential-helper command
   above, verbatim.
3. **Headless Chrome quirks:** the CV photo needs an absolute `file:///` src;
   screenshots of the live site need `--force-prefers-reduced-motion` plus an
   anchor URL (scroll-reveal + 100vh hero break naive full-page shots); Chrome
   on Git Bash needs forward-slash `--screenshot` paths and `--no-sandbox`.
4. **Deploy is file-by-file.** `shot.png`-class assets may exist on the server
   with different state than local. Never sync the folder with `--delete`.
5. **Dynamic DOM + i18n:** anything cloned/rendered after the initial
   `setLang()` keeps the default language until `setLang` is re-invoked — the
   projects modal does this explicitly.
6. **e2e localStorage bleed:** `localStorage.lang` persists between tests; the
   smoke suite must clear storage before each scenario or DE/EN assertions race.
7. **`index.html` is exempt from prettier** (narrow, justified exclusion): it is
   a handcrafted single-file site; reformatting would churn 100% of its lines
   and destroy carefully grouped one-liner CSS. `.prettierignore` enforces this;
   htmlhint + `check:js` own that file instead.
8. **The site must render with JavaScript disabled.** All English copy lives in
   the HTML; JS only swaps languages and drives the carousel.
