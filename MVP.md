# MVP: Offline TypeScript Code Runner with Terminal

## Project Overview

An offline-first TypeScript code runner with terminal output, built with Vite, React, and Monaco editor.

## 0. Project Baseline (One-time)

### 0.1 Create Project

- [x] Initialize Vite + React + TypeScript
- [ ] Verify Web Worker support via `new URL(worker, import.meta.url)`

**Done when:**

- [ ] App boots
- [ ] Blank React page renders

## 1. Dependency Layer

### 1.1 Install Core Runtime Dependencies

- [ ] Monaco editor
- [ ] TypeScript compiler
- [ ] xterm + fit addon
- [ ] IndexedDB wrapper
- [ ] PWA plugin
- [ ] No UI libraries yet

**Done when:**

- [ ] App builds without warnings
- [ ] Bundle succeeds

## 2. Editor Module

### 2.1 Monaco Initialization

- [ ] Load Monaco lazily
- [ ] Set language to TypeScript
- [ ] Disable unnecessary features (minimap, code lens)

### 2.2 Default Code Injection

- [ ] Load a single star-pattern example on first boot
- [ ] Keep example in source, not DB

### 2.3 Controlled State

- [ ] Sync editor content to React state
- [ ] No auto-compile

**Done when:**

- [ ] Editor renders
- [ ] Code edits update state
- [ ] No runtime errors

## 3. Execution Worker

### 3.1 Worker Setup

- [ ] Create isolated worker entry
- [ ] Accept code string via postMessage

### 3.2 TypeScript Compilation

- [ ] Use transpileModule
- [ ] Strict mode enabled
- [ ] Target ES2020

### 3.3 Runtime Execution

- [ ] Execute compiled JS via new Function
- [ ] Inject fake console

### 3.4 Console Capture

Capture:

- [ ] console.log
- [ ] console.error
- [ ] Serialize output as string array

### 3.5 Error Handling

Catch:

- [ ] Syntax errors
- [ ] Runtime errors
- [ ] Return error as terminal output

### 3.6 Execution Safety

- [ ] Enforce hard timeout
- [ ] Auto-terminate worker on timeout or completion

**Done when:**

- [ ] Code runs without blocking UI
- [ ] Infinite loop does not freeze app
- [ ] Errors are returned, not thrown

## 4. Terminal Module (xterm)

### 4.1 Terminal Boot

- [ ] Initialize xterm instance
- [ ] Attach fit addon
- [ ] Disable input

### 4.2 Output Rendering

- [ ] Clear terminal on each run
- [ ] Stream output lines sequentially
- [ ] Auto scroll to bottom

### 4.3 Lifecycle Management

- [ ] Proper dispose on unmount
- [ ] No memory leaks on rerun

**Done when:**

- [ ] Output looks like real console
- [ ] Multiple runs do not duplicate output
- [ ] Resize does not break layout

## 5. Run Pipeline (Glue Logic)

### 5.1 Run Action

On Run click:

- [ ] Kill existing worker
- [ ] Clear terminal
- [ ] Spawn fresh worker
- [ ] Send editor code

### 5.2 Worker Response Handling

- [ ] Append logs to terminal
- [ ] Display errors as terminal lines

### 5.3 Run Lock

- [ ] Disable Run while worker is active
- [ ] Re-enable on completion / timeout

**Done when:**

- [ ] Run is deterministic
- [ ] No race conditions
- [ ] No orphan workers

## 6. Persistence (IndexedDB – Minimal)

### 6.1 Storage Schema

Store:

- [ ] `lastCode: string`
- [ ] Single object store

### 6.2 Save Strategy

Save editor code:

- [ ] On debounce (not every keystroke)
- [ ] On Run

### 6.3 Restore Strategy

- [ ] Load last code on app mount
- [ ] Fallback to default example

**Done when:**

- [ ] Refresh restores code
- [ ] Offline reload works

## 7. UI Shell (Minimal shadcn)

### 7.1 Layout

- [ ] Header: app name + Run button
- [ ] Main: editor (top)
- [ ] Bottom: terminal

### 7.2 Controls

- [ ] Run button
- [ ] No extra UI

### 7.3 Theme

- [ ] Dark mode only (MVP)
- [ ] Tailwind monospace for terminal

**Done when:**

- [ ] UI is usable
- [ ] No visual glitches
- [ ] No unused components

## 8. Offline & PWA

### 8.1 PWA Setup

- [ ] Register service worker

Cache:

- [ ] App shell
- [ ] Monaco assets
- [ ] TypeScript compiler

### 8.2 Offline Validation

- [ ] First load online
- [ ] Reload offline
- [ ] Run code offline

**Done when:**

- [ ] App opens offline
- [ ] Editor + terminal fully functional

## 9. Error & Edge Handling

### 9.1 Compilation Errors

- [ ] Show in terminal
- [ ] Do not crash app

### 9.2 Runtime Errors

- [ ] Stack trace trimmed
- [ ] Shown as terminal output

### 9.3 Worker Failure

- [ ] Auto reset worker
- [ ] Allow rerun

**Done when:**

- [ ] App never white-screens
- [ ] All failures degrade gracefully

## 10. Final Verification (Exit Criteria)

### Functional

- [ ] Write TS code
- [ ] Click Run
- [ ] Output in terminal

### Safety

- [ ] Infinite loop does not lock UI
- [ ] Worker always terminates

### Offline

- [ ] Works with no internet
- [ ] Code persists

### Performance

- [ ] Run latency < 200ms
- [ ] No memory growth after multiple runs

## MVP COMPLETE WHEN

- [ ] All tasks above are green
- [ ] No feature outside this list exists
- [ ] App can be demoed offline on any machine
