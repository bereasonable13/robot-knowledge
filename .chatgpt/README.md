# ChatGPT Integration

## Overview

This integration syncs your knowledge base to ChatGPT's Custom Instructions, giving ChatGPT memory across conversations.

## How It Works
```
Git commit → Webhook → Format knowledge → OpenAI API → Update custom instructions
```

## Setup

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key

### 2. Configure
```bash
cd ~/robot-knowledge
# Edit .chatgpt/config.json
# Add your API key
```

### 3. Test
```bash
robot sync chatgpt
# Verify custom instructions updated in ChatGPT
```

## Custom Instructions Format

ChatGPT has two custom instruction fields:
1. **What would you like ChatGPT to know about you?** (1500 chars max)
2. **How would you like ChatGPT to respond?** (1500 chars max)

The sync will automatically format KNOWLEDGE.md to fit both fields.

## Sync Frequency

- **Manual:** `robot sync chatgpt`
- **Automatic:** On every git commit (when enabled)

## Files

- `config.json` - ChatGPT configuration
- `custom_instructions_template.md` - Template for formatting
- `README.md` - This file

## Status

❌ Not implemented yet (placeholder for future)

To enable:
1. Implement OpenAI custom instructions API
2. Set enabled: true in config.json
3. Add API key
