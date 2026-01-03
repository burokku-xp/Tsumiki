# display Specification Changes

## MODIFIED Requirements

### Requirement: Daily Summary Display
The system SHALL display daily summary using a modern, card-based interface with "building block" motifs and an orange-themed color scheme.

#### Scenario: Daily summary displayed
- **WHEN** the WebView is opened
- **THEN** today's work time is displayed in a prominent timer card with orange accents
- **AND** save count, file count, and line changes are displayed in a grid of "stat blocks"
- **AND** language ratios are displayed as a unified stacked bar chart
- **AND** the interface has a clear visual boundary separating it from the workspace

### Requirement: Responsive Layout
The system SHALL adapt its layout to varying sidebar widths without breaking or overlapping elements.

#### Scenario: Narrow sidebar
- **WHEN** the sidebar width is reduced (e.g., < 200px)
- **THEN** the timer display scales or wraps to remain fully visible
- **AND** statistic cards reflow into a single column if necessary
- **AND** text truncates appropriately instead of overflowing

#### Scenario: Wide sidebar
- **WHEN** the sidebar width is increased
- **THEN** elements expand or reflow to utilize the available space (e.g., multi-column stats)
