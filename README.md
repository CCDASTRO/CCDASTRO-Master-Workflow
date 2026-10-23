# CCDASTRO Master Workflow

Version 0.1.1 - signed development release.

## Installation - start here

**Current release: [v0.1.1](https://github.com/CCDASTRO/CCDASTRO-Master-Workflow/releases/tag/v0.1.1).** Script and updater-manifest signatures verified valid for CCDASTRO.

### Recommended: PixInsight Update Manager

1. In PixInsight, open **Resources > Updates > Manage Repositories** and add this project's repository URL:

   `https://raw.githubusercontent.com/CCDASTRO/CCDASTRO-Master-Workflow/main/updates/`

2. Run **Resources > Updates > Check for Updates**. Install CCDASTRO Master Workflow, then restart PixInsight when requested.
3. Open **Script > CCDASTRO > Master Workflow**. If the menu is missing, use **Script > Feature Scripts** to scan `src/scripts/CCDASTROMasterWorkflow` under your PixInsight installation and regenerate the feature list.
4. Get later versions through the same PixInsight updater. This is a separate repository from the post-processing Workflow Manager; both can coexist.

### Manual testing or installation

1. Download and extract the [release ZIP](https://github.com/CCDASTRO/CCDASTRO-Master-Workflow/releases). The update ZIP contains `src/scripts/CCDASTROMasterWorkflow/`; keep the two `.js` files and the `.xsgn` signature together. A GitHub source ZIP instead places the scripts in `pixinsight/`.
2. Keep that complete folder in a permanent location. In PixInsight choose **Script > Execute Script File**, then select `CCDASTROMasterWorkflow.js`. Do not execute the helper `MasterTools.js`.
3. For a persistent menu entry, use **Script > Feature Scripts**, add the directory containing the main script, and regenerate the feature list. Look for **CCDASTRO > Master Workflow**.
4. For a manual upgrade, close the launcher and replace all three files with the matching new version. Preserve any JSON session plans stored elsewhere. Do not mix a new include with an old signature.

Tested UI scope: PixInsight 1.9.5 with the V8 runtime. No third-party tools are bundled. WBPP/FBPP and other script choices must be separately installed in their normal PixInsight locations. A source checkout is unsigned until CodeSign has been completed.

## Quick use

1. Select the acquisition profile; browse to a session root, intended output folder and optional per-filter dataset folders.
2. Choose an existing method from a stage dropdown and click **Open tool**. The launcher closes to give that tool the workspace.
3. Configure inputs, outputs, reference images and settings in the selected tool. Run processing explicitly there.
4. Reopen Master Workflow for the next stage. Use **Save session plan** / **Load session plan** for multiple sessions.

**Folder selections are a checklist, not an automatic input handoff.** The launcher does not classify session files, fill another tool's inputs, create output folders, run processing or overwrite images. Only the active profile's folder entries are saved. Review local paths before sharing a JSON plan.

Script tools are queued in the same PixInsight instance after the launcher exits. Native process interfaces open with a new default instance; save important unsaved process settings as icons first. Small `.scp` dispatch files remain in the system temporary directory.


A separate PixInsight launcher that puts existing tools for creating masters in one place. It adds no calibration, registration, integration, extraction or channel-combination algorithms. It does not modify the CCDASTRO PixInsight Workflow Manager.

## Acquisition profiles

- Mono LRGB with optional Ha, OIII and SII.
- OSC broadband.
- OSC broadband plus Ha/OIII filter sessions.
- OSC broadband plus Ha/OIII/SII filter sessions.
- OSC broadband plus separate mono Ha, OIII and SII data/masters.

Folder rows are optional planning entries: unused filters can remain blank. Each selected folder can contain its normal session structure; the launcher does not recurse through it or classify lights, flats, darks or bias. Use the selected tool's file-loading and grouping controls. Calibration frames must match the dataset as required by that tool.

## Tool groups

| Stage | Existing choices |
|---|---|
| Batch preprocessing | WBPP, FBPP |
| Calibration | ImageCalibration |
| Preparation / extraction | CosmeticCorrection, Debayer, ChannelExtraction, BatchChannelExtraction |
| Registration | StarAlignment, FFTRegistration |
| Integration / masters | ImageIntegration, DrizzleIntegration |
| Channel combination | ChannelCombination, LRGBCombination, NBRGBCombination |

Scripts missing from the standard installation path are labeled not installed. Optional tools are not bundled. Scripts with an installed signature must verify before launching. Legacy scripts without a signature, such as the installed NBRGBCombination, open through normal PixInsight script handling; no arbitrary script path can be selected. Native process availability is checked when opening; errors leave images untouched.

WBPP/FBPP are complete batch routes, while the individual tools provide a manual route. Do not repeat processing stages already performed by a batch pipeline. Choose a common registration reference for data intended for combination. Drizzle requires the appropriate upstream drizzle data.

An OSC filter's RGB planes are not necessarily pure Ha, OIII and SII. Select an extraction method appropriate to the camera and filter, using existing tools or saved processes. This prototype does not automate those expressions or infer filter transmission. NBRGBCombination has its own supported input mappings; it is not a universal OSC narrowband extractor.

## Credits

All processing is performed by the original installed tools. PixInsight and its native processes are developed by Pleiades Astrophoto. WBPP/FBPP credits in the installed distribution include Roberto Sartori, Adam Block, Tommaso Rubechi, Kai Wiechen and Pleiades Astrophoto. Other scripts retain their original authorship and licensing; refer to each installed script's About/source information. No third-party code or processing assets are redistributed here.

## Verification

Run `node tests/catalog.test.cjs` for catalog and JSON-plan validation checks. Native PixInsight UI checks are recorded separately in VALIDATION.md. This prototype has not been qualified on real calibration/integration datasets and does not guarantee finished masters.
