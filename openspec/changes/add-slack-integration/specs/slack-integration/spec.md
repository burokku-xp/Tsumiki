## ADDED Requirements

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
- **AND** work time is displayed with ⏱️ emoji
- **AND** save count and file count are displayed with 💾 emoji
- **AND** line changes are displayed with 📝 emoji
- **AND** edited files list is displayed with 📁 emoji
- **AND** the message is formatted with separators (━━━━━━━━━━━━━━━━━━━━━)

#### Scenario: Slack message example
- **WHEN** formatting a message with sample data
- **THEN** the message matches the expected format:
  ```
  🧱 山田さんの本日の記録
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
The system SHALL provide a command to manually trigger Slack posting.

#### Scenario: Command executes posting
- **WHEN** user executes "Tsumiki: Post to Slack" command
- **THEN** daily summary is retrieved
- **AND** message is formatted
- **AND** message is posted to Slack
- **AND** user is notified of result
