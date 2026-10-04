# Better Harness Task-Loop Report

## At a Glance

- Loop Effectiveness: 51/100 (changes only after comparable later task outcomes)
- Asset Health / Repair Progress: 0/100 (0 verified, 0 partial, 6 pending)
- Demonstrated autonomy radius: not observed (not observed; not observed confidence)
- Strongest loop: Not enough evidence difference to name one.
- Largest observed leak: Use the priority moves; no single loop is uniquely weakest.
- Top expected gain: No priority benefit is available in this evidence boundary.

## What You Can Rely On Today

- No reliable user outcome has been demonstrated in this evidence boundary yet.

## What You Gain Next

- No priority Harness move is available in this evidence boundary.



### Why these moves matter

### The agent can still write the real vault file and read some .env variants
- Priority: High · Evidence: not observed in this boundary
- Reason: Fact: CLAUDE.md:4 says `.env*` and `data/` are denied, and AGENTS.md calls this non-negotiable. .claude/settings.json:16-26 denies only these: Read on `.env`, `.env.local` and `.env.*.local`; Edit on `.env`; Read on `data/**`; and three exact `cat`/`type .env` commands. Nothing denies Edit or Write under `data/`, where DATA_FILE points to `data/vault.json` per .env.example. Read is not denied for `.env.production`, `.env.development` or `.env.test`, and Edit is not denied for `.env.local`. .gitignore also misses `.env.production` and `.env.test`; `git check-ignore` matched only `data/`. Inference: an agent can corrupt the real encrypted vault, or read a secrets file that the rules say is protected, with no permission prompt. No breach was observed. Owner: the permissions.deny block in .claude/settings.json, plus .gitignore. Provider: Claude. Uncertainty: deny rules were reviewed statically, not dry-run for each path variant.
- Expected Output:
  1. The deny list covers Read and Edit for every `.env` variant except `.env.example`, and Edit for `data/**`. .gitignore ignores all non-example `.env` files.

### Code that logs the master password passes the lint hook, npm run lint and the tests
- Priority: Medium · Evidence: not observed in this boundary
- Reason: Fact: AGENTS.md says the master password is never logged. eslint.config.js:15 sets `no-console` to `warn`, the `lint` script is `eslint .` with no warning limit, and ESLint exits 0 on warnings alone. scripts/hooks/lint-on-edit.mjs:21-22 treats exit 0 as `ESLint OK`, sends that only as a user-facing systemMessage, and throws away the warning text. No test checks log output. Inference: a `console.log(req.body)` added to the session or account routes would leak the master password, and every check the agent is told to run would still pass. Owner: the `no-console` rule in eslint.config.js. Raising it to `error` makes the hook and `npm run lint` both fail. Provider: Claude. Accounted: the lint envelope's `hook-blocking-contract-mismatch` error on this hook is deferred. A PostToolUse exit 2 cannot undo the edit, but its stderr does reach Claude, which is what the hook intends.
- Expected Output:
  1. A `console.log` in src/ fails `npm run lint`, and the PostToolUse lint hook reports it back to the agent.

### A requested change to an API error message shipped with no spec rule or test
- Priority: Medium · Evidence: not observed in this boundary
- Reason: Fact: session Episode E4 asked to change the `Rota não encontrada.` message. After its one-file edit, no check was observed. Commit 9cddcca then shipped the new 404 text at src/app.js:104 inside the favoritas feature commit. Spec 004 has no rule for it, and no test asserts the 404 body; test/api.test.js only checks status codes. AGENTS.md and the implementar-com-spec Skill require spec, then a failing test, then code for any behavior change. Inference: an API response change got around the spec-first route and is unprotected against regression. The edit was requested, so it is not silent scope creep. Owner: test/api.test.js plus the spec that owns error responses. Provider: Claude. Uncertainty: Skill invocation is not observable in session facts.
- Expected Output:
  1. One spec rule and one API test pin the 404 body, so a future change to the text fails `npm test`.

