# Better Harness Task-Loop Report

## At a Glance

- Loop Effectiveness: 61/100 (changes only after comparable later task outcomes)
- Asset Health / Repair Progress: 50/100 (3 verified, 1 partial, 2 pending)
- Demonstrated autonomy radius: not observed (approval prompts are not visible as outcomes)
- Strongest loop: Change Validation — acceptance tests written per criterion, failing before the code that satisfies them.
- Largest observed leak: Reliable Delivery — nothing runs the test suite before a commit; the gate is a human reading the diff.
- Top expected gain: close write access to `data/` and the remaining `.env` variants.

## What You Can Rely On Today

- A spec change leads to a failing acceptance test before code: observed for CA-13, CA-15, CA-08 (POST /sair) and CA-18 in the feature 001 episodes.
- Reads of `.env` are denied by project permissions (observed in the proof session).
- The `implementar-com-spec` Skill loads without being named and stops for approval on a new spec (observed).

## What You Gain Next

- Deny `Edit`/`Write` on `data/**` and `.env.*`.
- Make a `console.log` of a secret fail lint, so the existing hook catches it.
- Run `npm test` before `git commit`, not only lint after edits.

### Why these moves matter

### The agent can still write the real vault file and read some .env variants
- Priority: High · Evidence: observed in this boundary
- Reason: Fact: CLAUDE.md says `.env*` and `data/` are denied. `.claude/settings.json` denies Read on `.env`, `.env.local`, `.env.*.local` and `data/**`, and Edit only on `.env`. Nothing denies Edit or Write under `data/` (DATA_FILE points to `data/vault.json`), and Read is not denied for `.env.production` or `.env.test`. `.gitignore` also misses `.env.production` and `.env.test`. Inference: an agent "fixing" a broken vault could overwrite users' encrypted data. Uncertainty: no such write was observed.
- Expected Output:
  1. Deny rules for Edit/Write on `data/**` and Read/Edit on `.env.*` (keeping `.env.example` readable), and `.gitignore` covering `.env.*` with `!.env.example`.

### A console.log of the master password would pass the hook, lint and tests
- Priority: Medium · Evidence: not observed in this boundary
- Reason: Fact: `eslint.config.js` sets `no-console` to `warn`; the PostToolUse hook only blocks on exit code ≠ 0, and ESLint exits 0 on warnings. AGENTS.md says the master password is never logged. Inference: the one rule the hook could enforce mechanically is not enforced.
- Expected Output:
  1. `no-console` as `error` (with `console.error` allowed), proven by the hook returning exit 2 on a `console.log`.

### Nothing runs the test suite before a commit
- Priority: Medium · Evidence: observed in this boundary
- Reason: Fact: commits ask for confirmation (`ask`), and the hook lints edited files. In 9 coding episodes, the agent ran `npm test` before every commit — but only because AGENTS.md asks it to. Inference: the gate is self-reported plus a human reading the diff.
- Expected Output:
  1. A PreToolUse hook on `git commit` that runs `npm test` and `npm run lint` and blocks on failure.

### A rule the team enforced lives only in one person's memory
- Priority: Medium · Evidence: observed in this boundary
- Reason: Fact: in one episode the user refused a commit because it carried an AI co-author trailer, and the agent saved that preference to its local memory. CLAUDE.md and AGENTS.md do not mention it. Inference: another teammate's session will repeat the mistake.
- Expected Output:
  1. The commit-message rule written in CLAUDE.md.

### The "Configure" command does not work in Windows cmd
- Priority: Low · Evidence: observed in this boundary
- Reason: Fact: AGENTS.md says `cp .env.example .env`; the team works on Windows, and `cp` exists in PowerShell and Git Bash but not in `cmd`.
- Expected Output:
  1. AGENTS.md lists the `cmd` equivalent (`copy`).

### The lint hook blocks between two edits of the same change
- Priority: Low · Evidence: observed in this boundary
- Reason: Fact: in one episode the agent added an import in one Edit and its use in the next; the hook returned exit 2 for `no-unused-vars` in between. The agent continued correctly. Inference: small friction, but it trains the agent to make larger single edits.
- Expected Output:
  1. A decision recorded: keep blocking, or warn and leave blocking to `npm run lint`.

## Five Lifecycle Dimensions

| Dimension | What the evidence proves | Evidence boundary | Summary | Boundary / blocker |
| --- | --- | --- | --- | --- |
| Task Understanding | Demonstrated | observed in this boundary | Spec 001 with 18 criteria and 21 decisions drove a reviewed plan; two behavior changes were written into the spec before the code (D-20, D-21). The Skill created spec 002 and stopped for approval. | — |
| Controlled Execution | Partially demonstrated | observed in this boundary | `.env` read denied in a fresh session; `.env.example` still readable. Write access to `data/` and some `.env` variants remain open. | deny list too narrow |
| Change Validation | Demonstrated | observed in this boundary | One acceptance test per criterion (CA-01..CA-18); tests seen failing before code (CA-13 "70.4 ms vs 4.9 ms", CA-15 cookie without HttpOnly). Hook ran ESLint after edits and blocked once. | — |
| Reliable Delivery | Not observed yet | not observed in this boundary | No CI; no test gate on commit; commit approval is human-only. | no pre-commit test gate |
| Learning Capture | Partially demonstrated | observed in this boundary | Plan records tasks that entered during execution; a team rule (no AI co-author) was learned but stored only in local memory. | rule not in project files |

## Evidence and Boundaries

- Episode coverage: 9 episodes, 9 edited, 9 closed, 3 repaired-and-passed
- Model: agent-work-loop-v4
- Session selection: all-eligible; 14 sessions analyzed of 14 eligible sessions; High confidence
- Delivery grades observed: local commit with human approval
- Source gaps: approval decisions are not recorded as outcomes
- Learning comparison: Compared with the report at tag `aula08`; 3 declared intervention(s)
