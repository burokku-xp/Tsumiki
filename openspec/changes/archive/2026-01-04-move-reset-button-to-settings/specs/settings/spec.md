## ADDED Requirements
### Requirement: Reset Daily Data Button
The system SHALL provide a reset button in the settings UI to reset today's measurement data.

#### Scenario: Reset button displayed in settings
- **WHEN** user opens the custom settings UI
- **THEN** a reset button is displayed in a dedicated section
- **AND** the button is clearly labeled (e.g., "本日のデータをリセット")
- **AND** the button is placed in an appropriate location (e.g., at the bottom of the settings or in a "データ管理" section)

#### Scenario: Reset button clicked
- **WHEN** user clicks the reset button in the settings UI
- **THEN** a confirmation dialog is displayed with a warning message
- **AND** the dialog asks for confirmation (e.g., "本日のデータをリセットしますか？この操作は取り消せません。")
- **AND** if confirmed, today's data (sessions, file edits, daily stats) is reset
- **AND** a success message is displayed
- **AND** if cancelled, no action is taken

#### Scenario: Reset data updated
- **WHEN** today's data is reset from the settings UI
- **THEN** the main side panel display is updated immediately
- **AND** all statistics are reset to zero or empty
- **AND** the reset operation is logged for debugging purposes
