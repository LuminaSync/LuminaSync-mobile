# Contributing to LuminaSync Mobile

Thank you for helping build the mobile remote for LuminaSync.

## Prerequisites

- Node.js LTS (when the app scaffold exists)
- Expo CLI or `npx expo` per project README
- A Windows PC running [LuminaSync-core](https://github.com/LuminaSync/LuminaSync-core) on the same LAN for integration tests

## Setup

Instructions will be added when the initial Expo project is committed. Until then, read `docs/ARCHITECTURE.md` for the planned layout.

## Commit message format

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change without feature/fix |
| `test` | Tests |
| `chore` | Tooling, deps, CI |

### Examples

```
feat(pairing): add QR scanner screen
fix(ws): reconnect after app resumes from background
docs: describe Fernet envelope in INTEGRATION.md
```

### Rules

- Subject line ≤ 72 characters; use imperative mood ("add" not "added").
- Reference issues as `Fixes #12` or `Refs #12` in the footer when applicable.
- One logical change per commit when possible.
- English for commit messages and PR descriptions.

## Pull requests

1. Branch from `main`: `feature/short-name` or `fix/short-name`.
2. Describe manual test steps (device, OS version, core version).
3. No drive-by refactors unrelated to the PR.
4. Update `README.md` or `docs/` if behavior or protocol changes.

## Code style

- TypeScript strict mode when the project is initialized.
- English for identifiers, comments, and user-visible strings.
- Keep secrets out of logs and git (use `.env.example` without real keys).

## License

By contributing, you agree that your contributions are licensed under the GPL-3.0 license in `LICENSE`.
