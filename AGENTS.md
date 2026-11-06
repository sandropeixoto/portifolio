# Repository Guidelines

## Project Structure

- `index.html` is the generated, self-contained portfolio and mind map.
- `scripts/update_incremental.js` discovers GitHub repositories, analyzes changed or new repositories, and updates the local dataset.
- `scripts/generate_html.js` builds `index.html` from `data/repos_analyzed.json`.
- `data/repos_analyzed.json` is the analyzed repository catalog.
- `.github/workflows/update-map.yml` schedules and runs synchronization and Pages deployment.

Keep the dataset and generated page in sync. Prefer changing the scripts or source data and regenerating the page over editing generated HTML by hand.

## Development Commands

- `npx serve . -p 3333` serves the site locally at `http://localhost:3333`.
- `node scripts/generate_html.js` regenerates `index.html` from the current dataset.
- `node scripts/update_incremental.js` fetches repository metadata through the GitHub CLI, analyzes changes, saves the dataset, and regenerates the page. Authenticate `gh` first and set `GH_TOKEN` to a PAT with access to the repositories being analyzed. Set `TARGET_REPO` to limit a run to one repository.

There is no separate package build or test command configured in this repository.

## Style and Naming

Use two spaces for JavaScript indentation, semicolons, single-quoted strings, and `camelCase` for variables and functions. Keep repository data fields consistent with the objects produced by `update_incremental.js`. No formatter or linter is configured; follow the surrounding code style.

## Validation

No automated test suite is present. For UI or generator changes, regenerate the page and inspect it locally with `npx serve . -p 3333`. For synchronization changes, confirm the GitHub CLI is authenticated and review changes to both `data/repos_analyzed.json` and `index.html` before committing.

## Commits and Pull Requests

Recent history is mostly generated commits named `chore(auto): atualização incremental do portfólio [skip ci]`. For contributor changes, use a concise conventional prefix such as `feat:`, `fix:`, or `docs:`. Pull requests should explain the behavior changed, identify generated files affected, and include screenshots for visible UI changes.

## Secrets

Store `PAT_UPDATE_PORTFOLIO` in GitHub Actions secrets. Never commit PATs, credentials, or local `.env` files.
