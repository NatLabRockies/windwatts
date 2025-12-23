#!/bin/bash

# Navigate to UI directory
cd windwatts-ui || exit 1

echo "Running ESLint..."
if ! yarn lint; then
    echo "" >&2
    echo "--------------------------------------------------------" >&2
    echo "❌ ESLint check failed!" >&2
    echo "   Please run linting locally before committing:" >&2
    echo "   cd windwatts-ui && yarn lint" >&2
    echo "--------------------------------------------------------" >&2
    exit 1
fi

echo "Running Prettier check..."
if ! yarn check-format; then
    echo "" >&2
    echo "--------------------------------------------------------" >&2
    echo "❌ Prettier check failed!" >&2
    echo "   Please run formatting locally before committing:" >&2
    echo "   cd windwatts-ui && yarn format" >&2
    echo "--------------------------------------------------------" >&2
    exit 1
fi

echo "✅ Lint and Format checks passed."
exit 0
