# Group System with Tasks List

A modern group and party system for FiveM. Players can form groups, take on jobs
together, follow a shared task list and see the same map blips. It works with the
main frameworks out of the box.

## Documentation

Full guides are available here:
https://bytecode-studios.gitbook.io/org/scripts/groups

Every export is documented in [EXPORTS.md](EXPORTS.md).

## What it can do

**Works with your framework**
Supports ESX, QBCore, Qbox and Ox with no extra setup. The correct bridge loads
automatically based on what your server is running.

**Group management**
- Create a group with a custom name, a member limit and a join type
  (`Request to Join`, `Invite Only` or `Closed`).
- Every member sees the same group information in real time.
- The leader can invite nearby players, accept or decline join requests, promote
  a new leader, kick members or disband the group.
- If the leader disconnects, another member is promoted automatically. A member
  who reconnects within `Config.PartyTimeout` keeps their place.

**Jobs**
- Register jobs that groups can take on, with an optional limit on how many
  groups may run the same job at once.
- Jobs can be marked legal or illegal.
- Illegal jobs require every member to hold the gating item (`shadowmod` by
  default, configurable in `bridge/inventory/`).
- `sendJob` offers a job to the leader, who accepts or declines it from the UI.

**Task list**
- Give a group a list of tasks with a `pending`, `current` or `done` status.
- All members see task changes the moment they happen, both in the app and in
  the always-on task HUD.

**Map blips**
- Share a location, an area or an entity with the whole group.
- Custom icon, color, size and automatic route are supported.

**Interface**
- Clean, responsive menu for finding and managing groups.
- Built in support for the `kartik-laptop` app and the `sd-phone` phone app
  (also registered under `lb-phone`). Each integration lives in its own bridge
  adapter under `bridge/apps/`, so adding another host is self-contained.

**Drop-in replacement**
Registers the exports of `bd-groups` and `ps-playergroups` under their original
names, so scripts written for either keep working without edits.

## Requirements

- [ox_lib](https://github.com/CommunityOx/ox_lib)

## Installation

1. Place the `bs_groupsystem` folder inside your server's `resources` folder.
2. Make sure `ox_lib` is installed and starts before this resource.
3. Open `config.lua` and adjust the settings to your liking.
4. Add `ensure bs_groupsystem` to your server config file.

## Configuration

All settings live in `config.lua`.

| Setting | What it does |
| --- | --- |
| `Config.PartyTimeout` | How long a disconnected member is kept before being removed, in milliseconds. Default is 5 minutes. |
| `Config.StartingPartyCooldown` | How long players must wait after the server starts before creating groups, in minutes. |
| `Config.AllowLeavePartyDuringJob` | Whether members can leave or be kicked while a job is active. |
| `Config.AppSettings` | Settings for the laptop app integration, such as `kartik-laptop`. |
| `Config.PhoneApp` | Settings for the phone app integration (`sd-phone` / `lb-phone`): app name, icon, whether it is pre-installed, etc. |

Discord logging is off by default. Add your webhook URL to the `webhook`
variable at the top of `bridge/logger/server.lua` to turn it on.

## How players open it

By default players press `F6` to open the group menu. You can change this key in
the FiveM keybind settings. When a laptop or phone integration is running, the
keybind is disabled and the app is opened from that host instead.

## For developers

Read the local player's group straight off a state bag, with no callback:

```lua
local myData = LocalPlayer.state.partyData

if myData and myData.inParty then
    print(myData.currentJob) -- job name, or false when the group has no job
end
```

Server events you can listen for:

| Event | When it fires |
| --- | --- |
| `bs_groupsystem:server:leftParty` | A member left, was kicked, or the group disbanded. |
| `bs_groupsystem:server:disbandParty` | A leader disbanded the group. |
| `bs_groupsystem:server:jobOfferResolved` | A leader accepted or declined a job offer. |
| `bs_groupsystem:server:resumePendingJobs` | A member reconnected into a group with an active job. |

## Credits

Developed by Cadburry, Guardian and Snappy, Butterchilly.
