# settings Specification

## ADDED Requirements

### Requirement: Theme Selection Setting
The system SHALL provide a configuration option to select the visual theme.

#### Scenario: Theme setting defined
- **WHEN** settings are accessed
- **THEN** a `tsumiki.appearance.theme` option is available
- **AND** the options include 'orange', 'blue', 'green', and 'monochrome'
- **AND** the default is 'orange'

#### Scenario: Theme selection via Custom UI
- **WHEN** the custom settings UI is opened
- **THEN** a theme selector (dropdown or radio group) is displayed
- **AND** the current theme is selected

#### Scenario: Changing theme via Custom UI
- **WHEN** a new theme is selected in the Custom UI
- **THEN** the setting is saved
- **AND** the appearance updates immediately
