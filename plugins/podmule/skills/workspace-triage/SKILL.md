---
name: workspace-triage
description: Report what needs attention across a PodMule workspace today, grouped by show — stalled episodes, unprocessed recordings, clips awaiting approval and imminent interviews. Use for "what should I be working on", "what's outstanding" or a start-of-day catch-up.
---

# What needs attention today

A workspace with several shows accumulates work in places nobody looks: an episode recorded and never processed, clips drafted and never approved, an interview tomorrow with no notes. This skill is the sweep that surfaces them. It is entirely read-only — triage reports, it does not fix.

## Establish where you are

`list_workspaces` shows which workspaces the account belongs to and which is currently active. Everything else operates on the active one, so a report that quietly covers the wrong workspace is worse than no report. `switch_workspace` moves between them when the user names one.

`list_shows` gives the shows in the workspace. Grouping by show is what makes the output usable — a flat list of twenty items across four podcasts is a list nobody acts on.

## Where work goes stale

**Episodes.** `search_episodes` filters by show, status and published-date range. What is worth surfacing is the mismatch between state and time: a draft recorded weeks ago, an episode marked ready with no published date, a scheduled episode whose date has passed. `match_episodes` resolves a batch in one call when you already have the ids.

**Clips.** `search_clips` filters by episode and status. Drafts are unfinished work; authorised-but-unpublished are decisions already made that nobody executed. Those are two different kinds of outstanding and worth reporting separately.

**Interviews.** `list_interviews` is sorted by scheduled start. Read its status semantics carefully: `confirmed` does **not** become `completed` when the scheduled time passes, so a list of confirmed bookings mixes tomorrow's recording with one from last March. Filter on the date range yourself. Both directions matter — an interview in three days with no preparation, and a confirmed booking from six weeks ago that never became an episode.

## What makes the report worth reading

Lead with what is urgent or already late, not with whatever the first query returned. Group by show. Say why each item is on the list — "recorded 3 weeks ago, still draft" tells someone what to do; "draft" does not.

Say plainly when a show has nothing outstanding. A clean show is a result, and omitting it silently reads as an oversight.

If everything is clear, say that too. Manufacturing work to fill a report is the one way to make this skill actively harmful.
