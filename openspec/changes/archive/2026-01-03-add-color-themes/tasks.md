# Tasks

1.  - [x] **Define Theme Configuration**
    - Add `tsumiki.appearance.theme` to `package.json`.
    - Update `src/settings/config.ts` to include the new setting.

2.  - [x] **Refactor CSS for Theming**
    - Modify `src/webview/App.css` to use attribute-based selectors for variables.
    - Define palettes for Orange, Blue, Green, and Monochrome.

3.  - [x] **Implement Theme Logic in WebView**
    - Update `tsumikiView.ts` to pass the theme setting to the WebView.
    - Update `App.tsx` to apply `data-theme` attribute based on the setting.

4.  - [x] **Update Settings UI**
    - Update `SettingsApp.tsx` to include a theme selector (Dropdown or Radio).
    - Ensure selecting a theme updates the configuration and reflects immediately.

5.  - [x] **Verify Themes**
    - Check all themes in both Dark and Light VS Code environments (focusing on the "fits dark theme" requirement for White).
