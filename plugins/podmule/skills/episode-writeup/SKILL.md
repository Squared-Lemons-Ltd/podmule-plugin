---
name: episode-writeup
description: Produce the written assets for a PodMule episode — titles, show notes, chapters and metadata. Use when someone asks to write up, describe, title or generate show notes for a recording.
---

# Write up an episode

Titles, show notes, chapters and metadata are the assets that decide whether anyone finds an episode. PodMule generates them from the transcript, using the show's own stored prompts and brand voice — which is why the generation belongs on the server rather than in a chat window.

## Prefer PodMule's own generation

`enqueue_show_notes_generation` runs the workspace's stored show-notes prompt with the show's brand voice and the episode transcript threaded in. Hand-writing show notes in the conversation instead produces something that reads fine and sounds nothing like the show — the brand voice is stored for a reason, and it does not travel into a chat prompt.

The same applies to `enqueue_title_generation` and `enqueue_chapter_generation`. Chapters in particular need transcript timestamps to be correct, which is not something to reconstruct by hand.

`enqueue_full_episode_pipeline` runs the whole sequence — transcribe, chunk, notes, titles, chapters, metadata — and is the right call for a freshly uploaded recording rather than four separate asks.

## These are jobs, not answers

Every `enqueue_*` capability returns a `job_id` immediately and does the work in the background. Nothing is written when the call returns. `get_job_status` reports pending, running, completed or failed against that id.

Tell the user it has been kicked off rather than describing the output, and keep the `job_id` — without it there is no way to answer "is it done yet?" a few minutes later except guessing.

## When the user wants to see before committing

`generate_show_notes_preview` produces show notes inline and returns them **without** writing to the episode. It also returns the resolved prompt — which key it used and whether it came from the workspace or the platform default — so a user who thinks the notes are off can see which prompt actually ran. That is usually the real question behind "these don't sound right".

Use the preview when the words are "preview", "show me", or "what would they look like". Use the enqueued generation when the user wants the episode updated.

## Editing rather than generating

`update_episode` sets fields directly. Pass only what changes; `null` clears a field explicitly and an omitted field is left alone — so a partial update never silently blanks something.

Status is different: `change_episode_status` validates the transition, and going through `update_episode` bypasses that check. Use the status capability for status.

## Before you start

`get_episode` shows what already exists. Regenerating show notes over notes someone hand-edited destroys their work with no undo, so check, and ask before overwriting anything that is already populated.
