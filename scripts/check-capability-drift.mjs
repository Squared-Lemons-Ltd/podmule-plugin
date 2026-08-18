#!/usr/bin/env node
/**
 * Fail when a bundled skill names a PodMule capability that no longer exists.
 *
 * The skills live here; the capability registry lives in the product repo. A
 * rename there silently breaks installed guidance — an agent is told to call a
 * tool that isn't registered, and nobody finds out until a user does. The
 * `social_posts` → `clips` rename would have broken every skill referencing
 * `create_social_post` in exactly this way.
 *
 * The live capability list is public and unauthenticated, so this needs no
 * credentials and runs on every push and pull request.
 *
 *   node scripts/check-capability-drift.mjs
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const SKILLS_DIR = join(REPO_ROOT, 'plugins', 'podmule', 'skills')
const CAPABILITIES_URL =
  process.env.PODMULE_CAPABILITIES_URL ?? 'https://app.podmule.com/api/v1/capabilities'

/**
 * The MCP facade tools. They are registered by the server itself rather than
 * being entries in the capability registry, so they never appear in the list
 * this script fetches — and a drift check that flagged them would fail on day
 * one for the wrong reason.
 */
const FACADE_TOOLS = new Set(['search', 'execute', 'ask_podmule'])

/**
 * A capability reference in a skill is a bare snake_case identifier written in
 * prose or backticks. Matching on shape alone would flag ordinary English
 * (`show_notes`, `first_name`), so a token only counts as a reference when it
 * starts with a verb PodMule actually uses to name capabilities. That keeps
 * false positives out without maintaining a second list to drift from.
 */
const CAPABILITY_PREFIXES = [
  'activate', 'add', 'apply', 'authorize', 'cancel', 'change', 'convert',
  'create', 'delete', 'describe', 'enqueue', 'find', 'generate', 'get',
  'import', 'link', 'list', 'match', 'move', 'prepare', 'reingest', 'relabel',
  'remove', 'reschedule', 'schedule', 'search', 'send', 'set', 'switch',
  'update', 'upsert',
]

const REFERENCE_PATTERN = new RegExp(
  `\\b(?:${CAPABILITY_PREFIXES.join('|')})_[a-z0-9]+(?:_[a-z0-9]+)*\\b`,
  'g',
)

function skillFiles(dir) {
  const found = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) found.push(...skillFiles(path))
    else if (entry.endsWith('.md')) found.push(path)
  }
  return found
}

function referencesIn(text) {
  return new Set(text.match(REFERENCE_PATTERN) ?? [])
}

async function liveCapabilityNames() {
  const response = await fetch(CAPABILITIES_URL, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(
      `${CAPABILITIES_URL} returned ${response.status}. The capability list is public, so this is an outage or a moved endpoint, not an auth problem.`,
    )
  }
  const body = await response.json()
  const items = Array.isArray(body?.items) ? body.items : []
  if (items.length === 0) {
    throw new Error(`${CAPABILITIES_URL} returned no capabilities. Refusing to pass a check against an empty list.`)
  }
  return new Set(items.map(item => item.name))
}

async function main() {
  const live = await liveCapabilityNames()
  const files = skillFiles(SKILLS_DIR)

  if (files.length === 0) {
    console.error(`No skills found under ${SKILLS_DIR}.`)
    process.exit(1)
  }

  const problems = []
  for (const file of files) {
    const relative = file.slice(REPO_ROOT.length)
    for (const reference of referencesIn(readFileSync(file, 'utf8'))) {
      if (FACADE_TOOLS.has(reference) || live.has(reference)) continue
      problems.push({ file: relative, reference })
    }
  }

  console.log(`Checked ${files.length} skill file(s) against ${live.size} live capabilities.`)

  if (problems.length > 0) {
    console.error('\nCapability drift — a skill names something the server no longer registers:\n')
    for (const { file, reference } of problems) {
      console.error(`  ${file}: "${reference}" is not in the live capability list`)
    }
    console.error(
      '\nEither the capability was renamed in the product and the skill needs updating, or the name is a typo.\n',
    )
    process.exit(1)
  }

  console.log('No drift: every capability named in a skill exists.')
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
