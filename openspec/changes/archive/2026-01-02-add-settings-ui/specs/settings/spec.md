## MODIFIED Requirements

### Requirement: Settings Configuration
The system SHALL provide configuration options for customizing display and posting content.

#### Scenario: Settings defined
- **WHEN** the extension is installed
- **THEN** configuration options are available in VSCode settings
- **AND** default values are set for all options
- **AND** settings are persisted
- **AND** a custom settings UI is also available

#### Scenario: Settings accessed
- **WHEN** user opens VSCode settings
- **THEN** Tsumiki settings are displayed under extension settings
- **AND** all configuration options are visible with descriptions

#### Scenario: Settings accessed via custom UI
- **WHEN** user opens the custom settings UI
- **THEN** all settings are displayed in a unified interface
- **AND** display items can be toggled with checkboxes
- **AND** Slack posting items can be selected with checkboxes
- **AND** Slack Webhook URL can be set via input field

### Requirement: Display Item Toggle
The system SHALL allow users to toggle display items on/off.

#### Scenario: Work time display toggled
- **WHEN** user toggles work time display off
- **THEN** work time is not displayed in the side panel
- **AND** the setting is persisted
- **AND** the change takes effect immediately

#### Scenario: Work time display toggled via custom UI
- **WHEN** user toggles work time display off in the custom settings UI
- **THEN** the checkbox state is updated
- **AND** the setting is saved to VSCode configuration
- **AND** the side panel display is updated immediately

#### Scenario: Multiple display items toggled
- **WHEN** user toggles multiple display items off
- **THEN** only enabled items are displayed
- **AND** disabled items are hidden
- **AND** the layout adjusts accordingly

#### Scenario: All display items enabled
- **WHEN** all display items are enabled (default)
- **THEN** all items are displayed in the side panel
- **AND** the full daily summary is shown

### Requirement: Slack Posting Customization
The system SHALL allow users to customize which items are included in Slack posts.

#### Scenario: Slack posting items selected
- **WHEN** user selects specific items for Slack posting
- **THEN** only selected items are included in the Slack message
- **AND** unselected items are omitted
- **AND** the setting is persisted

#### Scenario: Slack posting items selected via custom UI
- **WHEN** user selects specific items for Slack posting in the custom settings UI
- **THEN** the checkboxes are updated
- **AND** the setting is saved to VSCode configuration
- **AND** the next Slack post uses the new settings

#### Scenario: Slack posting with minimal items
- **WHEN** user selects only work time and save count for Slack posting
- **THEN** only work time and save count are included in the message
- **AND** other items are not included

#### Scenario: Slack posting with all items
- **WHEN** user selects all items for Slack posting (default)
- **THEN** all available items are included in the message
- **AND** the full daily summary is posted

### Requirement: Settings Persistence
The system SHALL persist settings and restore them on extension activation.

#### Scenario: Settings persisted
- **WHEN** user changes settings
- **THEN** settings are saved to VSCode configuration
- **AND** settings persist across VSCode restarts

#### Scenario: Settings persisted via custom UI
- **WHEN** user changes settings in the custom settings UI
- **THEN** settings are saved to VSCode configuration
- **AND** settings are also reflected in VSCode standard settings UI
- **AND** settings persist across VSCode restarts

#### Scenario: Settings restored
- **WHEN** extension is activated
- **THEN** saved settings are loaded
- **AND** settings are applied to display and posting

### Requirement: Real-time Settings Update
The system SHALL update display and posting behavior immediately when settings change.

#### Scenario: Display updates on setting change
- **WHEN** user changes a display setting
- **THEN** the side panel display is updated immediately
- **AND** no extension reload is required
- **AND** the change is reflected in real-time

#### Scenario: Display updates on setting change via custom UI
- **WHEN** user changes a display setting in the custom settings UI
- **THEN** the setting is saved immediately
- **AND** the side panel display is updated immediately
- **AND** no extension reload is required

#### Scenario: Posting behavior updates on setting change
- **WHEN** user changes Slack posting settings
- **THEN** the next Slack post uses the new settings
- **AND** the change is applied immediately

## ADDED Requirements

### Requirement: Custom Settings UI
The system SHALL provide a custom WebView-based settings UI for managing all settings in one place.

#### Scenario: Settings UI opened
- **WHEN** user opens the custom settings UI
- **THEN** a WebView panel is displayed
- **AND** all current settings are loaded and displayed
- **AND** display item toggles are shown with current values
- **AND** Slack posting item selections are shown with current values
- **AND** Slack Webhook URL input field is shown (masked if set)

#### Scenario: Display items toggled in custom UI
- **WHEN** user toggles a display item checkbox in the custom settings UI
- **THEN** the setting is immediately saved to VSCode configuration
- **AND** the side panel display is updated immediately
- **AND** the change is reflected in VSCode standard settings UI

#### Scenario: Slack posting items selected in custom UI
- **WHEN** user selects/deselects Slack posting items in the custom settings UI
- **THEN** the settings are immediately saved to VSCode configuration
- **AND** the next Slack post uses the new settings
- **AND** the change is reflected in VSCode standard settings UI

#### Scenario: Slack Webhook URL set in custom UI
- **WHEN** user enters a Slack Webhook URL in the custom settings UI
- **THEN** the URL is validated
- **AND** if valid, the URL is saved to Secret Storage
- **AND** a success message is displayed
- **AND** if invalid, an error message is displayed

#### Scenario: Settings UI reflects current values
- **WHEN** user opens the custom settings UI
- **THEN** all checkboxes and inputs reflect the current settings
- **AND** settings changed via VSCode standard UI are also reflected
- **AND** settings changed via commands are also reflected
