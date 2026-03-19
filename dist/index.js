#!/usr/bin/env node

// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
var API_BASE = process.env.HOOKED_API_URL || "https://api.hooked.so/api";
async function apiRequest(path, apiKey, options = {}) {
  const { method = "GET", body } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    ...body ? { body: JSON.stringify(body) } : {}
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Hooked API error (${res.status}): ${text}`);
  }
  return res.json();
}
function getApiKey() {
  const key = process.env.HOOKED_API_KEY;
  if (!key) {
    throw new Error(
      "HOOKED_API_KEY environment variable is required. Get your key at https://hooked.so"
    );
  }
  return key;
}
var server = new McpServer({
  name: "hooked",
  version: "0.1.0"
});
server.tool(
  "list_avatars",
  "List available AI avatars for video creation",
  {},
  async () => {
    const apiKey = getApiKey();
    const data = await apiRequest("/v1/avatar/list", apiKey);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
server.tool(
  "list_voices",
  "List available AI voices for video narration",
  {},
  async () => {
    const apiKey = getApiKey();
    const data = await apiRequest("/v1/voice/list", apiKey);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
server.tool(
  "list_music",
  "List available background music tracks",
  {},
  async () => {
    const apiKey = getApiKey();
    const data = await apiRequest("/v1/music/list", apiKey);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
server.tool(
  "create_script_to_video",
  "Create a video from a script with an AI avatar. The avatar speaks the script with lip-sync.",
  {
    script: z.string().describe("The video script the avatar will speak"),
    avatarId: z.string().describe("Avatar ID (use list_avatars to find available IDs)"),
    voiceId: z.string().optional().describe("Voice ID (use list_voices to find available IDs)"),
    musicId: z.string().optional().describe("Background music ID"),
    captionStyle: z.string().optional().describe("Caption style (e.g. 'karaoke', 'word-by-word')"),
    webhook: z.string().optional().describe("Webhook URL to receive the completed video")
  },
  async ({ script, avatarId, voiceId, musicId, captionStyle, webhook }) => {
    const apiKey = getApiKey();
    const body = {
      script,
      avatarId
    };
    if (voiceId) body.voiceId = voiceId;
    if (musicId) body.musicId = musicId;
    if (captionStyle) body.captionStyle = captionStyle;
    if (webhook) body.webhook = webhook;
    const data = await apiRequest("/v1/project/create/script-to-video", apiKey, {
      method: "POST",
      body
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
server.tool(
  "create_prompt_to_video",
  "Create a video from a text prompt. AI generates the script, visuals, and narration.",
  {
    prompt: z.string().describe("Describe the video you want to create"),
    avatarId: z.string().optional().describe("Avatar ID (optional, AI will pick one if not specified)"),
    voiceId: z.string().optional().describe("Voice ID"),
    webhook: z.string().optional().describe("Webhook URL to receive the completed video")
  },
  async ({ prompt, avatarId, voiceId, webhook }) => {
    const apiKey = getApiKey();
    const body = { prompt };
    if (avatarId) body.avatarId = avatarId;
    if (voiceId) body.voiceId = voiceId;
    if (webhook) body.webhook = webhook;
    const data = await apiRequest("/v1/project/create/prompt-to-video", apiKey, {
      method: "POST",
      body
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
server.tool(
  "create_tiktok_slideshow",
  "Create a TikTok-style slideshow video from images and text",
  {
    title: z.string().describe("Slideshow title"),
    slides: z.array(z.object({
      text: z.string().describe("Text for this slide"),
      imageUrl: z.string().optional().describe("Image URL for this slide")
    })).describe("Array of slides with text and optional images"),
    voiceId: z.string().optional().describe("Voice ID for narration"),
    musicId: z.string().optional().describe("Background music ID"),
    webhook: z.string().optional().describe("Webhook URL")
  },
  async ({ title, slides, voiceId, musicId, webhook }) => {
    const apiKey = getApiKey();
    const body = { title, slides };
    if (voiceId) body.voiceId = voiceId;
    if (musicId) body.musicId = musicId;
    if (webhook) body.webhook = webhook;
    const data = await apiRequest("/v1/project/create/tiktok-slideshow", apiKey, {
      method: "POST",
      body
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
server.tool(
  "create_ugc_ad",
  "Create a UGC-style ad video with an AI avatar presenting a product",
  {
    script: z.string().describe("Ad script the avatar will speak"),
    avatarId: z.string().describe("Avatar ID"),
    productUrl: z.string().optional().describe("Product page URL for AI to extract visuals"),
    hook: z.string().optional().describe("Opening hook line"),
    cta: z.string().optional().describe("Call-to-action text"),
    webhook: z.string().optional().describe("Webhook URL")
  },
  async ({ script, avatarId, productUrl, hook, cta, webhook }) => {
    const apiKey = getApiKey();
    const body = { script, avatarId };
    if (productUrl) body.productUrl = productUrl;
    if (hook) body.hook = hook;
    if (cta) body.cta = cta;
    if (webhook) body.webhook = webhook;
    const data = await apiRequest("/v1/project/create/ugc-ads", apiKey, {
      method: "POST",
      body
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
server.tool(
  "get_video",
  "Get the status and details of a video by its ID",
  {
    videoId: z.string().describe("The video ID returned from a create call")
  },
  async ({ videoId }) => {
    const apiKey = getApiKey();
    const data = await apiRequest(`/v1/video/${videoId}`, apiKey);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
server.tool(
  "list_videos",
  "List recent videos created by your team",
  {},
  async () => {
    const apiKey = getApiKey();
    const data = await apiRequest("/v1/video/list", apiKey);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
server.tool(
  "get_trending_videos",
  "Get trending videos across platforms (TikTok, YouTube) for content inspiration",
  {
    platform: z.enum(["tiktok", "youtube"]).optional().describe("Filter by platform"),
    niche: z.string().optional().describe("Filter by content niche")
  },
  async ({ platform, niche }) => {
    const apiKey = getApiKey();
    const params = new URLSearchParams();
    if (platform) params.set("platform", platform);
    if (niche) params.set("niche", niche);
    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await apiRequest(`/v1/trends/videos${query}`, apiKey);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
