## ADDED Requirements

### Requirement: WebView in Primary Sidebar
The system SHALL provide a WebView in the primary sidebar (alongside Explorer, Search, Source Control) to display daily summary.

#### Scenario: WebView appears in primary sidebar
- **WHEN** user clicks the Tsumiki icon in the primary sidebar
- **THEN** the WebView is created and displayed
- **AND** the React application loads
- **AND** the daily summary is displayed

#### Scenario: WebView persists
- **WHEN** VSCode is reloaded
- **THEN** the WebView state is restored
- **AND** the daily summary is displayed

### Requirement: Daily Summary Display
The system SHALL display daily summary including work time, save count, file count, line changes, language ratios, and edited files list.

#### Scenario: Daily summary displayed
- **WHEN** the WebView is opened
- **THEN** today's work time is displayed
- **AND** save count and file count are displayed
- **AND** line changes are displayed with "(参考値)" label
- **AND** language ratios are displayed as percentages with progress bars
- **AND** edited files list is displayed with file names and line counts

#### Scenario: No data display
- **WHEN** there is no data for today
- **THEN** appropriate message is displayed (e.g., "本日のデータはありません")
- **AND** the UI remains functional

### Requirement: Work Time Display
The system SHALL display work time in hours and minutes format.

#### Scenario: Work time formatted
- **WHEN** work time is 3 hours and 12 minutes
- **THEN** it is displayed as "3時間12分"
- **AND** the format is consistent

### Requirement: Save Count and File Count Display
The system SHALL display save count and number of edited files.

#### Scenario: Save count displayed
- **WHEN** 24 files have been saved
- **THEN** save count is displayed as "24回"
- **AND** file count is displayed as "8ファイル"

### Requirement: Line Changes Display
The system SHALL display line changes with a reference value label.

#### Scenario: Line changes displayed
- **WHEN** 187 lines have been changed
- **THEN** it is displayed as "187行 (参考値)"
- **AND** the reference value label is clearly visible

### Requirement: Language Ratio Display
The system SHALL display language ratios as percentages.

#### Scenario: Language ratios displayed
- **WHEN** TypeScript accounts for 65% and CSS for 20%
- **THEN** language ratios are displayed as "TypeScript 65%, CSS 20%"
- **AND** ratios are ordered by percentage (descending)

### Requirement: Edited Files List Display
The system SHALL display a list of edited files with file names and line counts.

#### Scenario: Edited files list displayed
- **WHEN** multiple files have been edited
- **THEN** file names and line counts are displayed
- **AND** files are listed in a readable format
- **AND** the list is scrollable if there are many files

#### Scenario: Edited files list truncated
- **WHEN** there are more than 10 edited files
- **THEN** the list shows a limited number of files (e.g., top 10)
- **AND** an indicator shows total number of files (e.g., "... 他5ファイル")

### Requirement: Real-time Updates
The system SHALL update the display in real-time when measurement data changes.

#### Scenario: Display updates on file save
- **WHEN** a file is saved
- **THEN** the save count is updated immediately
- **AND** the file list is updated
- **AND** language ratios are recalculated and updated

#### Scenario: Display updates on timer stop
- **WHEN** the work timer is stopped
- **THEN** the work time is updated immediately
- **AND** the daily summary reflects the new work time

### Requirement: WebView Communication
The system SHALL enable communication between the WebView and the extension host.

#### Scenario: Data request from WebView
- **WHEN** the WebView requests daily data
- **THEN** the extension host receives the request
- **AND** data is retrieved from the database
- **AND** data is sent back to the WebView

#### Scenario: Update notification to WebView
- **WHEN** measurement data changes
- **THEN** the extension host sends update notification to WebView
- **AND** the WebView updates the display accordingly
