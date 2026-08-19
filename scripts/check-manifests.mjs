#!/usr/bin/env node
/**
 * Structural checks on the manifests, for the failures that are silent.
 *
 * Every one of these has a real failure mode behind it:
 *   - `.mcp.json` without `type` — Claude Code reads a `url` entry with no
 *     `type` as a stdio server, skips it, and errors.
 *   - a marketplace `source` pointing at a directory that isn't there — the
 *     install fails only for the person installing, never for us.
 *   - the connector URL drifting between manifests — OpenAI treats a change of
 *     scheme, hostname or port as a brand-new plugin.
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const CANONICAL_URL = 'https://app.podmule.com/mcp'

const problems = []

function read(relative) {
  const path = join(REPO_ROOT, relative)
  if (!existsSync(path)) {
    problems.push(`${relative} is missing`)
    return null
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    problems.push(`${relative} is not valid JSON: ${error.message}`)
    return null
  }
}

const registryEntry = read('server.json')
const marketplace = read('.claude-plugin/marketplace.json')
const claudeManifest = read('plugins/podmule/.claude-plugin/plugin.json')
const codexManifest = read('plugins/podmule/.codex-plugin/plugin.json')
const mcp = read('plugins/podmule/.mcp.json')

if (marketplace) {
  if (!marketplace.owner?.name) problems.push('marketplace.json: Claude requires owner.name')
  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
    problems.push('marketplace.json: no plugins listed')
  }
  for (const plugin of marketplace.plugins ?? []) {
    if (typeof plugin.source !== 'string') {
      problems.push(`marketplace.json: plugin "${plugin.name}" needs a relative-path source string (the form both readers accept)`)
      continue
    }
    if (!existsSync(join(REPO_ROOT, plugin.source))) {
      problems.push(`marketplace.json: plugin "${plugin.name}" source "${plugin.source}" does not exist`)
    }
    if (!plugin.policy?.installation) problems.push(`marketplace.json: plugin "${plugin.name}" needs policy.installation for the ChatGPT desktop reader`)
    if (!plugin.category) problems.push(`marketplace.json: plugin "${plugin.name}" needs a category for the ChatGPT desktop reader`)
  }
  if (!marketplace.interface?.displayName) {
    problems.push('marketplace.json: interface.displayName is what ChatGPT desktop shows in the Directory')
  }
}

const servers = mcp?.mcpServers ?? {}
if (Object.keys(servers).length === 0) problems.push('.mcp.json: no mcpServers declared')
for (const [name, server] of Object.entries(servers)) {
  if (server.url && !server.type) {
    problems.push(`.mcp.json: server "${name}" has a url but no type — Claude Code will read it as stdio, skip it, and error`)
  }
  if (server.url && server.url !== CANONICAL_URL) {
    problems.push(`.mcp.json: server "${name}" url is "${server.url}", not the canonical ${CANONICAL_URL}`)
  }
}

for (const [label, manifest] of [['claude', claudeManifest], ['codex', codexManifest]]) {
  if (!manifest) continue
  if (manifest.name !== 'podmule') problems.push(`${label} plugin.json: name must stay "podmule" — Claude Code derives tool names from it, so changing it breaks users' permission rules`)
  if (manifest.mcpServers !== './.mcp.json') problems.push(`${label} plugin.json: mcpServers should point at the shared ./.mcp.json`)
  if (manifest.skills !== './skills/') problems.push(`${label} plugin.json: skills should point at the shared ./skills/`)
}

if (claudeManifest && codexManifest && claudeManifest.version !== codexManifest.version) {
  problems.push('plugin.json versions differ between the Claude and Codex manifests')
}

// A manifest naming an asset that isn't there fails worse than one with no
// asset — the listing renders broken rather than plain, and only in someone
// else's client. This is why the artwork fields were omitted until there was
// real artwork to point at.
const ASSET_FIELDS = ['logo', 'composerIcon', 'icon']
for (const [label, manifest] of [['claude', claudeManifest], ['codex', codexManifest]]) {
  if (!manifest) continue
  for (const source of [manifest, manifest.interface ?? {}]) {
    for (const field of ASSET_FIELDS) {
      const value = source[field]
      if (typeof value !== 'string') continue
      if (/^https?:\/\//.test(value)) continue
      if (!existsSync(join(REPO_ROOT, 'plugins', 'podmule', value))) {
        problems.push(`${label} plugin.json: ${field} points at "${value}", which does not exist`)
      }
    }
  }
}

// The MCP registry entry is a fourth place the connector URL is written down,
// and the one nobody looks at again after publishing.
if (registryEntry) {
  if (!registryEntry.name?.startsWith('com.podmule/')) {
    problems.push('server.json: name must sit under the DNS-verified com.podmule namespace')
  }
  const remotes = registryEntry.remotes ?? []
  if (remotes.length === 0) problems.push('server.json: no remotes declared')
  for (const remote of remotes) {
    if (remote.url !== CANONICAL_URL) {
      problems.push(`server.json: remote url is "${remote.url}", not the canonical ${CANONICAL_URL}`)
    }
    if (remote.type !== 'streamable-http') {
      problems.push(`server.json: remote type is "${remote.type}"; this endpoint speaks streamable-http`)
    }
  }
  // The registry rejects anything longer at publish time, which is a slow way
  // to find out.
  if ((registryEntry.description ?? '').length > 100) {
    problems.push('server.json: description must be 100 characters or fewer')
  }
}

if (problems.length > 0) {
  console.error('Manifest problems:\n')
  for (const problem of problems) console.error(`  ${problem}`)
  console.error('')
  process.exit(1)
}

console.log('Manifests look sound.')
