---
name: find-in-back-catalogue
description: Find material in a PodMule podcast back catalogue — which episodes discuss a topic, a verbatim quote with its timestamp, or what the show has said about something across every episode. Use whenever a question is about what has already been recorded or published.
---

# Find it in the back catalogue

A podcast back catalogue is the one thing a general-purpose model cannot know. Everything here is read-only, so it is safe to run before any conversation about permissions.

PodMule holds two different views of the same recordings, and picking the wrong one is the main way this goes wrong.

## Transcripts are the evidence layer

`search_transcripts` searches the actual words people said, as spoken. Reach for it when the answer has to be defensible:

- a verbatim quote, or the passage around one
- an exact timestamp — "where does she say that?"
- "which episodes discuss X" / "episodes about X"

Its `matched_episodes` field is the episode list. It is already deduplicated per episode, so it is the right thing to read back to someone asking "which episodes"; re-deriving that list from the individual chunk hits produces duplicates and a worse ordering.

A single chunk is usually too small to quote from — it starts and ends mid-thought. `get_transcript_window` expands a hit into the surrounding section with start and end timestamps, which is what an answer of the form "at 14:32 he says …" actually needs.

## Knowledge is the synthesis layer

`search_knowledge` searches durable pages PodMule maintains per show: one page per episode, plus topic pages and guest pages that accumulate across the whole catalogue. Reach for it when the question is about the show's position rather than a moment in it:

- "what does the show think about X"
- a topic overview, or how a theme developed over time
- everything a recurring guest has contributed
- takeaways across the back catalogue

`get_knowledge_page` returns a page in full, including the citations that ground each claim in a specific episode and quote. Those citations are the bridge back to the evidence layer — a synthesis answer without them is an assertion.

## Choosing between them

The question to ask is whether the answer lives in one moment or across many.

"Did anyone mention the funding round?" is one moment — transcripts. "How has our thinking on funding changed?" is across many — knowledge. When a synthesis answer needs to be quoted or timestamped, start in knowledge and follow the citations down into transcripts; going the other way means reading dozens of chunks to reconstruct a page that already exists.

Knowledge pages are derived, so a very recently processed episode may not be in one yet. If a knowledge search comes back thin on something you know was discussed, the transcript layer is the fallback rather than evidence that it never happened.

## From a result to an episode

Both layers return prefixed episode ids (`ep_…`). `get_episode` turns one into full detail — status, show notes, themes, chapters and the linked guests. `match_episodes` resolves many at once from a set of ids or titles, which is worth using instead of a loop as soon as there is more than a handful.

## Reporting the answer

Say which episode a claim came from, and give the timestamp when you have one — the value of asking a back catalogue rather than a general model is that the answer is attributable. If the search genuinely found nothing, say so plainly; an empty result from a real workspace is information, and it is worth distinguishing from "this workspace has no episodes yet", which reads identically if you do not check.
