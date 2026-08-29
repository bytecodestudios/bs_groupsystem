# Group System

A modern group and party system for FiveM. Players can form groups, take on jobs
together, follow a shared task list and see the same map blips. It works with the
main frameworks out of the box.

## Documentation

Full guides are available here:
https://bytecode-studios.gitbook.io/org/scripts/groups

## What it can do

**Works with your framework**
Supports ESX, QBCore, Qbox and Ox with no extra setup. The correct bridge loads
automatically based on what your server is running.

**Group management**
- Create a group with a custom name, a member limit and a join type.
- Every member sees the same group information in real time.
- The leader can promote a new leader, kick members or disband the group.
- If the leader disconnects, another member is promoted automatically.

**Jobs**
- Register jobs that groups can take on.
- Jobs can be marked legal or illegal.
- Illegal jobs require every member to hold the correct item (a "VPN" item by default).

**Task list**
- Give a group a list of tasks with a Pending, Current or Done status.
- All members see task changes the moment they happen.

**Map blips**
- Share a location, an area or an entity with the whole group.
- Custom icon, color, size and automatic route are supported.

**Interface**
- Clean, responsive menu for finding and managing groups.
- Built in support for the `kartik-laptop` app and the `sd-phone` phone app
  (also registered under `lb-phone`). Each integration lives in its own bridge
  adapter under `bridge/apps/`, so adding another host is self-contained.

## Requirements

- [ox_lib](https://github.com/CommunityOx/ox_lib)

## Installation

1. Place the `bs_groups` folder inside your server's `resources` folder.
2. Make sure `ox_lib` is installed and starts before this resource.
3. Open `config.lua` and adjust the settings to your liking.
4. Add `ensure bs_groups` to your server config file.

## Configuration

All settings live in `config.lua`.

| Setting | What it does |
| --- | --- |
| `Config.PartyTimeout` | How long a disconnected member is kept before being removed, in milliseconds. Default is 5 minutes. |
| `Config.StartingPartyCooldown` | How long players must wait after the server starts before creating groups, in minutes. |
| `Config.AllowLeavePartyDuringJob` | Whether members can leave or be kicked while a job is active. |
| `Config.AppSettings` | Settings for the laptop app integration, such as `kartik-laptop`. |
| `Config.PhoneApp` | Settings for the phone app integration (`sd-phone` / `lb-phone`): app name, icon, whether it is pre-installed, etc. |

## How players open it

By default players press `F6` to open the group menu. You can change this key in the
FiveM keybind settings, or open it through a supported laptop app.

## Credits

Developed by Cadburry, Guardian and Snappy (Bytecode Studios).
