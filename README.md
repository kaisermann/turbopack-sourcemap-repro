# Turbopack sourcemap hash mismatch repro

Minimal reproduction showing that Turbopack production builds use different content hashes for `.js` bundles and their `.js.map` sourcemaps in `static/chunks/`.

For example, a bundle named `abc123.js` contains `//# sourceMappingURL=def456.js.map`, pointing to a map file with a completely different hash. The map file exists on disk but has no same-name `.js` counterpart, making it an orphan from the perspective of naive filesystem-scanning tools like [`bugsnag-cli`](https://github.com/bugsnag/bugsnag-cli/blob/156f6b4b596cf9536e1e7373b4edf8a52022d118/pkg/upload/js.go#L301-L320) which resolve bundles via `strings.CutSuffix(mapPath, ".map")` instead of reading the `sourceMappingURL` comment.

Browsers work fine because they follow the `sourceMappingURL` comment. The inconsistency is between client-side chunks (mismatched) and SSR chunks (conventional pairing) within the same build.

## Build output included

The `.next/` build output is committed so you can inspect the issue directly:

- **`.next/static/chunks/`** -- client-side bundles. Notice that `.js` and `.js.map` files have completely different hashes (no name matches).
- **`.next/server/chunks/ssr/`** -- SSR bundles. Every `.js` file has a matching `.js.map` with the same name (conventional pairing).

## Setup

Zero custom config beyond `productionBrowserSourceMaps: true`. No plugins, no babel, no custom loaders.

- Next.js 16.1.6
- React 19
- Node.js 22

## Reproduce

```bash
npm install
npm run build
npm run analyze
```

The `analyze` script scans the `.next/` output and reports mismatched vs conventional sourcemap pairing per directory.

## Results

- **`static/chunks/`** (client-side): 9 out of 10 JS files have mismatched hashes between bundle and map
- **`server/chunks/ssr/`** (SSR): all files use conventional same-name pairing
- Multiple orphan `.map` files exist (no same-name `.js` file on disk)

### Expected

`abc123.js` references `abc123.js.map` (same base name), matching the convention used by SSR chunks and webpack builds.

### Actual

`abc123.js` references `def456.js.map` (different hash). The `.map` file exists but tools that scan by filename convention can't associate them.
