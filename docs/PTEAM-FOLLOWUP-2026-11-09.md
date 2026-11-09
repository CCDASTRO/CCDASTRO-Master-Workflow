# PTeam follow-up — November 9, 2026

Chuck supplied a PTeam email confirming they inspected Master Workflow 0.4.0 and
Workflow Manager 1.9.4, both published November 1. They found no SyQon/GraXpert
stages apart from rejection of old settings. The PixInsight core `--execute`
handoff uses its documented interface under rule 5.9.

Keep external image processors excluded, including indirect launches through
installed scripts/processes. PTeam says no product has an exception for this;
October 13 permissions are superseded by CPD rules 1.0.2. Menu availability and
other CPD signatures do not confer approval. The transition ends December 12, 2026.

PTeam's next-build ImageSolverEngine.js signature warning concerns Workflow
Manager's included engine. Master Workflow opens installed ImageSolver and does
not include that engine in its source. No immediate source change or signed
Master Workflow release is indicated. Keep this launcher independent and verify
startup, tool handoffs and signatures on the next build before claiming support.

This is a local documentation record based on the supplied email, whose sending
date was not supplied. No new native tests, signing, packaging or publication
were performed for this follow-up. Preserve existing signed artifacts.
