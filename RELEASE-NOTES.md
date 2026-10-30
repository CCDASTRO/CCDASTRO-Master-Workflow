# v0.3.2 - GPUStacker batch-processing shortcut

Adds separately installed GPUStacker to Batch preprocessing. Open tool uses the
existing script-dispatch and signature handling; users configure and execute
processing in GPUStacker. No pipeline runs or image processing occur automatically.
Existing session plans and WBPP/FBPP choices remain supported.

# v0.3.1 - PixInsight 1.9.6 package compatibility

Extends Update Manager eligibility from PI 1.9.5 only to PI 1.9.5–1.9.6.
Reuses the byte-identical signed v0.3.0 launcher and local includes; the dialog
title intentionally remains 0.3.0. No processing behavior changes. Reinstall
through the project repository after a full PI replacement, then rescan
src/scripts/CCDASTROMasterWorkflow if the menu is missing. Script and manifest signed.

# v0.3.0 - Three-master HDR preparation (signed development release)

Adds short/medium/long XISF/FITS selectors, header-based exposure grouping, input validation and a configured native HDRComposition review step. Existing stacking-tool catalog and dispatch remain unchanged. No HDR processing runs automatically. Existing input windows are preserved; newly opened windows are cleaned up on failure/cancel. Supports auto exposure evaluation, threshold 0.90, smoothness 7, growth 5, zero large-scale replacement, black-pixel rejection, 64-bit result and masks. Linear/registration assessments are heuristic and require user confirmation.

# v0.2.1 - HDR Composition shortcut

Adds HDRComposition to Integration / masters. Opens the native PixInsight interface without executing processing. Use registered linear images of the same field at different exposure lengths. Existing session plans remain compatible. PixInsight verified the script and updater-manifest signatures; package checksum and packaged source bytes match. Native PixInsight interface dispatch has not yet been verified.

# v0.2.0 - OSC dual-band narrowband extraction shortcut

Adds a dedicated OSC narrowband extraction row for separately installed NBExtractPI, plus ImageSolver for its plate-solving prerequisite. Detects the standard NBExtractPI location and falls back to the installed Lighthouse copy. Existing v0.1.1 session plans remain usable.

The guide covers a linear, debayered, plate-solved L-Ultimate RGB integration, Gaia DR3/SP database setup, Ha/OIII with 3 nm passbands, explicit mixing calibration/extraction and saving the resulting mono masters. SII requires separate data. No new extraction algorithm, vendor source or automatic processing is included.

# v0.1.1 - First development release

One launcher for existing tools used to create masters from session datasets. Five acquisition profiles cover mono LRGB/Ha/OIII/SII, OSC, OSC plus dual/multiple narrowband filter sessions, and OSC plus mono narrowband data. Stage dropdowns include WBPP/FBPP, native calibration/preparation, registration, integration and channel-combination interfaces. Optional folder checklists and JSON session plans are remembered separately from processing.

No new processing algorithms and no automatic processing. Tool inputs and settings remain configured in the selected tool. Signed scripts are verified before dispatch; the bundled legacy NBRGBCombination follows normal PixInsight handling. Scripts missing from the standard installation are marked unavailable.

Native V8 layout checks passed for all five profiles; signed installed-script checks and plan/catalog regressions passed. Actual end-to-end calibration/integration and tool dispatch have not been validated on user datasets. This is a development release.
