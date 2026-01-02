## ADDED Requirements

### Requirement: Settings Configuration
The system SHALL provide configuration options for customizing display and posting content.

#### Scenario: Settings defined
- **WHEN** the extension is installed
- **THEN** configuration options are available in VSCode settings
- **AND** default values are set for all options
- **AND** settings are persisted

#### Scenario: Settings accessed
- **WHEN** user opens VSCode settings
- **THEN** Tsumiki settings are displayed under extension settings
- **AND** all configuration options are visible with descriptions

### Requirement: Display Item Toggle
The system SHALL allow users to toggle display items on/off.

#### Scenario: Work time display toggled
- **WHEN** user toggles work time display off
- **THEN** work time is not displayed in the side panel
- **AND** the setting is persisted
- **AND** the change takes effect immediately

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

#### Scenario: Posting behavior updates on setting change
- **WHEN** user changes Slack posting settings
- **THEN** the next Slack post uses the new settings
- **AND** the change is applied immediately

### Requirement: Default Settings
The system SHALL provide sensible default values for all settings.

#### Scenario: Default settings applied
- **WHEN** extension is installed for the first time
- **THEN** all display items are enabled by default
- **AND** all items are selected for Slack posting by default
- **AND** settings work out of the box
