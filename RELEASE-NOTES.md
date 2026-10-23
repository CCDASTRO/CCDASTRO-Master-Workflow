# v0.2.0 - OSC dual-band narrowband extraction shortcut

Adds a dedicated OSC narrowband extraction row for separately installed NBExtractPI, plus ImageSolver for its plate-solving prerequisite. Detects the standard NBExtractPI location and falls back to the installed Lighthouse copy. Existing v0.1.1 session plans remain usable.

The guide covers a linear, debayered, plate-solved L-Ultimate RGB integration, Gaia DR3/SP database setup, Ha/OIII with 3 nm passbands, explicit mixing calibration/extraction and saving the resulting mono masters. SII requires separate data. No new extraction algorithm, vendor source or automatic processing is included.

# v0.1.1 - First development release

One launcher for existing tools used to create masters from session datasets. Five acquisition profiles cover mono LRGB/Ha/OIII/SII, OSC, OSC plus dual/multiple narrowband filter sessions, and OSC plus mono narrowband data. Stage dropdowns include WBPP/FBPP, native calibration/preparation, registration, integration and channel-combination interfaces. Optional folder checklists and JSON session plans are remembered separately from processing.

No new processing algorithms and no automatic processing. Tool inputs and settings remain configured in the selected tool. Signed scripts are verified before dispatch; the bundled legacy NBRGBCombination follows normal PixInsight handling. Scripts missing from the standard installation are marked unavailable.

Native V8 layout checks passed for all five profiles; signed installed-script checks and plan/catalog regressions passed. Actual end-to-end calibration/integration and tool dispatch have not been validated on user datasets. This is a development release.
