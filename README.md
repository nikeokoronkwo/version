# `@nikeokoronkwo/version`

Resolves a version string from git context for use in CI pipelines — Docker images, packages, etc.

## Behaviour

| Scenario                     | Output           |
| ---------------------------- | ---------------- |
| Push is a new tag (`v1.2.3`) | `1.2.3`          |
| Push to branch, tags exist   | `1.2.3-a1b2c3d`  |
| Push to branch, no tags ever | `0.0.0-a1b2c3d`  |
| Same but with `suffix: date` | `1.2.3-20240601` |

## Usage

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0 # required — must fetch full history for git describe

- name: Resolve version
  id: version
  uses: nikeokoronkwo/version@v1
  with:
    suffix: commit # "commit" (default) | "date"

- run: echo ${{ steps.version.outputs.version }}
```

## Inputs

| Input    | Required | Default  | Description                                                                    |
| -------- | -------- | -------- | ------------------------------------------------------------------------------ |
| `suffix` | No       | `commit` | Suffix type for non-release builds: `commit` (short hash) or `date` (YYYYMMDD) |

## Outputs

| Output       | Description                    | Example                                    |
| ------------ | ------------------------------ | ------------------------------------------ |
| `version`    | Resolved version string        | `1.2.3`, `1.2.3-a1b2c3d`, `0.0.0-20240601` |
| `is_release` | `"true"` if this is a tag push | `"true"` / `"false"`                       |
| `tag`        | Raw git tag, or empty string   | `v1.2.3` / `""`                            |

## Setup

```bash
npm install
npm run build   # bundles to dist/ with ncc — commit dist/ to the repo
```

> **Important:** commit the `dist/` folder. GitHub Actions runs `dist/index.js` directly.
