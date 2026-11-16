# Current PTeam guidance for Master Workflow

Updated November 16, 2026 from the newest response supplied by Chuck; the email's sending date was not supplied. This replaces the November 9 policy summary.

Master Workflow remains an independent launcher for installed tools. Users configure and start processing in those tools. It does not include ImageSolverEngine.js, so that engine's changes do not require an engine-related signature repair for this launcher.

A running script cannot execute another Script instance. Retain the existing deferred PixInsight core --execute handoff, which PTeam previously accepted as a documented interface. The newest email does not specifically revisit it. Verify startup, signatures and handoffs natively before claiming support for new builds. Signature preflight checks provide messages; the core enforces signatures again. From PixInsight 1.9.6, valid also rejects revoked or suspended signatures.

The newest response permits user-installed, user-selected SyQon programs and treats GraXpert as an external program under the same conditions. This replaces the earlier blanket exclusion summary. Any direct integration must leave installation to the user, exchange files through the program's own interfaces, keep its models/libraries outside PixInsight, and document purposes, paths, file exchanges and known network/download behavior. No adapter is added here. Document installed tool dependencies and never modify another developer's script or settings. Refer users to their installation, licensing and resource documentation.

A separate audit file is not required. For the full answers on included code, native modules, catalogs, downloads and ImageSolver signing, see [Workflow Manager's current guidance](https://github.com/CCDASTRO/PixInsight-Workflow-Manager/blob/main/docs/PTEAM-CURRENT-GUIDANCE.md).

No signed source, package or manifest was changed. PixInsight build 1718 verified the existing script and update-manifest signatures as valid for CCDASTRO; the package checksum matches its manifest. See [verification record](validation-documentation-2026-11-16.json). No image processing, re-signing or package rebuild was performed.
