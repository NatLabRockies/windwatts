#!/bin/bash

# Navigate to UI directory
cd windwatts-ui || exit 1

# If files are passed (from lint-staged), check only those.
# Otherwise default to checking everything (e.g. manual run).
FILES="$@"
if [ -z "$FILES" ]; then
    FILES="."
    CMD_LINT="npm run lint"
    CMD_FMT="npm run check-format"
else
    # Use npx to invoke binaries locally
    # Note: FILES usually contains absolute paths from lint-staged
    CMD_LINT="npx eslint $FILES"
    CMD_FMT="npx prettier --check $FILES"
fi

echo "Running ESLint..."
if ! $CMD_LINT; then
    echo "" >&2
    echo "--------------------------------------------------------" >&2
    echo "❌ ESLint check failed!" >&2
    echo "   Please run linting locally before committing:" >&2
    echo "   cd windwatts-ui && npm run lint" >&2
    echo "--------------------------------------------------------" >&2
    exit 1
fi

echo "Running Prettier check..."
if ! $CMD_FMT; then
    echo "" >&2
    echo "--------------------------------------------------------" >&2
    echo "❌ Prettier check failed!" >&2
    echo "   Please run formatting locally before committing:" >&2
    echo "   cd windwatts-ui && npm run format" >&2
    echo "--------------------------------------------------------" >&2
    exit 1
fi

echo "✅ Lint and Format checks passed."
exit 0
