## ADDED Requirements

### Requirement: Daily Reset Time Configuration
The system SHALL provide a configuration option to set the time for automatic daily data reset. The reset feature is always enabled.

#### Scenario: Reset time setting defined
- **WHEN** settings are accessed
- **THEN** a `tsumiki.data.resetTime` option is available
- **AND** the option is a time string in HH:mm format (e.g., "00:00")
- **AND** the default value is "00:00" (midnight)
- **AND** the option is displayed in the custom settings UI

#### Scenario: Reset time setting accessed via custom UI
- **WHEN** user opens the custom settings UI
- **THEN** a time input field for "リセット時刻" is displayed in the data management section
- **AND** the input field reflects the current setting value
- **AND** the input field uses the same styling as other time inputs (`setting-time-input`)

#### Scenario: Reset time setting changed
- **WHEN** user changes the reset time setting
- **THEN** the setting is saved to VSCode configuration
- **AND** the setting is persisted across VSCode restarts
- **AND** the automatic reset timer is updated with the new time

#### Scenario: Reset time synchronized with Slack auto-post time
- **WHEN** user clicks the "Slack自動投稿時間と合わせる" button
- **THEN** the reset time is set to the same value as the Slack auto-post time
- **AND** the setting is saved immediately
- **AND** the input field is updated to show the new value
- **AND** the automatic reset timer is updated

#### Scenario: Sync button displayed conditionally
- **WHEN** user opens the custom settings UI
- **THEN** the "Slack自動投稿時間と合わせる" button is displayed only when Slack auto-post is enabled
- **AND** the button uses the same styling as other action buttons (`webhook-url-save-button`)
- **AND** the button is placed near the reset time input field
