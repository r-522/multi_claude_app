# ADR-004: Auth — Single User for MVP

## Status
Accepted

## Context

This tool is a personal developer tool. Multi-user auth (registration, JWT, sessions, permissions) would add significant implementation time without MVP value.

Options:
- **No auth**: Tool is accessible to anyone with the URL
- **Cloudflare Access**: Put Access in front of the Pages domain — zero-code auth, SSO support
- **Remix session middleware**: Full auth stack in the app, supports multiple users
- **HTTP Basic Auth via Cloudflare Pages headers**: Simple but brittle

## Decision

**Single-user MVP with no auth.** The tool is accessed at a non-guessable URL (or behind VPN/Access in production). All records carry `userId = "default"` as a forward-compatibility seam.

All tables include `userId TEXT NOT NULL DEFAULT 'default'`. When auth is added in v2, this field becomes a real user ID — no schema migration needed, just populate it from the session.

## Consequences

**Good:**
- Eliminates auth complexity from MVP (estimated: saves 2 weeks of work)
- No login UX needed
- Multi-user upgrade requires no schema migration

**Bad:**
- Anyone who knows the URL can use the tool (acceptable for a local/private deployment)
- No per-user data isolation in MVP
- Must add Cloudflare Access or full auth before sharing the URL publicly

## v2 Upgrade Path

1. Add Cloudflare Access in front of Pages (dashboard-only, zero code change)
   - Or: add Remix session middleware + KV session store
2. Populate `userId` from the authenticated session (one line change per service)
3. Add `WHERE user_id = ?` to all repository queries (already parameterized)
