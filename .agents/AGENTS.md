# Workspace Rules

## Universal-First Rule
Every feature must be implemented once as a universal/shared function or module that serves as the single source of truth. Mobile and desktop implementations must only call these universal functions and handle platform-specific UI. Never duplicate business logic across platforms. Any change or bug fix should be made in the universal implementation so behavior remains identical everywhere.
