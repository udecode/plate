---
date: 2026-04-11
problem_type: integration_issue
component: tooling
root_cause: missing_tooling
title: Appium UiAutomator2 can prove local Android Chrome on emulator when Playwright Android stalls
tags:
  - slate-browser
  - android
  - appium
  - uiautomator2
  - emulator
  - chrome
severity: medium
---

# Appium UiAutomator2 can prove local Android Chrome on emulator when Playwright Android stalls

## What happened

We needed a local open-source Android browser-mobile proof path for Slate.

The environment turned out to be better than expected:

- an Android emulator was already running
- Chrome was installed on it
- Playwright `_android` could see the emulator

But Playwright’s `launchBrowser()` still hung.

## What fixed it

Appium worked once the setup stopped being half-finished:

1. install `adb`
2. install `appium`
3. install the Appium `uiautomator2` driver
4. export `ANDROID_HOME` and `ANDROID_SDK_ROOT`
5. start Appium with:
   `uiautomator2:chromedriver_autodownload`

At that point Appium could:

- create a Chrome session on the emulator
- autodownload the matching Chromedriver
- navigate to the local Slate example via `10.0.2.2`
- read back page title and source

## Reusable rule

For local Android browser-mobile proof in this environment:

- Playwright Android visibility is not enough
- if `launchBrowser()` stalls, try Appium UiAutomator2 before writing off the
  emulator path
- Chromedriver autodownload is the difference between “session dies” and “real
  browser proof”

## Current honest read

- Appium is the stronger Android browser-mobile setup proof here
- Playwright Android remains worth investigating later
- this proves setup and page reachability, not full Android IME parity
