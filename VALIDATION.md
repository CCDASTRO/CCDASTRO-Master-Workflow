# Prototype verification

- Tool catalog and JSON session-plan roundtrips pass for all five acquisition profiles.
- Invalid plan formats, missing profile folders and unknown tool selections are rejected.
- Launch-only boundary check passes: no executeOn/executeGlobal processing calls.
- Existing PixInsight documentation confirms ProcessInstance.launchInterface, CoreApplication.srcDirPath and the directory-dialog API used here.
- Installed script paths were checked for WBPP, FBPP, BatchChannelExtraction and FFTRegistration; NBRGBCombination is also present in the installed script inventory.
- The script dispatch pattern follows the same-instance deferred launch used by the existing Workflow Manager. This prototype's actual tool dispatch still requires native validation.
- Native PixInsight V8 UI rendering passed for all five acquisition profiles, at 790 pixels wide and 516-666 pixels tall. Mono and OSC-plus-mono layouts were visually inspected.
- Fixed duplicate Sizer.jsh declarations and replaced the legacy Dialog constructor pattern with a native V8 class extending Dialog.
- Installed WBPP, FBPP, BatchChannelExtraction and FFTRegistration signatures verified valid. The installed NBRGBCombination has no signature file and follows normal PixInsight script handling.
- Actual tool dispatch and processing remain to be tested; the native check only rendered the launcher and inspected installed script signatures.
- No calibration, registration, integration or combination was run on user images. No actual master outputs were generated or validated.
- Unsigned development prototype; not a published updater release.

## v0.2.0

All five updated native UI profiles rendered at 790 pixels wide and 568-718 pixels tall. NBExtractPI and ImageSolver were detected and their installed signatures verified valid. Session plan/catalog tests and loading old stage selections passed. New dual-band layout visually inspected. No NBExtractPI extraction, Gaia photometry or real-image processing was run; output quality remains the original tool's responsibility. v0.2.0 script and manifest signatures verified valid for CCDASTRO; exact signed package bytes and manifest checksum verified.

## v0.2.1

Existing catalog, session-plan compatibility and launch-only checks passed. PixInsight verified both signatures for CCDASTRO. Package checksum and packaged source/signature bytes match the signed originals. Native HDRComposition interface dispatch and image processing were not tested.

## v0.3.0 (signed development release)

Existing catalog tests and focused HDR configuration/grouping/cleanup tests pass. Native PixInsight 1.9.5 reads exposure headers from synthetic FITS and XISF masters (1/10/100 seconds), sorts them correctly, opens the configured HDRComposition interface, and leaves no synthetic image windows after test cleanup. Cancellation cleanup passed. Native UI has three selectors and fits at 790 pixels wide (827 pixels high for the saved OSC+mono profile). No HDRComposition execution or real-image outcome tested. PixInsight verified the script and manifest signatures; the package checksum and all packaged sources/signature match.

## PI 1.9.6 / v0.3.1 packaging check

PixInsight verified the unchanged script signature as valid for CCDASTRO. All five
profile dialogs constructed and every catalog script shortcut resolved to an
installed file. Node catalog/session-plan and HDR tests pass. No image processing
was executed. The new manifest extends eligibility to PI 1.9.5–1.9.6 and still
is signed. PixInsight verified both final signatures as valid for CCDASTRO
(validation/v0.3.1-final-signatures.json). Package checksum and all four
packaged source/signature files match.

## v0.3.2 GPUStacker shortcut

Catalog and saved-plan tests cover GPUStacker selection for all five acquisition
profiles and installed/missing script resolution. Existing catalog/session and HDR
regressions pass. GPUStacker.js exists at the installed standard script path.
Native PixInsight UI validation passed: the v0.3.2 dialog contains GPUStacker,
selects its catalog ID and resolves its installed script path. See
validation/v0.3.2-gpustacker-ui.json. Actual dispatch and GPUStacker processing
remain untested. No GPUStacker execution or image processing ran.
The main script and final manifest have been signed. Native signature verification
is recorded in validation/v0.3.2-final-signatures.json.
