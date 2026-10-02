// Drives the real macOS input method for local IME proof (docs/plans/2026-10-02-proof-device-lane.md).
// Every command prints one JSON object. Exit codes: 0 ok, 2 refused, 64 usage.

import AppKit
import ApplicationServices
import Carbon
import CoreGraphics
import Foundation

let stateDirectory = FileManager.default
  .urls(for: .cachesDirectory, in: .userDomainMask)[0]
  .appendingPathComponent("plate-proof/macos-ime", isDirectory: true)
let restoreURL = stateDirectory.appendingPathComponent("restore.json")
let lockURL = stateDirectory.appendingPathComponent("lock.json")

let keyCodes: [Character: CGKeyCode] = [
  "a": 0, "s": 1, "d": 2, "f": 3, "h": 4, "g": 5, "z": 6, "x": 7, "c": 8,
  "v": 9, "b": 11, "q": 12, "w": 13, "e": 14, "r": 15, "y": 16, "t": 17,
  "1": 18, "2": 19, "3": 20, "4": 21, "6": 22, "5": 23, "9": 25, "7": 26,
  "8": 28, "0": 29, "o": 31, "u": 32, "i": 34, "p": 35, "l": 37, "j": 38,
  "k": 40, "n": 45, "m": 46, " ": 49, "\u{8}": 51, "\u{1b}": 53, "\r": 36,
]

func emit(_ value: [String: Any], exitCode: Int32 = 0) -> Never {
  let data = try! JSONSerialization.data(withJSONObject: value, options: [.sortedKeys])
  print(String(data: data, encoding: .utf8)!)
  exit(exitCode)
}

func refuse(_ reason: String, _ details: [String: Any] = [:]) -> Never {
  emit(details.merging(["error": reason]) { $1 }, exitCode: 2)
}

func property(_ source: TISInputSource, _ key: CFString) -> Any? {
  guard let pointer = TISGetInputSourceProperty(source, key) else { return nil }
  return Unmanaged<AnyObject>.fromOpaque(pointer).takeUnretainedValue()
}

func source(id: String) -> TISInputSource? {
  let filter = [kTISPropertyInputSourceID as String: id] as CFDictionary
  let list = TISCreateInputSourceList(filter, true)?.takeRetainedValue() as? [TISInputSource]
  return list?.first
}

func currentSourceID() -> String {
  property(TISCopyCurrentKeyboardInputSource().takeRetainedValue(), kTISPropertyInputSourceID)
    as? String ?? "unknown"
}

