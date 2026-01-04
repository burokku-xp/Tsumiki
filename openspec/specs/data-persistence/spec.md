# data-persistence Specification

## Purpose
TBD - created by archiving change add-data-persistence. Update Purpose after archive.
## Requirements
### Requirement: Database Initialization
The system SHALL initialize a SQLite database when the extension is first activated.

#### Scenario: Database created on first activation
- **WHEN** the extension is activated for the first time
- **THEN** a SQLite database file is created in the global storage directory
- **AND** all required tables are created
- **AND** the database is ready to accept data

#### Scenario: Database exists on subsequent activation
- **WHEN** the extension is activated and the database already exists
- **THEN** the existing database is opened
- **AND** migrations are executed if schema version is outdated
- **AND** the database is ready to accept data

### Requirement: Session Storage
The system SHALL store work sessions with start time, end time, and duration.

#### Scenario: Session created
- **WHEN** a new work session is started
- **THEN** a session record is created in the database
- **AND** the start time is recorded
- **AND** the session ID is returned

#### Scenario: Session updated
- **WHEN** a work session ends
- **THEN** the session record is updated with end time
- **AND** the duration is calculated and stored

#### Scenario: Session retrieved
- **WHEN** sessions are queried by date range
- **THEN** matching session records are returned
- **AND** all session data is accurate

### Requirement: File Edit Tracking
The system SHALL store file edit records including file path, line count, language, and save timestamp.

#### Scenario: File edit recorded
- **WHEN** a file is saved
- **THEN** a file edit record is created
- **AND** file path, line count, language, and timestamp are stored
- **AND** the record is associated with the current session

#### Scenario: File edits retrieved
- **WHEN** file edits are queried by date or session
- **THEN** matching file edit records are returned
- **AND** records are ordered by timestamp

### Requirement: Daily Statistics
The system SHALL calculate and store daily statistics including work time, save count, file count, line changes, and language ratios.

#### Scenario: Daily stats calculated
- **WHEN** daily statistics are requested for a specific date
- **THEN** statistics are calculated from sessions and file edits
- **AND** work time, save count, file count, and line changes are aggregated
- **AND** language ratios are calculated based on file edits

#### Scenario: Daily stats stored
- **WHEN** daily statistics are calculated
- **THEN** statistics are stored in the daily_stats table
- **AND** subsequent queries return cached statistics

#### Scenario: Daily stats retrieved
- **WHEN** daily statistics are queried by date
- **THEN** stored statistics are returned if available
- **AND** statistics are recalculated if not available

### Requirement: Database Migrations
The system SHALL support database schema migrations to handle future schema changes.

#### Scenario: Migration executed
- **WHEN** the extension detects a schema version mismatch
- **THEN** pending migrations are executed in order
- **AND** the schema version is updated
- **AND** existing data is preserved

#### Scenario: Migration rollback on failure
- **WHEN** a migration fails
- **THEN** the migration is rolled back
- **AND** the database remains in a consistent state
- **AND** an error is logged

### Requirement: Data Integrity
The system SHALL maintain data integrity through transactions and constraints.

#### Scenario: Transaction rollback on error
- **WHEN** a database operation fails within a transaction
- **THEN** all changes in the transaction are rolled back
- **AND** the database remains consistent

#### Scenario: Foreign key constraints
- **WHEN** a file edit record references a non-existent session
- **THEN** the operation fails with an appropriate error
- **AND** data integrity is maintained

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

