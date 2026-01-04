## REMOVED Requirements
### Requirement: Reset Button in Header
The system SHALL provide a reset button in the header of the main side panel to reset today's data.

**Reason**: リセット機能は設定操作として扱うべきであり、設定画面に移動することでUIの一貫性が向上します。

**Migration**: リセット機能は設定画面から利用可能になります。

#### Scenario: Reset button displayed in header
- **WHEN** the side panel WebView is opened
- **THEN** a reset button is displayed in the header
- **AND** the button is clearly labeled

#### Scenario: Reset button clicked
- **WHEN** user clicks the reset button in the header
- **THEN** a confirmation dialog is displayed
- **AND** if confirmed, today's data is reset
- **AND** the display is updated immediately
