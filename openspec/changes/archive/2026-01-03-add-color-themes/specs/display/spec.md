# display Specification

## ADDED Requirements

### Requirement: Color Theme Support
The system SHALL support multiple color themes to allow user customization and better integration with VS Code themes.

#### Scenario: Apply theme
- **WHEN** the `tsumiki.appearance.theme` setting is changed
- **THEN** the WebView updates its CSS variables to reflect the chosen theme
- **AND** the change is immediate without reload
- **AND** the theme colors (primary, secondary, accent, etc.) are updated

#### Scenario: Default Theme
- **WHEN** no theme is configured or the extension is first installed
- **THEN** the 'Orange' (default) theme is applied

#### Scenario: Monochrome Theme
- **WHEN** the 'Monochrome' theme is selected
- **THEN** the UI uses a grayscale/white-based palette
- **AND** elements have high contrast against dark backgrounds
