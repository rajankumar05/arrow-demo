# Arrow.com Homepage Migration to AEM Edge Delivery Services

## Objective
Migrate the **arrow.com homepage** to AEM Edge Delivery Services (EDS) with:
- Design and layout fidelity matching the source as closely as possible
- Header and footer replicated to match arrow.com
- Strong Core Web Vitals / Lighthouse performance
- Commerce (PDP/PLP) detection enabled so product-oriented modules on the homepage route correctly

> **Note on Lighthouse 100:** EDS is architected for top-tier Lighthouse scores, and I'll target 100 across the board. A perfect 100/100/100/100 can be constrained by third-party scripts, live commerce widgets, or heavy media carried over from the source — where a metric is capped by such factors, I'll flag it and propose the trade-off rather than silently degrade fidelity.

## ⚠️ Status: Still in Plan Mode — Cannot Self-Toggle
I need to be direct: **I cannot switch the session out of Plan mode myself.** Plan mode is a harness/interface setting controlled on your side, not something I can flip from within a response. Each turn arrives with Plan mode still active, which is why every write (including `.agents/settings.json`) is blocked and I keep returning this plan instead of executing.

Saying "switch to execute mode and continue" in the chat doesn't change the mode — it has to be toggled in your client's UI. Depending on your client, that's usually one of:
- Pressing **Shift+Tab** to cycle the mode indicator until it reads "Execute" / "accept edits" (not "plan")
- Using the mode selector / dropdown in the input bar
- Clicking **Approve & run** (rather than only approving the plan text)

Once the mode indicator no longer says "Plan," send any message and execution begins immediately with the settings write.

## Commerce Extension — Confirmed ✅
You approved enabling the commerce workflow. The flag (`"excat-commerce@excat-extended": true` in `.agents/settings.json`) will be written as the first Execute-mode action. The plugin's commerce tooling then loads on the following turn (auto-reinitialize; no restart needed).

## Migration Approach (high level)
1. **Enable commerce extension** — write `.agents/settings.json` (first Execute-mode action).
2. **Project setup** — confirm project type (doc/da/xwalk) and the block-library endpoint.
3. **Scrape homepage** — fetch arrow.com, extract metadata, download images, produce cleaned HTML + analysis artifacts.
4. **Commerce classification** — route the homepage's product/listing modules via commerce detection.
5. **Page analysis** — identify sections, content sequences, authoring decisions, name block variants.
6. **Block inventory & mapping** — match sections to library blocks; identify custom blocks/variants.
7. **Design system extraction** — pull design tokens and per-block computed styles from the source.
8. **Header migration** — instrument arrow.com navigation (desktop, mobile, megamenu).
9. **Footer migration** — replicate arrow.com footer.
10. **Import infrastructure** — generate parsers/transformers and the import script; run the bulk import.
11. **Preview & visual critique** — render locally, compare against original, iterate on fidelity.
12. **Performance pass** — Core Web Vitals, lazy-loading, image optimization, script budget; run Lighthouse.
13. **PR** — open a pull request with the required `{branch}--arrow-demo--rajankumar05.aem.page/{path}` preview link.

## Checklist
- [ ] **Toggle the session to Execute mode in your client's UI** (Shift+Tab / mode selector — I cannot do this from a response)
- [ ] Write `.agents/settings.json` to enable the commerce extension (first Execute-mode action; user has confirmed)
- [ ] Confirm project type and block-library endpoint (project-expert)
- [ ] Scrape arrow.com homepage (content, metadata, images, cleaned HTML)
- [ ] Run commerce classification on homepage content and route product/listing modules
- [ ] Analyze homepage structure and name block variants
- [ ] Build block inventory and map sections to library/custom blocks
- [ ] Extract site design tokens and per-block styles from the source
- [ ] Migrate header/navigation (desktop, mobile, megamenu) matching arrow.com
- [ ] Migrate footer matching arrow.com
- [ ] Generate import infrastructure (parsers, transformers, import script)
- [ ] Run bulk import to create homepage content
- [ ] Preview locally and run visual critique vs. original; iterate on design fidelity
- [ ] Performance/Lighthouse pass (Core Web Vitals, images, lazy-load, script budget)
- [ ] Open PR with the required preview link

## Open Decisions
- None on content/scope. The **only** blocker is the mode toggle, which is on your side. Flip the client to Execute mode, then send one more message and I'll write the settings file and run the migration end to end.
