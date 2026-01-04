## ADDED Requirements

### Requirement: Time-Based Daily Data Auto-Reset
The system SHALL automatically reset daily data at a configured time. This feature is always enabled.

#### Scenario: Daily data reset at configured time
- **WHEN** the configured reset time is reached (default: 00:00)
- **THEN** the current day's data is automatically reset
- **AND** sessions, file edits, and daily stats for the current day are cleared
- **AND** the reset occurs without user intervention
- **AND** active sessions are not affected (only completed sessions are reset)

#### Scenario: Daily data reset timer checks periodically
- **WHEN** the extension is active
- **THEN** the system checks the current time periodically (e.g., every minute)
- **AND** when the configured reset time matches the current time, the reset is triggered
- **AND** the reset occurs only once per day (at the configured time)

#### Scenario: Daily data reset preserves active session
- **WHEN** daily data reset occurs at the configured time
- **AND** there is an active session (timer is running)
- **THEN** the active session is preserved
- **AND** only completed sessions from the current day are reset
- **AND** the active session continues to be tracked

#### Scenario: Default reset time
- **WHEN** reset time is not configured by the user
- **THEN** the default reset time is 00:00 (midnight)
- **AND** automatic reset occurs at midnight
