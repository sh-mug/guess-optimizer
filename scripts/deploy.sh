#!/usr/bin/env bash
set -euo pipefail

npm run build

REMOTE=""
if [[ -n "${GH_TOKEN:-}" ]]; then
  REMOTE="https://x-access-token:${GH_TOKEN}@github.com/sh-mug/guess-optimizer.git"
fi

if [[ -n "$REMOTE" ]]; then
  gh-pages -d dist -b gh-pages -r "$REMOTE"
else
  gh-pages -d dist -b gh-pages
fi
