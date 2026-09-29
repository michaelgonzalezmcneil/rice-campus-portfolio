# Activity browser checks

Tested sequentially against the production export at localhost:3029.

## YardOS (first)
- Wrong/empty selection: “Try again: compare cell numbers…”
- Keyboard Enter/Space: selected Cart and Cone; “Comparison complete.”
- Replay: Cart aria-pressed=false, feedback empty.
- Narrow view inspected; final campus dialog completed and Escape closed it.

## RiceWalk (second)
- Library then Coffee: order warning.
- Coffee, Library, Garden: budget warning.
- Remove Garden: “Route ready: Coffee → Library, 9 demo minutes.”
- Replay budget 0/10; empty route: required-stops warning.
- Keyboard and mobile campus completion; Escape closed dialog.

## Campus memory lab (third)
- Key Pip: duplicate-name guidance.
- Store owl-23: shelf retains owl-17 and adds owl-23.
- Lookup owl-17: wrong-location guidance.
- Lookup Pip: missing-key guidance.
- Lookup owl-23: exact match and completion.
- Replay: only owl-17 remains; lookup phase gone.
- Stop restores Play button; mobile campus panel inspected.

## Integration
- Activity controls are native buttons; Enter/Space exercised.
- Fiction labels and implementation limits are visible.
- Campus position remained 20.00,10.00 during activity movement input.
- Activity screenshots saved in release/screenshots/.
