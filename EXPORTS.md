# Exports

This page lists everything other resources can use to read from or control the
group system. Server exports are called with `exports['bs_groupsystem']`.

Many functions return a result table shaped like this:

```lua
{ status = true, msg = 'Some message' }
```

`status` tells you if the action worked. `msg` is a short message you can show
to the player.

## Client

### Reading the local player's group (State Bag)

The system keeps the local player's group info on a state bag, so you can read it
instantly without a callback.

```lua
local myData = LocalPlayer.state.partyData

if myData and myData.inParty then
    print(myData.currentJob) -- job name, or false when the group has no job
else
    -- the player is not in a group
end
```

## Server

### Reading group information

#### getPlayerPartyId
Returns the group id a player is in.
- `citizenid` (string) The player's identifier.
- Returns the group id (number), or `false` if they are not in a group.
```lua
local partyId = exports['bs_groupsystem']:getPlayerPartyId(citizenid)
```

#### getPartyById
Returns the full data table for a group.
```lua
local party = exports['bs_groupsystem']:getPartyById(partyId)
```

#### getPartyMembers
Returns the members of a group as a list of `{ citizenid, name }`, or `false`.
```lua
local members = exports['bs_groupsystem']:getPartyMembers(partyId)
```

#### getPartyLeader
Returns the leader's citizen id, or `false` if the leader is offline.
```lua
local leaderId = exports['bs_groupsystem']:getPartyLeader(partyId)
```

#### isPartyLeader
Returns `true` if the given player leads the group.
```lua
local isLeader = exports['bs_groupsystem']:isPartyLeader(partyId, citizenid)
```

#### getPartySize
Returns how many members are in the group, or `false`.
```lua
local size = exports['bs_groupsystem']:getPartySize(partyId)
```

#### getPartyJob
Returns the group's active job name, or `false` when it has none.
```lua
local job = exports['bs_groupsystem']:getPartyJob(partyId)
```

#### getPartyType
Returns `'legal'` or `'illegal'` for the group's active job.
```lua
local partyType = exports['bs_groupsystem']:getPartyType(partyId)
```

#### hasPartyShadowMod
Returns `true` if every member meets the requirement for illegal jobs.
```lua
local canDoIllegal = exports['bs_groupsystem']:hasPartyShadowMod(partyId)
```

#### canJoinParty
Returns `true` if a job still has a free slot for another group.
```lua
local free = exports['bs_groupsystem']:canJoinParty('garbage')
```

### Jobs and tasks

#### registerJob
Registers a job that groups can take on.
- `name` (string) Job name.
- `icon` (string) Icon shown in the menu.
- `size` (number) Maximum groups doing this job at once. Use `-1` for unlimited.
- `type` (string) `'legal'` or `'illegal'`.
```lua
exports['bs_groupsystem']:registerJob({
    name = 'Fishing',
    icon = 'fas fa-fish',
    size = 3,
    type = 'legal',
})
```

#### setPartyJob
Gives a group a registered job.
```lua
local result = exports['bs_groupsystem']:setPartyJob(partyId, 'garbage')
```

#### sendJob
Offers a registered job to a group's **leader**. The offer appears in the group
UI under **Pending Actions**, where the leader taps the Accept or Decline
buttons. Returns immediately — it does **not** wait for the answer. On accept the
job is assigned to the whole group (same rules as `setPartyJob`). Only one offer
can be pending per group at a time.
- `partyId` (number) The group id.
- `job` (string) A registered job name.
- `opts` (table, optional):
  - `title` (string) Card heading.
  - `description` (string) Card body text.
  - `icon` (string) Icon.
  - `confirmLabel` (string) Text for the Accept button (defaults to "Accept").
  - `cancelLabel` (string) Text for the Decline button (defaults to "Decline").
- Returns `{ status, msg }`. `status` is `true` once queued, or `false` if the
  group already has a job, already has a pending offer, or the job/party is
  invalid.
```lua
local result = exports['bs_groupsystem']:sendJob(partyId, 'garbage', {
    title = 'New Garbage Route',
    description = 'You finished the current route. Take a new one, or return to HQ to get paid?',
    confirmLabel = 'Accept New Route',
    cancelLabel = 'Return to HQ',
})
-- result.status == true once the offer is waiting in the leader's UI
```

The leader's Accept/Decline goes through the UI. To resolve a pending offer
programmatically, use `resolveJobOffer`.

#### resolveJobOffer
Resolves a group's pending job offer. Only the leader may respond. Accepting
assigns the job via `setPartyJob`; declining clears the offer.
- `partyId` (number) The group id.
- `citizenid` (string) The responding player's identifier (must be the leader).
- `accept` (boolean) `true` to accept, `false` to decline.
```lua
exports['bs_groupsystem']:resolveJobOffer(partyId, leaderCitizenId, true)
```

#### updatePartyTasks
Replaces the group's task list. Every member sees the change right away.
- `tasks` (table) A list of `{ name, status }`. Status is `'done'`, `'current'` or `'pending'`.
```lua
exports['bs_groupsystem']:updatePartyTasks(partyId, {
    { name = 'Collect trash', status = 'done' },
    { name = 'Go to landfill', status = 'current' },
    { name = 'Return the truck', status = 'pending' },
})
```

### Managing groups

#### createParty
Creates a new group led by a player.
- `source` (number) Server id of the leader.
- `partyName` (string) Group name.
- `maxMembers` (number) Member limit. Defaults to 6.
- `joinType` (string) `'Request to Join'`, `'Invite Only'` or `'Closed'`. Defaults to `'Request to Join'`.
```lua
exports['bs_groupsystem']:createParty(source, 'My Group', 4, 'Request to Join')
```

#### disbandParty
Disbands a group. Only the leader can do this.
```lua
exports['bs_groupsystem']:disbandParty(source, partyId, citizenid)
```

#### sendPartyNotification
Sends a notification to every member of a group.
```lua
exports['bs_groupsystem']:sendPartyNotification(partyId, {
    title = 'Group Message',
    description = 'Everyone report to the warehouse.',
    icon = 'info-circle',
})
```

#### sendToPartyMembers
Runs a function once for every member.
- `cb` (function) Receives `(playerId, citizenId)`. `playerId` is `nil` for offline members.
```lua
exports['bs_groupsystem']:sendToPartyMembers(partyId, function(playerId, citizenId)
    if playerId then
        -- do something with the online member
    end
end)
```

### Map blips

#### createPartyBlip
Creates a blip shown to every member.
- `blipName` (string) A unique name for the blip.
- `blipData` (table) Supports `coords`, `sprite`, `color`, `scale`, `label` and `route`.
```lua
exports['bs_groupsystem']:createPartyBlip(partyId, 'target_loc', {
    coords = vector3(100.0, 200.0, 30.0),
    sprite = 1,
    color = 3,
    label = 'Target Warehouse',
})
```

#### removePartyBlip
Removes a single named blip from all members.
```lua
exports['bs_groupsystem']:removePartyBlip(partyId, 'target_loc')
```

#### removeAllPartyBlips
Removes every blip from all members.
```lua
exports['bs_groupsystem']:removeAllPartyBlips(partyId)
```
