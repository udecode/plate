#!/usr/bin/env bash

# License: MIT
# Copied from https://github.com/travis-ci/travis-build/blob/master/lib/travis/build/bash/travis_retry.bash
# (Permalink: https://github.com/travis-ci/travis-build/blob/4e57ccad0d384bf48848d95c9ab19b039af32551/lib/travis/build/bash/travis_retry.bash)
retry_run() {
  local result=0
  local count=1
  while [[ "${count}" -le 3 ]]; do
    [[ "${result}" -ne 0 ]] && {
      echo -e "\\n${ANSI_RED}The command \"${*}\" failed. Retrying, ${count} of 3.${ANSI_RESET}\\n" >&2
    }
    # run the command in a way that doesn't disable setting `errexit`
    "${@}"
    result="${?}"
    if [[ $result -eq 0 ]]; then break; fi
    count="$((count + 1))"
    sleep 1
  done

  [[ "${count}" -gt 3 ]] && {
    echo -e "\\n${ANSI_RED}The command \"${*}\" failed 3 times.${ANSI_RESET}\\n" >&2
  }

  return "${result}"
}
