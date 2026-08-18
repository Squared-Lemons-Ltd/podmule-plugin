---
name: draft-clips
description: Draft short-form clips from a PodMule episode — read the transcript, propose the moments worth cutting, and create them as draft clips on the episode. Use when someone wants clips, shorts or social cuts from a recording.
---

# Draft clips from an episode

A clip in PodMule is a short piece of content hung off an episode, headed for social distribution. This skill turns a recording into a set of draft clips grounded in what was actually said.

## Find the moments before writing anything

The transcript is the source. `search_transcripts` scoped to the episode surfaces candidate moments; `get_transcript_window` expands each hit into the surrounding section with timestamps, which is what tells you whether a moment stands on its own or only makes sense after three minutes of setup.

What makes a good clip is a self-contained turn: a claim, a story with a beginning, a disagreement, a number that lands. What makes a bad one is a moment that needs the preceding question to parse. The timestamps are the honest test — if the interesting sentence starts thirty seconds into a window that only makes sense from the top, the clip is the whole window or it is nothing.

Aim for a handful of strong candidates rather than an exhaustive list. Five clips someone will actually cut beats twenty they have to triage.

## Write from the transcript, not around it

Each clip carries a title and a description. Both should come from what was said. A title that paraphrases the actual line is findable later; a title that describes the episode generically is not.

Record where the moment is — the timestamp belongs in the description, because whoever cuts the video needs it and nothing else in the clip record carries it.

## Create them as drafts

`create_clip` needs the episode id and a title, and takes description, tags and an external link. Clips land in draft state, which is the right place to leave them: the person whose show it is decides what ships.

Confirm the set with the user before creating, and show them the titles and timestamps rather than a count. Creating ten clips someone did not want is a mess to undo one at a time.

`update_clip` revises one afterwards. `schedule_clip` moves a clip to authorised with a publish time — that is a publishing decision, so it needs an explicit ask, not an inference from enthusiasm.

## When the transcript is not there yet

An episode with no transcript has nothing to clip from. `get_episode` shows whether it has been processed. If it has not, the honest answer is that the recording needs processing first — say that rather than inventing plausible-sounding moments, which is the failure mode that makes a clip list worthless.
