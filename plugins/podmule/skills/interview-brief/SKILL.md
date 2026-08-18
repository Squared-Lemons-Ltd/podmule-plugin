---
name: interview-brief
description: Build a one-page brief on a PodMule interview guest — who they are, what they have already said on the show, and what the show already knows about their subject. Use before recording, or when someone asks to be briefed on a guest or an upcoming interview.
---

# Brief me on this guest

The point of a guest brief is to stop the host asking a question the guest already answered two years ago, and to arrive knowing what the show's own back catalogue says about their subject. Everything here is read-only.

## Start from the booking, or from the person

`list_interviews` gives upcoming bookings sorted by start time — the usual entry point for "who am I talking to next". Note its status semantics: `confirmed` stays confirmed after the scheduled time passes, so a confirmed booking in the list is not proof it is still ahead.

`get_interview` returns one booking in full: contact, show, times, timezones and notes. The notes are usually where the reason for the booking lives.

When the ask names a person rather than a booking, `search_contacts` matches on name, email or company, and `get_contact` returns their groups, social profiles and a preview of recent notes. `list_contact_notes` returns the complete note history — the preview truncates, so use the full list whenever the brief is meant to be thorough.

## Have they been on before?

This is the part a general model cannot do and the part that makes the brief worth reading.

`search_episodes` accepts a guest name and finds prior appearances. `search_knowledge` may hold a guest page — PodMule accumulates one per recurring guest across every episode they appear in, which is a better starting point than re-reading three transcripts. `get_knowledge_page` returns it in full with citations back to the episodes.

If they are new to the show, say so explicitly. "First appearance" is useful information, and it is easy to leave a brief looking thin when it is actually complete.

## What does the show already know about their subject?

Once you know the guest's territory, `search_knowledge` on that topic surfaces what the show has already concluded about it — from other guests, other episodes. That is where the non-obvious questions come from: the places where this guest's position will contradict, confirm or extend something already on record.

`search_transcripts` gets you the exact prior quote when a question depends on one, with a timestamp so the host can check it before saying it out loud.

## What the brief should contain

Who they are and why they are booked. What they have already said on this show, with episode references. What the show already believes about their subject, and where this guest might disagree. A short list of questions that would not have occurred to someone who had not read the back catalogue.

Attribute the claims. A brief whose statements cannot be traced to an episode is a brief the host cannot trust on air.
