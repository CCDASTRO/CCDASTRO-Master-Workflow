# v0.1.1 - First development release

One launcher for existing tools used to create masters from session datasets. Five acquisition profiles cover mono LRGB/Ha/OIII/SII, OSC, OSC plus dual/multiple narrowband filter sessions, and OSC plus mono narrowband data. Stage dropdowns include WBPP/FBPP, native calibration/preparation, registration, integration and channel-combination interfaces. Optional folder checklists and JSON session plans are remembered separately from processing.

No new processing algorithms and no automatic processing. Tool inputs and settings remain configured in the selected tool. Signed scripts are verified before dispatch; the bundled legacy NBRGBCombination follows normal PixInsight handling. Scripts missing from the standard installation are marked unavailable.

Native V8 layout checks passed for all five profiles; signed installed-script checks and plan/catalog regressions passed. Actual end-to-end calibration/integration and tool dispatch have not been validated on user datasets. This is a development release.
