## MODIFIED Requirements

### Requirement: Save Count Tracking
The system SHALL count file save operations.

#### Scenario: Save count increments
- **WHEN** a file is saved
- **THEN** the save count is incremented
- **AND** the save event is recorded with timestamp
- **AND** the count is associated with the current session
- **AND** if no active session exists, a new session is automatically created

#### Scenario: Save count per file
- **WHEN** multiple files are saved
- **THEN** each save is counted separately
- **AND** the total save count is tracked

#### Scenario: Auto session creation on file save
- **WHEN** a file is saved and no active session exists
- **THEN** a new session is automatically created
- **AND** the file save is recorded and associated with the new session
- **AND** the WorkTimer is updated with the new session if available
- **AND** a notification message is shown to the user (only on first auto-creation)

#### Scenario: User notification on auto session creation
- **WHEN** a session is automatically created on file save
- **THEN** a notification message is displayed to inform the user
- **AND** the notification appears only once per session creation

### Requirement: File Edit Tracking
The system SHALL track edited files including file name and line count.

#### Scenario: File edit recorded on save
- **WHEN** a file is saved
- **THEN** the file path is recorded
- **AND** the line count is calculated and stored
- **AND** the edit is associated with the current session
- **AND** if no active session exists, a new session is automatically created and the edit is associated with it

#### Scenario: Multiple edits to same file
- **WHEN** the same file is edited and saved multiple times
- **THEN** each edit is recorded separately
- **AND** the line count reflects the latest state

### Requirement: Work Time Measurement
The system SHALL measure work time using a start/stop timer.

#### Scenario: Timer starts
- **WHEN** user starts the timer
- **THEN** a work session is created
- **AND** the start time is recorded
- **AND** the timer is active

#### Scenario: Timer stops
- **WHEN** user stops the timer
- **THEN** the work session is updated with end time
- **AND** the duration is calculated
- **AND** the session is saved to the database

#### Scenario: Timer state persists
- **WHEN** the extension is reloaded while timer is active
- **THEN** the timer state is restored
- **AND** the session continues from the previous state

#### Scenario: Inactive session auto-termination
- **WHEN** a session has been inactive (no file saves) for a configured period (default: 1 hour)
- **THEN** the session is automatically terminated
- **AND** the session end time and duration are recorded
- **AND** the WorkTimer state is updated if the session was active in the timer

#### Scenario: Activity resets auto-termination timer
- **WHEN** a file is saved during an active session
- **THEN** the last activity timestamp is updated
- **AND** the auto-termination timer is reset
- **AND** the session continues to be active
