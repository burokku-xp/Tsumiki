## MODIFIED Requirements
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