func readJSON(_ url: URL) -> [String: Any]? {
  guard let data = try? Data(contentsOf: url) else { return nil }
  return (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
}

func writeJSON(_ url: URL, _ value: [String: Any]) {
  try? FileManager.default.createDirectory(at: stateDirectory, withIntermediateDirectories: true)
  let data = try! JSONSerialization.data(withJSONObject: value, options: [.sortedKeys])
  try! data.write(to: url, options: .atomic)
}

func isAlive(_ pid: Int32) -> Bool { pid > 0 && kill(pid, 0) == 0 }

func lockOwner() -> Int32? {
  guard let lock = readJSON(lockURL), let owner = lock["owner"] as? Int else { return nil }
  return Int32(owner)
}

// O_EXCL makes the create the ownership check, so two runs cannot both win.
// A dead owner's lock is renamed aside and checked: a slower taker can move a
// fresh lock another just created, and links it back.
func acquireLock(_ owner: Int32) {
  try? FileManager.default.createDirectory(at: stateDirectory, withIntermediateDirectories: true)
  for _ in 0..<2 {
    let fd = open(lockURL.path, O_CREAT | O_EXCL | O_WRONLY, 0o644)
    if fd >= 0 {
      let data = try! JSONSerialization.data(withJSONObject: ["owner": Int(owner)])
      _ = data.withUnsafeBytes { write(fd, $0.baseAddress, data.count) }
      close(fd)
      return
    }
    guard errno == EEXIST else { refuse("lock-failed", ["errno": Int(errno)]) }
    guard let held = lockOwner() else { refuse("locked", ["lockOwner": -1]) }
    if held == owner { return }
    if isAlive(held) { refuse("locked", ["lockOwner": held]) }
    let aside = lockURL.path + ".stale-\(owner)"
    guard rename(lockURL.path, aside) == 0 else { continue }
    let moved = (readJSON(URL(fileURLWithPath: aside))?["owner"] as? Int).map(Int32.init)
    if moved != held {
      link(aside, lockURL.path)
      unlink(aside)
      refuse("locked", ["lockOwner": moved ?? -1])
    }
    unlink(aside)
  }
  refuse("locked", ["lockOwner": lockOwner() ?? -1])
}

func frontmostPID() -> Int32 {
  NSWorkspace.shared.frontmostApplication?.processIdentifier ?? -1
}

func select(_ id: String) -> OSStatus {
  guard let target = source(id: id) else { return OSStatus(paramErr) }
  return TISSelectInputSource(target)
}

func option(_ name: String, in arguments: [String]) -> String? {
  guard let index = arguments.firstIndex(of: name), index + 1 < arguments.count else { return nil }
  return arguments[index + 1]
}

let arguments = Array(CommandLine.arguments.dropFirst())

switch arguments.first {
case "status":
  let id = arguments.count > 1 ? arguments[1] : "com.apple.inputmethod.SCIM.ITABC"
  let mode = source(id: id)
  let owner = lockOwner()
  emit([
    "accessibility": AXIsProcessTrusted(),
    "current": currentSourceID(),
    "frontmostPID": frontmostPID(),
    "listenEvents": CGPreflightListenEventAccess(),
    "lockOwner": owner ?? NSNull(),
    "lockStale": owner.map { !isAlive($0) } ?? false,
    "mode": id,
    "modeEnabled": mode.flatMap { property($0, kTISPropertyInputSourceIsEnabled) as? Bool } ?? false,
    "modeSelectable": mode.flatMap { property($0, kTISPropertyInputSourceIsSelectCapable) as? Bool } ?? false,
    "parentEnabled": source(id: "com.apple.inputmethod.SCIM")
      .flatMap { property($0, kTISPropertyInputSourceIsEnabled) as? Bool } ?? false,
    "postEvents": CGPreflightPostEventAccess(),
    "restorePending": readJSON(restoreURL) ?? NSNull(),
    "screenCapture": CGPreflightScreenCaptureAccess(),
  ])

case "window":
  guard arguments.count > 1 else { emit(["error": "usage"], exitCode: 64) }
  let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID)
    as? [[String: Any]] ?? []
  let match = windows.first { ($0[kCGWindowName as String] as? String)?.contains(arguments[1]) == true }
  emit([
    "found": match != nil,
    "pid": match?[kCGWindowOwnerPID as String] ?? -1,
    "windowNumber": match?[kCGWindowNumber as String] ?? -1,
  ])

case "select":
  guard arguments.count > 1, let owner = option("--owner", in: arguments).flatMap(Int32.init)
  else { emit(["error": "usage"], exitCode: 64) }
  // A dead owner's lock is taken over; the restore file still keeps the source it found.
  acquireLock(owner)
  if readJSON(restoreURL) == nil {
    writeJSON(restoreURL, ["previous": currentSourceID()])
  }
  let status = select(arguments[1])
  if status != noErr { refuse("select-failed", ["status": Int(status), "current": currentSourceID()]) }
  emit(["current": currentSourceID()])

case "post":
  guard arguments.count > 2, let pid = Int32(arguments[1]),
    let owner = option("--owner", in: arguments).flatMap(Int32.init)
  else { emit(["error": "usage"], exitCode: 64) }
  guard lockOwner() == owner else { refuse("not-lock-owner", ["lockOwner": lockOwner() ?? -1]) }
  let useHID = arguments.contains("--hid")
  let eventSource = CGEventSource(stateID: .hidSystemState)
  for character in arguments[2] {
    guard let code = keyCodes[character] else { refuse("unmapped-key", ["key": String(character)]) }
    if useHID, frontmostPID() != pid {
      refuse("frontmost-changed", ["frontmostPID": frontmostPID(), "key": String(character)])
    }
    for keyDown in [true, false] {
      guard let event = CGEvent(keyboardEventSource: eventSource, virtualKey: code, keyDown: keyDown)
      else { refuse("event-failed", ["key": String(character)]) }
      if useHID { event.post(tap: .cghidEventTap) } else { event.postToPid(pid) }
    }
  }
  emit(["current": currentSourceID(), "mode": useHID ? "hid" : "pid", "posted": arguments[2]])

case "restore":
  // Restoring under a live run would switch its input source mid-test, so
  // restore takes the lock first.
  acquireLock(option("--owner", in: arguments).flatMap(Int32.init) ?? getpid())
  guard let pending = readJSON(restoreURL) else {
    try? FileManager.default.removeItem(at: lockURL)
    emit(["current": currentSourceID(), "restored": false])
  }
  guard let previous = pending["previous"] as? String else { refuse("corrupt-restore-file") }
  let status = select(previous)
  if status != noErr { refuse("restore-failed", ["previous": previous, "status": Int(status)]) }
  try? FileManager.default.removeItem(at: restoreURL)
  try? FileManager.default.removeItem(at: lockURL)
  emit(["current": currentSourceID(), "restored": true])

default:
  FileHandle.standardError.write(
    "usage: status [id] | window <title> | select <id> --owner <pid> | post <pid> <keys> --owner <pid> [--hid] | restore [--owner <pid>]\n"
      .data(using: .utf8)!)
  exit(64)
}
