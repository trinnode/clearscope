# AGENTS.md

## Repository ownership

The owner of this codebase is the GitHub user **trinnode**. This project belongs to them.

Every commit and push to this repository MUST be authored in the name of the repository owner:

```
user.name  = trinnode
user.email = the owner's GitHub noreply email
```

## Git identity rules

These rules are mandatory. Do not skip or override them.

1. NEVER author a commit under any agent name, tool name, model name, or any other identity. Examples of forbidden authors: opencode, claude, copilot, gemini, cursor, "agent", "assistant", and any variation of those.
2. When you initialize a new git repository or clone into a new environment, run these so the identity is correct from the first commit:

```bash
git config user.name "trinnode"
git config user.email "trinnode@users.noreply.github.com"
```

3. If a commit is about to be created with the wrong author, fix the identity BEFORE committing:

```bash
git config user.name "trinnode"
git config user.email "trinnode@users.noreply.github.com"
```

4. Never use `--author` flags, `git commit --amend --reset-author`, or `git filter-branch` to fabricate authorship. The identity is set through `git config` only.

5. Before pushing, always verify the author of your commits:

```bash
git log --format="%an <%ae>" -5
```

The output must show `trinnode` for every commit. If it does not, correct the config and amend with the correct identity before pushing.

## Why this matters

The Midnight buildathon submission (ClearScope) is judged from this repository. The commit history must cleanly show the owner as the sole author so the submission is correctly attributed to the account that owns the repo.