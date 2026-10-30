# CCDASTRO Master Workflow

Version 0.3.2 - GPUStacker batch-processing shortcut.

## New in v0.3.2

Select **Batch preprocessing > GPUStacker** and click **Open tool**. Uses the
separately installed `src/scripts/GPUStacker.js`; missing installations are labeled
not installed. Configure its AstroPipeline executable, frames and output in
GPUStacker, then start processing there. Session folders remain planning entries.
No GPUStacker code or executable is bundled. See the
[GPUStacker project](https://github.com/chickadeebird/GPUStacker) for installation.
The main script and update manifest are signed for CCDASTRO. Native dropdown
validation passed; GPUStacker processing itself remains untested.

## Installation - start here

**v0.3.1 packaging update:** extends the Update Manager range to PI 1.9.5–1.9.6. The unchanged signed launcher retains its 0.3.0 title. The script and new update manifest have been signed; native signature verification is recorded with the release.

**Previous release: [v0.3.0](https://github.com/CCDASTRO/CCDASTRO-Master-Workflow/releases/tag/v0.3.0).** Adds three-master HDR preparation and automatic exposure-group detection; existing tools remain available. Script and updater-manifest signatures verified valid for CCDASTRO.

### Recommended: PixInsight Update Manager

1. In PixInsight, open **Resources > Updates > Manage Repositories** and add this project's repository URL:

   `https://raw.githubusercontent.com/CCDASTRO/CCDASTRO-Master-Workflow/main/updates/`

2. Run **Resources > Updates > Check for Updates**. Install CCDASTRO Master Workflow, then restart PixInsight when requested.
3. Open **Script > CCDASTRO > Master Workflow**. If the menu is missing, use **Script > Feature Scripts** to scan `src/scripts/CCDASTROMasterWorkflow` under your PixInsight installation and regenerate the feature list.
   After replacing/upgrading PixInsight, add this repository again if necessary: the new installation may not contain third-party scripts. Install the package, exit/restart, then scan the feature folder above.
4. Get later versions through the same PixInsight updater. This is a separate repository from the post-processing Workflow Manager; both can coexist.

### Manual testing or installation

1. Download and extract the [release ZIP](https://github.com/CCDASTRO/CCDASTRO-Master-Workflow/releases). The update ZIP contains `src/scripts/CCDASTROMasterWorkflow/`; keep the three `.js` files and the `.xsgn` signature together. A GitHub source ZIP instead places the scripts in `pixinsight/`.
2. Keep that complete folder in a permanent location. In PixInsight choose **Script > Execute Script File**, then select `CCDASTROMasterWorkflow.js`. Do not execute the helper `MasterTools.js`.
3. For a persistent menu entry, use **Script > Feature Scripts**, add the directory containing the main script, and regenerate the feature list. Look for **CCDASTRO > Master Workflow**.
4. For a manual upgrade, close the launcher and replace all four files with the matching new version. Preserve any JSON session plans stored elsewhere. Do not mix a new include with an old signature.

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
| Batch preprocessing | WBPP, FBPP, GPUStacker (separately installed) |
| Calibration | ImageCalibration |
| Preparation / extraction | CosmeticCorrection, Debayer, ChannelExtraction, BatchChannelExtraction |
| Registration | StarAlignment, FFTRegistration |
| Integration / masters | ImageIntegration, DrizzleIntegration |
| Plate solving | ImageSolver |
| OSC narrowband extraction | NBExtractPI (separately installed) |
| Channel combination | ChannelCombination, LRGBCombination, NBRGBCombination |

Scripts missing from the standard installation path are labeled not installed. Optional tools are not bundled. Scripts with an installed signature must verify before launching. Legacy scripts without a signature, such as the installed NBRGBCombination, open through normal PixInsight script handling; no arbitrary script path can be selected. Native process availability is checked when opening; errors leave images untouched.

WBPP/FBPP are complete batch routes, while the individual tools provide a manual route. Do not repeat processing stages already performed by a batch pipeline. Choose a common registration reference for data intended for combination. Drizzle requires the appropriate upstream drizzle data.

An OSC filter's RGB planes are not necessarily pure Ha, OIII and SII. Select an extraction method appropriate to the camera and filter, using existing tools or saved processes. This prototype does not automate those expressions or infer filter transmission. NBRGBCombination has its own supported input mappings; it is not a universal OSC narrowband extractor.

## Extract Ha and OIII from OSC L-Ultimate data (new in v0.2.1)

1. Calibrate, debayer, register and integrate the dual-band OSC sessions with WBPP/FBPP or the individual existing tools. Keep the resulting **RGB master linear**; do not stretch before extraction.
2. In Master Workflow choose the **OSC + Ha/OIII filter sessions** profile. Open **Plate solving > ImageSolver** and solve that RGB master. NBExtractPI also requires the Gaia process configured with local **Gaia DR3/SP XPSD** spectrum database files (the SPCC spectrum database).
3. Reopen Master Workflow and choose **OSC narrowband extraction > NBExtractPI**. It is detected at its standard root script location, with the installed Lighthouse NBExtractPI location as a fallback. If neither is present, the row says not installed. Install/update NBExtractPI from its original distributor; it is not bundled here.
4. In NBExtractPI select the linear, plate-solved RGB master. Choose **Ha / OIII**. For an Optolong **L-Ultimate**, set both line bandwidths to **3 nm**; use the actual filter specification for other filters.
5. Click **1 - Calibrate Mixing Matrix**, inspect its report, then **2 - Extract Channels**. These are explicit actions in the existing vendor tool. It creates separate mono images such as **Ha_NBX** and **OIII_NBX**. Inspect and save those images using PixInsight.
6. For additional SII, process a separately acquired SII/OIII filter dataset using the appropriate pair and bandwidths, or supply mono SII. The L-Ultimate records Ha/OIII and cannot supply missing SII. Register all intended masters to the same geometry, then open **ChannelCombination** for an HOO/SHO mapping or another existing combination tool for your intended output.

This is emission-line extraction, distinct from plain RGB ChannelExtraction. NBExtractPI fits a mixing model using stars and Gaia spectra; inspect its conditioning/report and outputs rather than assuming perfect separation. Our launcher opens its existing interface without choosing a target, changing filter settings or executing extraction. A broadband OSC master is not a substitute for the dual-band master. A filter passing three lines at once is not automatically supported by this two-line extractor.

The installed NBExtractPI documentation credits the extraction method to **Franklin Marek / Seti Astro's NBExtract**. Its PixInsight implementation remains separately maintained and licensed; no vendor source is copied or redistributed. L-Ultimate band specifications: https://www.optolong.com/cms/document/detail/id/192.html

## Credits

All processing is performed by the original installed tools. PixInsight and its native processes are developed by Pleiades Astrophoto. WBPP/FBPP credits in the installed distribution include Roberto Sartori, Adam Block, Tommaso Rubechi, Kai Wiechen and Pleiades Astrophoto. Other scripts retain their original authorship and licensing; refer to each installed script's About/source information. No third-party code or processing assets are redistributed here.

## Verification

Run `node tests/catalog.test.cjs` for catalog and JSON-plan validation checks. Native PixInsight UI checks are recorded separately in VALIDATION.md. This prototype has not been qualified on real calibration/integration datasets and does not guarantee finished masters.

## HDR composition

Choose **Integration / masters > HDRComposition**, then **Open tool**. In PixInsight, select registered linear images of the same field with different exposure lengths and configure the native HDRComposition controls. Processing runs only when you explicitly execute that tool. This combines exposure sets; it is distinct from HDRMultiscaleTransform. Native tool launch and real-image HDR processing have not been tested for this release.

## Prepare HDRComposition (v0.3.0)

1. In the HDR Composition section browse to **Short**, **Medium** and **Long** registered linear masters (XISF or FITS). Or click **Auto-detect exposure groups**, select one master per exposure length, and let header metadata populate the slots in ascending order.
2. Auto-detection reads EXPTIME/EXPOSURE and XISF Instrument:ExposureTime. Missing/conflicting exposure metadata, duplicate files, more/fewer than three exposure groups, and multiple masters in a group are rejected without changing the slots. It does not integrate frames or guess from filenames. Manual selection remains available when exposure headers are absent.
3. Click **Prepare HDRComposition**. Existing unchanged input windows are reused; missing windows are opened. Dimensions and channels must match. Known stretch history is rejected; median statistics and coarse log-intensity correlation flag possible nonlinearity or registration offsets. These checks cannot prove linearity or subpixel registration, so confirm original linear data and common-reference alignment before continuing. An input open with unsaved changes is rejected.
4. Review the pre-filled native HDRComposition interface, then execute it yourself. Automatic exposure evaluation, threshold 0.90, smoothness 7, growth 5, replace large scales 0, reject black pixels, 64-bit result and output masks are configured. Existing windows are not closed. Continue with the resulting linear HDR master in Workflow Manager.

PixInsight 1.9.5 supports importing the configured instance through launchInterface(); native verification succeeded. No fallback icon is needed on this supported installation. Preparation never executes HDRComposition. New input windows close on cancellation/errors; pre-existing windows are preserved. Synthetic FITS/XISF header, preparation, cancellation and cleanup tests passed; real-image HDR output quality was not tested. Run `node tests/hdr.test.cjs` for focused regressions.
