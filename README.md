# PodMule plugin

Connect your agent to your own [PodMule](https://podmule.com) podcast workspace — shows, episodes, transcripts, the knowledge base built from your back catalogue, clips, guest CRM and interview bookings.

The plugin bundles two things: a reference to PodMule's remote MCP server, and five skills that tell your agent when to use which part of it. Connecting without the skills gives you three tools and no idea how to drive them.

**You need a PodMule workspace.** This plugin talks to your data; it does nothing on its own. You sign in with your normal PodMule account the first time your agent connects — there is no API key to copy. If you don't have an account yet, start at [podmule.com](https://podmule.com).

Connector URL: `https://app.podmule.com/mcp` · Full setup guide: [app.podmule.com/mcp-setup](https://app.podmule.com/mcp-setup)

## Install

### Claude Code

```
/plugin marketplace add Squared-Lemons-Ltd/podmule-plugin
/plugin install podmule@podmule
```

Then `/mcp` and sign in. A browser window opens for PodMule's consent screen; if you belong to more than one workspace you pick which one the connection uses.

> Non-interactive sessions (`claude -p`, the Agent SDK) cannot complete the OAuth flow and will report the tools as unavailable. Authorise once from an interactive session first.

### ChatGPT desktop

Open the Plugins Directory, add `Squared-Lemons-Ltd/podmule-plugin` as a marketplace, then install **PodMule** from it and sign in.

> The ChatGPT **chat** surface is not reachable this way — it needs a connector ID minted by your own developer-mode registration, which no distributable package can carry. Codex and ChatGPT desktop work.

### One click, other surfaces

[![Add to Cursor](https://img.shields.io/badge/Cursor-Add_PodMule-000000?style=flat-square&logo=cursor&logoColor=white)](cursor://anysphere.cursor-deeplink/mcp/install?name=podmule&config=eyJ0eXBlIjoiaHR0cCIsInVybCI6Imh0dHBzOi8vYXBwLnBvZG11bGUuY29tL21jcCJ9)
[![Add to VS Code](https://img.shields.io/badge/VS_Code-Add_PodMule-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=podmule&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fapp.podmule.com%2Fmcp%22%7D)
[![Add to VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-Add_PodMule-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=podmule&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fapp.podmule.com%2Fmcp%22%7D&quality=insiders)
[![Add to LM Studio](https://files.lmstudio.ai/deeplink/mcp-install-light.svg)](lmstudio://add_mcp?name=podmule&config=eyJ1cmwiOiJodHRwczovL2FwcC5wb2RtdWxlLmNvbS9tY3AifQ==)
[![Add to Replit](https://img.shields.io/badge/Replit-Add_PodMule-F26207?style=flat-square&logo=replit&logoColor=white)](https://replit.com/integrations?mcp=eyJkaXNwbGF5TmFtZSI6IlBvZE11bGUiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hcHAucG9kbXVsZS5jb20vbWNwIn0=)
[![Add to Goose](https://img.shields.io/badge/Goose-Add_PodMule-2D8C7F?style=flat-square)](goose://extension?url=https%3A%2F%2Fapp.podmule.com%2Fmcp&type=streamable_http&id=podmule&name=PodMule&description=Search%2C%20draft%20and%20manage%20your%20podcast%20workspace.)

These add the MCP connection only — the skills come with the plugin package, so Claude Code and ChatGPT desktop get more out of it.

### Anything else

Any MCP client that speaks Streamable HTTP with OAuth can point at the URL directly:

```json
{
  "mcpServers": {
    "podmule": {
      "type": "http",
      "url": "https://app.podmule.com/mcp"
    }
  }
}
```

`"type"` is not optional. Claude Code reads a `url` entry without it as a stdio server, skips it, and errors.

## What the skills do

| Skill | Ask it |
|---|---|
| `find-in-back-catalogue` | "Which episodes discuss burnout?" · "Find the exact quote and timestamp." |
| `draft-clips` | "Draft clips from Tuesday's episode." |
| `interview-brief` | "Brief me on my next guest." |
| `episode-writeup` | "Generate show notes and titles for episode 42." |
| `workspace-triage` | "What needs my attention today?" |

`find-in-back-catalogue` is read-only and the best first thing to try. The clip and write-up skills change your workspace, so they ask before doing so.

## Repo layout

```
.claude-plugin/marketplace.json    the catalog, read by both Claude and ChatGPT desktop
plugins/podmule/
  .claude-plugin/plugin.json       Claude manifest
  .codex-plugin/plugin.json        Codex/ChatGPT manifest
  .mcp.json                        the connector declaration, shared by both
  skills/                          five skills, shared by both
scripts/check-manifests.mjs        structural checks on the manifests
scripts/check-capability-drift.mjs fails when a skill names a capability that no longer exists
```

Both manifests point at one skills directory and one `.mcp.json`, so the two ecosystems can never drift apart in content — only in the presentation fields each one reads.

## Checks

```
node scripts/check-manifests.mjs
node scripts/check-capability-drift.mjs
```

The drift check reads PodMule's public capability list and fails if a skill mentions something the server no longer registers. It needs no credentials, and runs in CI on every push and pull request. Renaming a capability in the product is exactly the kind of change that otherwise breaks installed guidance silently.

## Licence

MIT — see [LICENSE](LICENSE).
