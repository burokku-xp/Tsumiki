## ADDED Requirements

### Requirement: Timer Control UI
The system SHALL provide a timer control interface in the side panel WebView for starting and stopping the work timer.

#### Scenario: Timer control displayed
- **WHEN** the side panel WebView is opened
- **THEN** a timer control section is displayed immediately below the header
- **AND** the timer control appears before the statistics section
- **AND** the current timer state (running/stopped) is shown
- **AND** start/stop buttons are available

#### Scenario: Timer started from UI
- **WHEN** user clicks the start button in the timer control
- **THEN** the timer is started
- **AND** the timer state is updated to "running"
- **AND** the elapsed time display begins updating
- **AND** the button changes to a stop button

#### Scenario: Timer stopped from UI
- **WHEN** user clicks the stop button in the timer control
- **THEN** the timer is stopped
- **AND** the timer state is updated to "stopped"
- **AND** the elapsed time display stops updating
- **AND** the button changes to a start button

#### Scenario: Timer state synchronized
- **WHEN** the timer is started or stopped via command or status bar
- **THEN** the timer control UI reflects the current state
- **AND** the elapsed time display is updated accordingly

#### Scenario: Elapsed time displayed
- **WHEN** the timer is running
- **THEN** the elapsed time is displayed in the timer control
- **AND** the elapsed time updates every second
- **AND** the time format is readable (e.g., "1時間23分" or "HH:MM:SS")

#### Scenario: Timer state on WebView load
- **WHEN** the WebView is opened or refreshed
- **THEN** the current timer state is requested from the extension host
- **AND** the timer control displays the correct state
- **AND** if the timer is running, the elapsed time is calculated and displayed
