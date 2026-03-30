---
name: agent-browser
description: Browser automation CLI for AI agents. Use when the user needs to interact with websites, including navigating pages, filling forms, clicking buttons, taking screenshots, extracting data, testing web apps, or automating any browser task. Triggers include requests to "open a website", "fill out a form", "click a button", "take a screenshot", "scrape data from a page", "test this web app", "login to a site", "automate browser actions", or any task requiring programmatic web interaction.
allowed-tools: Bash(agent-browser:*)
---

# Browser Automation with agent-browser

## Core Workflow

Most tasks follow the same loop:

1. Open the page: `agent-browser open <url>`
2. Capture interactive refs: `agent-browser snapshot -i`
3. Interact with `@e*` refs
4. Re-run `snapshot -i` after navigation or DOM changes

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# Output: @e1 [input type="email"], @e2 [input type="password"], @e3 [button] "Submit"

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # Check result
```

Refs are ephemeral. If the page reloads, navigates, opens a modal, expands a menu, or renders new content, old refs may stop working.

## Essential Commands

```bash
agent-browser open <url>
agent-browser snapshot -i
agent-browser snapshot -i -C          # include cursor-interactive elements
agent-browser snapshot -s "#selector" # limit scope

agent-browser click @e1
agent-browser fill @e2 "text"         # clear then type
agent-browser type @e2 "text"         # type without clearing
agent-browser select @e3 "option"
agent-browser check @e4
agent-browser press Enter
agent-browser scroll down 500

agent-browser get text @e1
agent-browser get text body
agent-browser get url
agent-browser get title

agent-browser wait @e1
agent-browser wait --load networkidle
agent-browser wait --url "**/target"
agent-browser wait 2000

# 
agent-browser screenshot .agent-browser/<name>.png
agent-browser screenshot --full
agent-browser close
```

## Rules That Prevent Most Failures

- Prefer refs from `snapshot -i`; they are usually more reliable than guessing selectors.
- Re-snapshot after any action that may change the page or visible UI.
- Wait explicitly for the thing you need next: an element, URL change, or settled network.
- Use `snapshot -i -C` if the real target is a clickable `div`, custom button, or other non-standard control.
- If refs are unstable or unavailable, use semantic locators.

```bash
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "user@test.com"
agent-browser find role button click --name "Submit"
agent-browser find placeholder "Search" type "query"
agent-browser find testid "submit-btn" click
```

## Common Patterns

### Form Submission

```bash
agent-browser open https://example.com/signup
agent-browser snapshot -i
agent-browser fill @e1 "Jane Doe"
agent-browser fill @e2 "jane@example.com"
agent-browser select @e3 "California"
agent-browser check @e4
agent-browser click @e5
agent-browser wait --load networkidle
```

### Authentication and Reuse

```bash
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "$USERNAME"
agent-browser fill @e2 "$PASSWORD"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser state save auth.json

agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

For OTP, CAPTCHA, magic links, or SSO steps that cannot be automated cleanly, pause and let the user complete them, then continue and save state.

### Data Extraction

```bash
agent-browser open https://example.com/products
agent-browser snapshot -i
agent-browser get text @e5
agent-browser get text body
agent-browser snapshot -i --json
agent-browser get text @e1 --json
```

### Parallel Sessions

```bash
agent-browser --session site1 open https://site-a.com
agent-browser --session site2 open https://site-b.com

agent-browser --session site1 snapshot -i
agent-browser --session site2 snapshot -i

agent-browser session list
```

### Debugging

```bash
agent-browser --headed open https://example.com
agent-browser highlight @e1          # Highlight element
agent-browser record start demo.webm # Record session
```

### Local Files

```bash
# Open local files with file:// URLs
agent-browser --allow-file-access open file:///path/to/document.pdf
agent-browser --allow-file-access open file:///path/to/page.html
agent-browser screenshot output.png
```

### iOS Simulator

```bash
# List available iOS simulators
agent-browser device list

# Launch Safari on a specific device
agent-browser -p ios --device "iPhone 16 Pro" open https://example.com

# Same workflow as desktop - snapshot, interact, re-snapshot
agent-browser -p ios snapshot -i
agent-browser -p ios tap @e1          # Tap (alias for click)
agent-browser -p ios fill @e2 "text"
agent-browser -p ios swipe up         # Mobile-specific gesture

# Take screenshot
agent-browser -p ios screenshot mobile.png

# Close session (shuts down simulator)
agent-browser -p ios close
```

**Requirements:** macOS with Xcode, Appium (`npm install -g appium && appium driver install xcuitest`)

**Real devices:** Works with physical iOS devices if pre-configured. Use `--device "<UDID>"` where UDID is from `xcrun xctrace list devices`.

## Edge Cases

- **New tabs/popups:** if an action opens a new page context, verify the current URL/title and re-snapshot there before continuing.
- **Hidden or off-screen elements:** scroll first, then wait, then interact.
- **Custom widgets:** many date pickers, comboboxes, and menus render extra DOM after a click; re-snapshot before the next step.
- **Slow apps:** prefer waiting on a specific element or URL over fixed sleeps, and use timed waits only as a last resort.
- **Parallel work:** use named sessions when comparing sites, scraping concurrently, or keeping separate auth states.