### Commits reach main with no automatic test or lint proof
- Priority: Medium · Evidence: not observed in this boundary
- Reason: Fact: the three commits made during this review, including the favoritas feature, went straight to main. There is no CI (.github is absent), no pre-commit hook, and no Stop hook. The only automatic check is the PostToolUse hook, and its matcher is `Edit|Write` (.claude/settings.json:31), so files changed through Bash skip it. Bash was the most used tool in the analyzed sessions. In the one project-change Episode (E4), no check was observed after the edit. Inference: the `npm test` + `npm run lint` before 'done' rule depends on the agent remembering it, and the human approving `git commit` sees no test result. Owner: hooks in .claude/settings.json. A PreToolUse hook on `git commit` that runs the roughly 2-second suite is the smallest gate. Provider: Claude. Uncertainty: hook-run lint may not show in session facts as a check.
- Expected Output:
  1. A git commit from the agent is blocked unless npm test and npm run lint pass on the tree being committed.

### Spec 002 still describes the old entry listing without the favorita field
- Priority: Low · Evidence: not observed in this boundary
- Reason: Fact: AGENTS.md makes docs/specs the source of truth for behavior. docs/specs/002-cofre-de-senhas.md still documents the listing, POST and PUT shapes without `favorita`, while docs/specs/004-favoritas.md redefines them. Neither spec says which one wins. Inference: an agent following the implementar-com-spec Skill can open spec 002 first, as its owner chain directs, and implement or test against the old contract. Owner: docs/specs/002-cofre-de-senhas.md. Provider: project-wide. Uncertainty: no Episode was observed being misled by it yet.
- Expected Output:
  1. Spec 002 and spec 004 describe the same entry shape, and 002 links to 004.

### No review can yet show whether the spec-first Skill and lint Hook are used in feature work
- Priority: Low · Evidence: not observed in this boundary
- Reason: Fact: the session lane analyzed 5 Claude sessions. Of the 5 emitted Episodes, 3 are this review, which was not filtered as self-analysis. Another 4 candidates were cut by budget, and no request roots were available, so the repeated-workflow scan is incomplete. No Episode shows the implementar-com-spec Skill being invoked or the Hook firing. Inference: Learning Capture can't decide whether the existing assets are working or whether any procedure repeats. This is an evidence gap, not a defect in the assets. Owner: the harness evidence log in docs/harness/. Provider: Claude. Deferred: the `.env` read lead (2 Episodes) is already covered by CLAUDE.md's `.env.example` rule.
- Expected Output:
  1. A dated baseline in docs/harness/evidencias.md that the next review can compare against.

## Five Lifecycle Dimensions

| Dimension | What the evidence proves | Evidence boundary | Summary | Boundary / blocker |
| --- | --- | --- | --- | --- |
| Task Understanding | Not observed yet | not observed in this boundary | Rules, the spec-first Skill and numbered specs give a clear acceptance route. One requested behavior change bypassed it, and spec 002 no longer matches the listing contract. | not observed |
| Controlled Execution | Not observed yet | not observed in this boundary | Start, test and lint commands are documented and run. The deny list leaves the real vault file writable and some .env variants readable, despite the documented guarantee. | not observed |
| Change Validation | Not observed yet | not observed in this boundary | The suite is fast and covers the core secret invariants. The rule against logging the master password has no failing check, and the 404 change has no test. | not observed |
| Reliable Delivery | Not observed yet | not observed in this boundary | Commits go straight to main. The only acceptance evidence is local validation that the agent reports itself. git commit and push are ask-gated, but nothing runs tests before them. | not observed |
| Learning Capture | Not observed yet | not observed in this boundary | Earlier harness reports and a deny-rule repair show a review habit. No later comparable window yet shows that the Skill or Hook improved ordinary work. | not observed |

## The 15 Small Checks

| Dimension | Small check | What the evidence proves | Evidence boundary |
| --- | --- | --- | --- |


## Evidence and Boundaries

- Episode coverage: 0 episodes, 0 edited, 0 closed, 0 repaired-and-passed
- Model: agent-work-loop-v4
- Session selection: not observed; 0 sessions analyzed of 0 eligible sessions; not observed confidence
- Delivery grades observed: not observed
- Source gaps: not observed
- Learning comparison: Not observed; 0 declared intervention(s)
