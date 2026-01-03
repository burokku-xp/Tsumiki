# measurement Specification

## Purpose
TBD - created by archiving change add-measurement-features. Update Purpose after archive.
## Requirements
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
- **AND** only files within the workspace are tracked

#### Scenario: Multiple edits to same file
- **WHEN** the same file is edited and saved multiple times
- **THEN** each edit is recorded separately
- **AND** the line count reflects the latest state

#### Scenario: Workspace file tracking
- **WHEN** a file within the workspace is saved
- **THEN** the file edit is recorded
- **AND** the file is included in daily statistics

#### Scenario: Workspace external file exclusion
- **WHEN** a file outside the workspace (e.g., settings.json, extension configuration files) is saved
- **THEN** the file edit is not recorded
- **AND** the file is excluded from daily statistics
- **AND** no error is raised

### Requirement: Line Count Calculation
The system SHALL calculate line changes excluding empty lines and comments.

#### Scenario: Line count excludes empty lines
- **WHEN** a file is saved with empty lines
- **THEN** empty lines are excluded from the count
- **AND** only non-empty lines are counted

#### Scenario: Line count excludes comments
- **WHEN** a file is saved with comments
- **THEN** comments are excluded from the count
- **AND** only code lines are counted

#### Scenario: Line count on save only
- **WHEN** a file is edited but not saved
- **THEN** line count is not calculated
- **AND** line count is calculated only when the file is saved

#### Scenario: Line count accuracy
- **WHEN** a file with known line count is saved
- **THEN** the calculated line count matches expected value (excluding empty lines and comments)

### Requirement: Language Detection
The system SHALL detect programming language based on file extension.

#### Scenario: Language detected from extension
- **WHEN** a file with extension `.ts` is saved
- **THEN** the language is detected as TypeScript
- **AND** the language is stored with the file edit record

#### Scenario: Unknown language handling
- **WHEN** a file with unknown extension is saved
- **THEN** the language is recorded as "unknown" or "other"
- **AND** the file edit is still tracked

### Requirement: Language Ratio Calculation
The system SHALL calculate language ratios based on line counts per language.

#### Scenario: Language ratio calculated
- **WHEN** daily statistics are requested
- **THEN** language ratios are calculated from file edits
- **AND** ratios are expressed as percentages
- **AND** ratios sum to 100%

#### Scenario: Language ratio for single language
- **WHEN** only one language is used in a day
- **THEN** the ratio for that language is 100%
- **AND** other languages show 0%

### Requirement: Measurement Data Persistence
The system SHALL persist all measurement data to the database.

#### Scenario: Measurement data saved
- **WHEN** measurement data is collected
- **THEN** data is saved to the database immediately
- **AND** data is associated with the current session
- **AND** data can be retrieved later

#### Scenario: Measurement data retrieved
- **WHEN** measurement data is queried
- **THEN** stored data is retrieved from the database
- **AND** data is accurate and complete

