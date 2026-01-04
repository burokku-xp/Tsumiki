# slack-integration Specification

## Purpose
TBD - created by archiving change add-slack-integration. Update Purpose after archive.
## Requirements
### Requirement: Webhook URL Configuration
The system SHALL allow users to configure Slack Incoming Webhook URL.

#### Scenario: Webhook URL set
- **WHEN** user sets a Webhook URL
- **THEN** the URL is stored securely using Secret Storage API
- **AND** the URL is validated (basic format check)
- **AND** the configuration is persisted

#### Scenario: Webhook URL retrieved
- **WHEN** the system needs to send a message
- **THEN** the Webhook URL is retrieved from Secret Storage
- **AND** the URL is available for use

#### Scenario: Webhook URL removed
- **WHEN** user removes the Webhook URL
- **THEN** the URL is deleted from Secret Storage
- **AND** Slack posting is disabled

### Requirement: Slack Message Formatting
The system SHALL format daily summary as a Slack message with emojis and structured layout.

#### Scenario: Slack message formatted
- **WHEN** daily summary is formatted for Slack
- **THEN** the message includes user name with 🧱 emoji
- **AND** the message includes the date (e.g., "2026年1月4日")
- **AND** only items selected in settings are included in the message
- **AND** work time is displayed with ⏱️ emoji (if selected)
- **AND** save count is displayed with 💾 emoji (if selected)
- **AND** file count is displayed with 💾 emoji (if selected)
- **AND** line changes are displayed with 📝 emoji (if selected)
- **AND** edited files list is displayed with 📁 emoji (if selected)
- **AND** the message is formatted with separators (━━━━━━━━━━━━━━━━━━━━━)

#### Scenario: Slack message with selected items only
- **WHEN** user selects only specific items for Slack posting (e.g., workTime and lineChanges)
- **THEN** only the selected items are included in the message
- **AND** unselected items are not included
- **AND** the message format remains consistent

#### Scenario: Slack message example
- **WHEN** formatting a message with sample data
- **THEN** the message matches the expected format:
  ```
  🧱 山田さんの本日の記録
  2026年1月4日
  ━━━━━━━━━━━━━━━━━━━━━
  ⏱️ 作業時間: 3時間12分
  💾 保存: 24回 / 8ファイル
  📝 変更行数: 187行
  
  📁 編集ファイル:
  ・Login.tsx / useAuth.ts / login.css 他5件
  ```

### Requirement: Slack Webhook Posting
The system SHALL post daily summary to Slack using Incoming Webhook.

#### Scenario: Message posted successfully
- **WHEN** user triggers Slack posting
- **THEN** daily summary data is retrieved
- **AND** the summary is formatted as a Slack message
- **AND** HTTP POST request is sent to the Webhook URL
- **AND** the message is posted to Slack
- **THEN** success notification is shown to user

#### Scenario: Posting without Webhook URL
- **WHEN** user triggers Slack posting without configured Webhook URL
- **THEN** an error message is shown
- **AND** the user is prompted to configure Webhook URL

#### Scenario: Posting with no data
- **WHEN** user triggers Slack posting with no daily data
- **THEN** an appropriate message is posted (e.g., "本日のデータはありません")
- **OR** posting is skipped with a notification

### Requirement: Error Handling
The system SHALL handle errors during Slack posting gracefully.

#### Scenario: Network error
- **WHEN** network error occurs during posting
- **THEN** retry logic is executed (up to 3 times)
- **AND** exponential backoff is used between retries
- **AND** error message is shown if all retries fail

#### Scenario: Invalid Webhook URL
- **WHEN** posting fails due to invalid Webhook URL
- **THEN** error message indicates invalid URL
- **AND** user is prompted to reconfigure Webhook URL

#### Scenario: HTTP error response
- **WHEN** Slack returns HTTP error (e.g., 404, 500)
- **THEN** error message is shown with status code
- **AND** retry logic is executed for retryable errors

### Requirement: Retry Logic
The system SHALL retry failed requests with exponential backoff.

#### Scenario: Retry on failure
- **WHEN** a request fails with retryable error
- **THEN** the request is retried after a delay
- **AND** the delay increases exponentially (e.g., 1s, 2s, 4s)
- **AND** maximum 3 retries are attempted

#### Scenario: Retry success
- **WHEN** a retry succeeds
- **THEN** the message is posted successfully
- **AND** success notification is shown

#### Scenario: All retries fail
- **WHEN** all retries fail
- **THEN** error message is shown to user
- **AND** the error is logged

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

