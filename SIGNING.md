# Release signing - v0.3.2

1. In PixInsight, open **Script > Development > CodeSign**. Select `pixinsight/CCDASTROMasterWorkflow.js` from this repository. Use your existing CCDASTRO developer certificate/key. The script identifier is **CCDASTROMasterWorkflow**. The local includes `MasterTools.js` and `HDRPrepare.js` must remain beside it and be covered by the main script signature; do not sign or register it as a separate feature.
2. Save `CCDASTROMasterWorkflow.xsgn` alongside the main script. Close CodeSign, leaving PixInsight open so native verification can run. Do not edit either source afterward.
3. Verify the signature with PixInsight `Security.getScriptSignature`. Build the update ZIP and unsigned manifest with `packaging/build-package.py` only after successful verification.
4. In CodeSign, sign `updates/updates.xri` as an XML repository document using developer ID CCDASTRO. Close CodeSign again so verification can run.
5. Verify both native signatures and the package checksum. Publish the matching ZIP and manifest bytes to GitHub. Never rebuild the manifest after signing it.

The updater package installs only this project's three source files and signature into `src/scripts/CCDASTROMasterWorkflow/`. It does not replace any vendor files or the other CCDASTRO workflow.
