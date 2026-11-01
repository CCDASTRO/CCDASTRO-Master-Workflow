# Release signing - v0.4.0

Status: v0.4.0 script and manifest signed November 1, 2026. PixInsight verified both signatures as valid for CCDASTRO; see `validation/v0.4.0-final-signatures.json`. Package SHA-1: `b29795dcab3e36626ac4216504e63c285e1a211d`. Do not rebuild this signed version. Use this project folder, not the separate post-processing Workflow Manager.

1. In PixInsight, open **Script > Development > CodeSign**. Select `pixinsight/CCDASTROMasterWorkflow.js` from this repository. Use your existing CCDASTRO developer certificate/key. The script identifier is **CCDASTROMasterWorkflow**. The local includes `MasterTools.js` and `HDRPrepare.js` must remain beside it and be covered by the main script signature; do not sign or register either include as a separate feature.
2. Save `CCDASTROMasterWorkflow.xsgn` alongside the main script. Close CodeSign, leaving PixInsight open so native verification can run. Do not edit either source afterward.
3. Verify the signature with PixInsight `Security.getScriptSignature`. Build the update ZIP and unsigned manifest with `packaging/build-package.ps1` only after successful verification.
4. In CodeSign, sign `updates/updates.xri` as an XML repository document using developer ID CCDASTRO. Close CodeSign again so verification can run.
5. Verify both native signatures and the package checksum. Publish the matching ZIP and manifest bytes to GitHub. Never rebuild the manifest after signing it.

The updater package installs only this project's three source files and signature into `src/scripts/CCDASTROMasterWorkflow/`. It does not replace any vendor files or the other CCDASTRO workflow.

## Signed v0.4.0 inputs

Signed November 1, 2026. Catalog/session-plan and HDR regression suites pass. Native PI 1.9.6 UI/tool-availability/installed-script-signature checks passed without processing. Real datasets and actual tool dispatch remain untested.

```text
6a7d7b22d13ab74bf21380c158c2093b3fcc0830302c7736714814d4d5b384aa  pixinsight/CCDASTROMasterWorkflow.js
28fe4c1c05db34c1b51b48005323abe17e42a4fd261cb8635dd3dd94497988ae  pixinsight/MasterTools.js
abe527758bce3ba7d79af01d69984d12eddbf51090d039a11d35195086b1b3ae  pixinsight/HDRPrepare.js
```

From this project root, after native signature verification:

```powershell
.\packaging\build-package.ps1
```

The PowerShell builder requires a fresh valid CCDASTRO report from `validation/verify-v0.4.0-script.js`. After signing the generated manifest, run `validation/verify-v0.4.0-release.js` in PixInsight and publish only when both results are valid. The existing Python builder remains an alternative for systems with Python installed.
