#!/bin/bash
set -eo pipefail

BEFORE="${1}";
AFTER="${2}";

if [[ $# -ne 2 ]] ; then
    echo 'requires two arguments: before and after sha or tags'
    exit 1
fi

if [[ -n $(git status -s) ]]; then
    echo 'Please commit your changes before running this script.'
    exit 1
fi

git checkout "$BEFORE";
RUN_NAME=$BEFORE npm run benchmark:format;
git checkout "$AFTER";
RUN_NAME=$AFTER npm run benchmark:format;
BEFORE="$BEFORE" AFTER="$AFTER" npm run benchmark:compare;