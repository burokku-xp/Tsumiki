## MODIFIED Requirements

### Requirement: Manual Posting Command
The system SHALL provide a command and UI button to manually trigger Slack posting with optional comment.

#### Scenario: Command executes posting
- **WHEN** user executes "Tsumiki: Post to Slack" command
- **THEN** daily summary is retrieved
- **AND** message is formatted
- **AND** message is posted to Slack
- **AND** user is notified of result

#### Scenario: UI button executes posting
- **WHEN** user clicks the Slack post button in the WebView UI
- **THEN** a comment input dialog is shown (optional)
- **AND** user can enter a comment or skip it
- **AND** daily summary is retrieved
- **AND** message is formatted with the comment (if provided)
- **AND** message is posted to Slack
- **AND** user is notified of result

#### Scenario: Posting with comment
- **WHEN** user provides a comment during manual posting
- **THEN** the comment is included in the Slack message
- **AND** the comment is displayed after the daily summary data
- **AND** the message format remains consistent

#### Scenario: Posting without comment
- **WHEN** user skips comment input or provides empty comment
- **THEN** the message is posted without comment
- **AND** the message format is the same as before (backward compatible)

## ADDED Requirements

### Requirement: Automatic Time-Based Posting
The system SHALL automatically post daily summary to Slack at configured time intervals.

#### Scenario: Automatic posting enabled
- **WHEN** automatic posting is enabled in settings
- **AND** Webhook URL is configured
- **THEN** the system starts a timer for automatic posting
- **AND** daily summary is posted at the configured interval
- **AND** the posting occurs in the background without user interaction

#### Scenario: Automatic posting disabled
- **WHEN** automatic posting is disabled in settings
- **THEN** the automatic posting timer is stopped
- **AND** no automatic posts are sent
- **AND** manual posting remains available

#### Scenario: Automatic posting without Webhook URL
- **WHEN** automatic posting is enabled
- **AND** Webhook URL is not configured
- **THEN** automatic posting is skipped
- **AND** an error is logged (user notification is not shown)
- **AND** manual posting prompts user to configure Webhook URL

#### Scenario: Automatic posting interval configuration
- **WHEN** user changes the automatic posting interval in settings
- **THEN** the timer is reset with the new interval
- **AND** the next posting occurs after the new interval
- **AND** the setting is persisted

#### Scenario: Automatic posting with no data
- **WHEN** automatic posting is triggered
- **AND** there is no daily data for the current day
- **THEN** posting is skipped (no message sent)
- **AND** an error is logged (user notification is not shown)

### Requirement: Comment in Slack Messages
The system SHALL allow users to add optional comments to Slack messages.

#### Scenario: Comment included in message
- **WHEN** a comment is provided during posting
- **THEN** the comment is formatted and appended to the daily summary
- **AND** the comment is clearly separated from the summary data
- **AND** the message format remains readable

#### Scenario: Comment formatting
- **WHEN** formatting a message with a comment
- **THEN** the comment is displayed after the daily summary separator
- **AND** the comment is prefixed with an appropriate label (e.g., "💬 コメント:")
- **AND** line breaks in the comment are preserved

### Requirement: Automatic Posting Settings
The system SHALL provide settings to configure automatic posting behavior.

#### Scenario: Enable/disable automatic posting
- **WHEN** user toggles automatic posting in settings
- **THEN** the setting is saved
- **AND** the automatic posting timer is started or stopped accordingly
- **AND** the change takes effect immediately

#### Scenario: Configure posting interval
- **WHEN** user sets the posting interval (e.g., 1 hour, 2 hours, 3 hours)
- **THEN** the interval is saved
- **AND** the automatic posting timer is reset with the new interval
- **AND** the interval is validated (minimum: 1 hour)

#### Scenario: Settings persisted
- **WHEN** user changes automatic posting settings
- **THEN** the settings are persisted to workspace configuration
- **AND** the settings are restored when the extension is reloaded
