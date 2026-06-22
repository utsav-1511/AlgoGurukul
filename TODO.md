# TODO

- [ ] Modify `Frontend/src/pages/ProblemPage.jsx` to enforce auth gating:
  - [ ] Lock Monaco editor (readOnly true + onChange no-op) when not authenticated
  - [ ] Disable Run and Submit buttons when not authenticated
  - [ ] Redirect to `/signin` (either on click attempts via handlers or via an overlay message)
- [x] (No backend changes) Verify frontend behavior manually


