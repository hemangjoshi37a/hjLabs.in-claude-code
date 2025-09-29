# Browser Automation Command

Autonomous web browser interaction with visual feedback and step-by-step workflows.

## Command
`/browse <action> [options]`

## Description

This command enables Claude Code to interact with web browsers autonomously through MCP (Model Context Protocol) servers. It provides visual feedback through screenshots and can execute complex multi-step browser workflows.

**Key Capabilities:**
- **🌐 Smart Navigation**: Automatically opens websites and analyzes content
- **📸 Visual Feedback**: Takes screenshots at each step for context awareness
- **👆 Interactive Actions**: Clicks buttons, fills forms, scrolls pages
- **🤖 Autonomous Workflows**: Creates and executes multi-step browser tasks
- **🧠 Intent Recognition**: Understands natural language browser commands
- **🔍 Element Detection**: Identifies clickable elements and form fields
- **📊 State Monitoring**: Tracks page changes and interaction results

## Browser Actions

### Navigation
```bash
/browse navigate https://github.com
/browse open google.com
/browse go to stackoverflow.com
```

### Interaction
```bash
/browse click "Sign in button"
/browse type "search query" into "search box"
/browse fill form with "username: john, email: john@example.com"
/browse scroll down
/browse wait 3 seconds
```

### Automation Workflows
```bash
/browse workflow "Login to GitHub and create new repository"
/browse automate "Search for 'Claude AI' on Google and take screenshots of first 3 results"
/browse sequence "Open Twitter, navigate to trends, capture trending topics"
```

### Visual Feedback
```bash
/browse screenshot
/browse analyze current page
/browse describe what you see
/browse identify clickable elements
```

## Advanced Usage

### Multi-Step Workflows
The browser automation can execute complex workflows autonomously:

```bash
/browse workflow "Research competitor pricing:
1. Open competitor website
2. Navigate to pricing page
3. Take screenshot of pricing tiers
4. Extract pricing information
5. Compare with our pricing"
```

### Smart Intent Recognition
Natural language commands are automatically converted to browser actions:

```bash
/browse "Find the contact form on this website and fill it with sample data"
/browse "Take screenshots of the home page, about page, and contact page"
/browse "Search for 'Claude Code' and show me the first 5 results"
```

### Form Automation
```bash
/browse form action="fill" fields='{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I am interested in your product"
}'
```

## Browser Automation Modes

### 1. **Interactive Mode** (Default)
- Shows browser window during automation
- Allows real-time monitoring of actions
- Perfect for development and debugging

### 2. **Headless Mode**
```bash
/browse --headless navigate https://example.com
```
- Runs browser invisibly in background
- Faster execution for batch operations
- Ideal for automated testing and data extraction

### 3. **Screenshot Mode**
```bash
/browse --screenshot-each-step open website.com
```
- Automatically captures screenshot after each action
- Provides visual documentation of workflow
- Useful for creating tutorials or reports

## Integration with MCP Servers

The browser automation uses free, open-source MCP servers:

1. **Microsoft Playwright MCP** (Primary)
   - Official Microsoft server
   - Fast accessibility-based automation
   - Supports Chrome, Firefox, WebKit

2. **ExecuteAutomation Playwright MCP** (Fallback)
   - Full-featured with screenshot capabilities
   - JavaScript execution support
   - 4.9k+ GitHub stars

3. **Official Puppeteer MCP** (Backup)
   - Google's Puppeteer library
   - Chrome-based automation
   - Part of official MCP collection

## Examples

### Website Analysis
```bash
/browse "Open https://news.ycombinator.com and screenshot the top 10 stories"
```

**Autonomous Actions:**
1. 🌐 Navigate to Hacker News
2. 📸 Take initial screenshot
3. 🔍 Identify story elements
4. 📸 Capture focused screenshots of top stories
5. 📊 Provide summary of content

### Form Testing
```bash
/browse "Test the contact form on our website with sample data"
```

**Autonomous Actions:**
1. 🌐 Open website contact page
2. 🔍 Locate form fields
3. ⌨️ Fill form with test data
4. 👆 Submit form
5. 📸 Capture success/error messages
6. ✅ Validate form functionality

### Competitive Research
```bash
/browse "Research top 3 competitors' pricing pages and create comparison"
```

**Autonomous Actions:**
1. 🌐 Visit competitor websites
2. 🔍 Navigate to pricing sections
3. 📸 Screenshot pricing tiers
4. 📊 Extract pricing data
5. 📋 Generate comparison report

## Screenshot Management

All screenshots are automatically saved to `.claude/screenshots/` with descriptive names:
- `navigate_github_2025-01-15_10-30-45.png`
- `click_signin_button_2025-01-15_10-31-02.png`
- `form_submission_result_2025-01-15_10-31-20.png`

## Workflow History

View previous browser automation sessions:
```bash
/browse history
/browse workflows
/browse screenshots
```

## Safety Features

- **Element Validation**: Verifies elements exist before interaction
- **Error Recovery**: Handles failed actions gracefully
- **Timeout Protection**: Prevents infinite waiting
- **Screenshot Documentation**: Visual proof of all actions
- **State Verification**: Confirms expected outcomes

## Error Handling

The browser automation includes comprehensive error handling:

```bash
# If element not found
❌ Element "submit button" not found - taking screenshot for analysis
📸 Screenshot saved: error_element_not_found_2025-01-15.png

# If navigation fails
❌ Failed to navigate to website.com - checking connectivity
🔄 Retrying with fallback approach...

# If action times out
⏱️ Action timed out after 30 seconds - capturing current state
📸 Screenshot saved: timeout_state_2025-01-15.png
```

## Performance Optimization

- **Smart Waiting**: Automatically waits for page loads and elements
- **Element Caching**: Reuses element selectors when possible
- **Batch Screenshots**: Groups multiple captures efficiently
- **Resource Management**: Cleans up browser processes properly

## Integration Benefits

With browser automation, Claude Code can now:

✅ **Debug web applications visually**
✅ **Automate repetitive web tasks**
✅ **Test user interface workflows**
✅ **Extract data from websites**
✅ **Monitor web application changes**
✅ **Create automated reports**
✅ **Validate form submissions**
✅ **Research competitor websites**

Transform your development workflow with intelligent, visual browser automation that bridges the gap between terminal-based development and web interaction!