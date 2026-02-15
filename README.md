A robust and modern Group/Party system for FiveM, featuring task management, job integration, and synchronized blips for all members.

## Documentation
https://bytecode-studios.gitbook.io/cadburry

## Features

- **Multi-Framework Support**: Seamless integration with ESX, QBCore, Qbox, and Ox via automated bridges.
- **Advanced Party Management**:
    - Create parties with custom names, membership limits, and join types.
    - Real-time synchronization of party data across all members.
    - Leader controls: Promote new leaders, kick members, or disband the party.
    - Resilience: Automatic leader reassignment if a leader disconnects.
- **Job Integration**:
    - Easy registration of jobs that can be tied to parties.
    - Support for both legal and illegal activities.
    - VPN/Shadow Mod requirement for illegal jobs.
- **Dynamic Task List**:
    - Track party progress with Current, Pending, and Completed tasks.
    - Immediate updates for all members when task statuses change.
- **Synchronized Blips**:
    - Share locations, radii, and entities with all party members.
    - Supports custom sprites, colors, and auto-routing.
- **Modern NUI Integration**:
    - Built-in support for the `kartik-laptop` application.
    - Modern, responsive interface for party discovery and management.

## Dependencies

- [ox_lib](https://github.com/CommunityOx/ox_lib)

## Installation

1. Drag and drop `cad-groupsystem` into your resources folder.
2. Ensure you have `ox_lib` installed and started before this resource.
3. Configure `config.lua` to your liking.
4. Add `ensure cad-groupsystem` to your server configuration.

## Configuration

The `config.lua` file allows you to customize core timings and integrations:

- `Config.PartyTimeout`: How long (in ms) a member can be disconnected before being removed from the party (default 5 mins).
- `Config.StartingPartyCooldown`: Cooldown (in mins) before players can create new parties.
- `Config.AllowLeavePartyDuringJob`: Whether members can leave or be kicked while a job is active.
- `Config.AppSettings`: Customization for integration with laptop systems (e.g., kartik-laptop).

### Usage

#### `openGroups` (Command/Keybind)
Default keybind is `F6`. Access the Group Management menu.

## Credits

**Developed by:**
- Cadburry
- Guardian
- Snappy
