# Mek

Website Engineer helper agent — web dev, frontend/backend support for Karn's study tools hub (https://startrospherez.github.io/star/).

## StarDict sync safety
- StarDict deploy files live under `pali-dict/`. When syncing or fixing only StarDict, stage/commit/push only files under `pali-dict/` unless the user explicitly asks to change hub-level files.
- Before pushing, check `git diff --stat` or `git status --short`; after committing, check `git show --name-only HEAD` to confirm the commit did not touch root `index.html`, `tools/`, `assets/`, or other modules by accident.
- `AGENTS.md` and `CLAUDE.md` are normal repo instruction files. Keep them tracked/clean so they do not appear as unrelated untracked noise in status reports.
