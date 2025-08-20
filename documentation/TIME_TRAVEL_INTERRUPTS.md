## LangGraph Time Travel for Interrupt Re-submission

### Why we need this

- Users can edit an earlier interrupt UI (for example, flight search criteria) after the graph has progressed and paused on a later interrupt (for example, payment).
- Our UI already “time-travels” locally by truncating the cached timeline to the earlier interrupt before re-submitting. However, the server keeps its run head at the latest checkpoint unless it is explicitly instructed to rewind. Resuming from a later checkpoint with changed upstream inputs produces inconsistent state and backend errors (example: "No flight offer ID or total flight price found").
- To make re-submissions correct, the backend must support explicit server-side time travel back to the checkpoint associated with the edited interrupt (or an earlier safe checkpoint) before resuming with the new human response.

### TL;DR

- Frontend prunes the local timeline to the edited interrupt.
- Backend must process a submit with two commands together:
  - `goto` a specific checkpoint (or node) belonging to that earlier interrupt
  - `resume` with the new human response
- The graph then re-executes deterministically forward from that point; downstream state is recomputed, preventing stale/missing values.

---

### Current frontend behavior (already implemented)

- When a widget re-submits with its `interruptId`, the client truncates local state:
  - `thread.pruneAfterInterrupt(interruptId)` removes all blocks/messages/UI after that interrupt in the local, persisted store.
- The client then calls `thread.submit({ ... }, { command: { resume: [...] } })` and, on success, marks the interrupt as complete with a frozen snapshot for read-only re-rendering.
- For `SearchCriteriaWidget`, we intentionally keep the widget interactive after submission so users can immediately adjust and re-run searches.

What is missing: server-side rewind. Without `goto`, the run continues from a later checkpoint and may expect state that depends on the earlier values we just changed.

---

### Required backend behavior

1. Accept and honor a `goto` instruction on submit

We need the backend to allow time travel to a precise earlier point in the same thread, before applying `resume`.

Suggested contract (example):

```json
{
  "streamSubgraphs": true,
  "command": {
    "goto": { "checkpoint": "<checkpoint_id>" },
    "resume": [
      {
        "type": "response",
        "data": {
          /* compact submission payload */
        }
      }
    ]
  }
}
```

Notes:

- `goto` target forms to support (any one):
  - `{ checkpoint: "<checkpoint_id>" }` (preferred: exact time travel)
  - `{ node: "<node_name>" }` or `{ tag: "<tag>" }` if the graph exposes stable node or tag names
- After rewinding, the graph should resume using the supplied human response, re-running downstream nodes to regenerate derived state (e.g., new offer id and price).

2. Expose the checkpoint id (or equivalent) on every interrupt

Every interrupt produced by the graph must include metadata the UI can use to target `goto` deterministically. Minimal required fields per interrupt:

```json
{
  "interrupt_id": "<stable_id>",
  "checkpoint_id": "<stable_checkpoint_id>",
  "node": "<optional_node_name>",
  "widget": {
    "type": "SearchCriteriaWidget",
    "args": {
      /* live args to render */
    }
  }
}
```

3. Deterministic rewind semantics

- Rewinding to a checkpoint should restore the graph state exactly as of that point and discard any later transient state in the active run.
- Subsequent execution should recompute downstream values as if the user had provided the new input at the earlier time.

4. Concurrency and idempotency

- If a new re-submission arrives while an old run is still active, the backend should either:
  - cancel the old run before applying the `goto`, or
  - serialize time-travel requests per thread so the newest request wins.
- Repeated re-submissions to the same checkpoint should be idempotent; later submission replaces earlier.

---

### Interrupt envelope contract (proposed)

To enable full UX without extra round-trips, please include these fields in each interrupt payload that renders a widget:

- `interrupt_id` (string): stable id for dedup and completion
- `checkpoint_id` (string): the checkpoint to rewind to for edits
- `node` (string, optional): node name for fallback goto
- `value.widget.type` (string): maps to a front-end component
- `value.widget.args` (object): live arguments to render the widget
- Optional: `value.widget.args.submission` (object): frozen snapshot of the last submitted values (if any), so the UI can hydrate a read-only display

Example minimal shape:

