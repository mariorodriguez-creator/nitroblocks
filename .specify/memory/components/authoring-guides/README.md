# Block authoring guides

Author-facing guides for **AEM Edge Delivery** blocks may live here: one markdown file per block or feature, often named by block folder (e.g. `embed-instagram.md`). **Preferred** location for a single block is `blocks/{block-name}/README.md` (see **speckit-document** and `.specify/templates/authoring-guide-template.md`).

- **New blocks**: `/speckit-document` creates or refreshes a guide after implementation (primary path or this folder, per workflow).
- **Existing blocks**: when a feature updates a block, `/speckit-document` should fully refresh the guide so content model and variants match current behaviour.

Run `/speckit-document` after implementation, before raising the PR.
