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