```json
{
  "value": {
    "type": "widget",
    "widget": {
      "type": "SearchCriteriaWidget",
      "args": {
        "flightSearchCriteria": {
          /* live fields */
        },
        "checkpoint_id": "ckpt_123",
        "interrupt_id": "intr_abc"
      }
    }
  },
  "interrupt_id": "intr_abc",
  "checkpoint_id": "ckpt_123"
}
```

---

### End-to-end flow (happy path)

1. Graph emits interrupt A with `interrupt_id = intr_A`, `checkpoint_id = ckpt_A`.
2. User completes A; graph progresses and later emits interrupt B; run is paused on B.
3. User edits A’s widget and presses submit.
4. Frontend:
   - Prunes local timeline after A (visual time travel)
   - Sends submit with `command.goto = { checkpoint: ckpt_A }` and `command.resume = [{ type: "response", data }]`
5. Backend:
   - Rewinds to `ckpt_A`
   - Applies the new response
   - Re-executes nodes; eventually arrives at the next pause (which may be A again, or some later interrupt depending on logic)

---

### Error handling guidelines

- If `goto` is missing or invalid, return a clear 4xx error detailing the missing field(s) rather than resuming from the latest checkpoint.
- If a downstream node relies on derived state (e.g., `offer_id`) and cannot find it, prefer returning an interrupt with a clear remediation message over a generic error.
- Consider emitting structured error interrupts for recoverable issues so the UI can guide the user.

---

### Data the frontend expects to send

On re-submission of an earlier interrupt:

```json
{
  "streamSubgraphs": true,
  "command": {
    "goto": { "checkpoint": "<from interrupt.checkpoint_id>" },
    "resume": [
      {
        "type": "response",
        "data": {
          /* compact user input */
        }
      }
    ]
  },
  "metadata": {
    /* optional */
  }
}
```

---

### Open questions for the backend team

1. Checkpoints

- Do all user-facing interrupts map to a single, stable `checkpoint_id`? If not, what should the UI use for deterministic `goto`?
- Are checkpoint ids guaranteed to stay valid for the lifetime of the thread? Any TTL/compaction concerns?

2. Goto targets

- Should we always prefer `checkpoint` targets, or are `node`/`tag` targets the intended API for your graph? Please specify supported forms.
- If `node`/`tag` is used, what is the exact string we should send for each interrupt type?

3. Resume payload

- What exact shape does the graph expect for a human response at each interrupt? For example, is `{ type: "response", data: { flightSearchCriteria } }` sufficient, or do you require additional keys (e.g., `interrupt_id`, `task_id`, `message_id`)?
- Do you require the UI to echo any server-provided tokens/handles along with the response?

4. Concurrency

- How should we handle a re-submission while a previous run is still executing? Should the backend auto-cancel or queue such requests per thread?

5. Error taxonomy

- Can you provide a small, stable set of error codes/messages we can surface when time travel or downstream recomputation fails (e.g., missing `offer_id`)?

6. Interrupt payload contract

- Can every interrupt include `interrupt_id` and `checkpoint_id` at top-level, and also mirrored under `value.widget.args` for convenience? If not, where should the UI read them from consistently?

7. Persistence expectations

- If the UI re-loads a thread, should it be able to `goto` past checkpoints created in earlier sessions? Any history or retention limits we should respect?

---

### Acceptance criteria (backend)

- Every interrupt includes `interrupt_id` and `checkpoint_id`.
- Submissions that include both `goto` and `resume` rewind and execute from the specified checkpoint.
- Downstream state is recomputed deterministically; no reliance on stale values from later checkpoints.
- Clear, actionable errors are returned when `goto` fails or when required state is not present after rewind.

---

### Minimal example (pseudocode)

```python
# Inside your request handler
payload = request.json()
cmd = payload.get("command", {})
goto = cmd.get("goto")
resume = cmd.get("resume", [])

if goto and "checkpoint" in goto:
    graph.goto(checkpoint_id=goto["checkpoint"])  # rewind server-side

graph.resume(resume)  # apply human response and continue

# Stream results back to client as usual
```

If your framework uses a different API, the essential behavior is the same: rewind first, then resume with the new response.
