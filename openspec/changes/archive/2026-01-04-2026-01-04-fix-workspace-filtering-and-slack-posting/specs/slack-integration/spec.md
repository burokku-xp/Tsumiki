## MODIFIED Requirements

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
