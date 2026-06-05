---
name: changelog
description: Keep CHANGELOG.md at the project root in sync with git history. Bootstraps the file on first run from `git log`; on later runs, appends any commits not yet captured under date-grouped headings. Manually invoked before merging a feature branch into main. Voice triggers / aliases — "changelog", "update the changelog", "log this change", "/changelog before merge".
---

# changelog

Maintain a single `CHANGELOG.md` at the project root. The file's structure is:

```markdown
# Changelog

## YYYY-MM-DD
- commit subject
- commit subject

## YYYY-MM-DD
- commit subject
```

Dates are ISO calendar dates with the **newest at the top**. Within a date,
the **newest commit is at the top**. Bullets are commit subjects verbatim.

## When to run

The user invokes this skill **manually before merging** a feature branch
into main. Your job is to leave `CHANGELOG.md` reflecting what the merge
will land, plus any historical commits not already captured.

This is the one job. Don't refactor, don't reformat unrelated sections,
don't open a PR, don't commit on the user's behalf.

## Procedure

1. **Confirm you're at the project root.** It contains `package.json` and a
   `.git/` directory. If not, locate it before reading or writing.

2. **Check whether `CHANGELOG.md` exists.**

### Bootstrap path — file does not exist

Run:

```bash
git log --date=short --pretty=format:'%ad|%s' --reverse
```

Group the output by date. Write `CHANGELOG.md` as:

- A single `# Changelog` heading at the top, then one blank line.
- For each date, **newest first**, a `## YYYY-MM-DD` heading.
- Under each heading, one bullet per commit using the subject line
  verbatim. Within a date, **newest commit at the top** (reverse the
  per-day order returned by `--reverse`).

Stage the file with `git add CHANGELOG.md` and tell the user it was
created and how many dates / commits were captured. **Do not commit.**

### Update path — file exists

Read the existing file. Then walk every commit:

```bash
git log --date=short --pretty=format:'%ad|%s'
```

For each commit `(date, subject)`:

- Find the `## <date>` section in the file. If a bullet already matches
  the subject (exact string compare after `- `), skip — the commit is
  already captured.
- Otherwise, add the bullet:
  - If the `## <date>` heading exists, insert the new bullet at the
    **top** of its bullet list.
  - If no heading for that date exists, insert a new `## <date>`
    heading + bullet in the right slot (dates sorted newest first).

Stage the file with `git add CHANGELOG.md`. Tell the user which dates
gained which bullets. **Do not commit.**

## Filtering noise

Commit subjects that are obvious noise (`wip`, `wip 2`, `fix typo`,
`format`, `lint`, single-emoji subjects) should be **skipped** — leave
them out of the changelog rather than rewrite them. Tell the user
which commits you skipped and why so they can override.

Merge commits with a default `Merge branch …` subject should be
**skipped**. A merge commit authored with an intentional subject
(e.g. `merge phase-0-skeleton: ship Phase 0 skeleton`) is kept.

## Voice and format

- Top of file: `# Changelog` and one blank line.
- Headings: `## YYYY-MM-DD` (ISO date, no time, no day name).
- Bullets: `- <commit subject>` — verbatim.
- No prose between sections, no horizontal rules, no SHAs in bullets,
  no "Unreleased" placeholder.
- Trailing newline at end of file.

## What not to do

- **Do not commit.** Staging the file is enough; the user handles the
  commit as part of their pre-merge work.
- **Do not rewrite past entries.** Past dates are historical. Append only.
- **Do not invent bullets** for uncommitted work. The changelog tracks
  the git log, not the working tree.
- **Do not edit other files** in the same run.

## Output to the user

A short report:

- Whether the file was created or updated.
- The dates and bullets you added (or "no new commits to log" if a no-op).
- The list of skipped noise commits, if any.
- A reminder that the change is staged but not committed.
