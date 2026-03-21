# @hooked-so/mcp — Hooked MCP Server

Model Context Protocol server for the [Hooked Video API](https://hooked.so/api). Let AI agents (Claude, GPT, Cursor, etc.) create videos programmatically.

## Quick Setup

### 1. Get your API key

Sign up at [hooked.so](https://hooked.so) and create an API key in Settings → API Keys.

### 2. Add to Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hooked": {
      "command": "npx",
      "args": ["-y", "@hooked-so/mcp"],
      "env": {
        "HOOKED_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 3. Add to Cursor

Add this to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "hooked": {
      "command": "npx",
      "args": ["-y", "@hooked-so/mcp"],
      "env": {
        "HOOKED_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_avatars` | List available AI avatars |
| `list_voices` | List available AI voices |
| `list_music` | List background music tracks |
| `create_script_to_video` | Create video from a script with AI avatar |
| `create_prompt_to_video` | Create video from a text prompt (AI generates everything) |
| `create_tiktok_slideshow` | Create TikTok-style slideshow |
| `create_ugc_ad` | Create UGC-style ad video |
| `get_video` | Check video status and get download URL |
| `list_videos` | List recent videos |
| `get_trending_videos` | Get trending videos for inspiration |

## Example Prompts

Once connected, you can ask your AI assistant:

- "Create a 30-second product video for my new app using avatar Sophia"
- "Make a TikTok slideshow about 5 productivity tips"
- "What avatars are available? Show me the female ones"
- "Check the status of my last video"
- "What's trending on TikTok in the fitness niche?"

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HOOKED_API_KEY` | Yes | Your Hooked API key |
| `HOOKED_API_URL` | No | Custom API base URL (default: `https://api.hooked.so/api`) |

## Development

```bash
pnpm install
pnpm build
```

## License

MIT
