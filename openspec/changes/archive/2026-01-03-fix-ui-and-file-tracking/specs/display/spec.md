## MODIFIED Requirements
### Requirement: WebView in Primary Sidebar
The system SHALL provide a WebView in the primary sidebar (alongside Explorer, Search, Source Control) to display daily summary.

#### Scenario: WebView appears in primary sidebar
- **WHEN** user clicks the Tsumiki icon in the primary sidebar
- **THEN** the WebView is created and displayed
- **AND** the React application loads
- **AND** the daily summary is displayed
- **AND** the background is transparent to match VS Code theme

#### Scenario: WebView persists
- **WHEN** VSCode is reloaded
- **THEN** the WebView state is restored
- **AND** the daily summary is displayed
- **AND** the background remains transparent
