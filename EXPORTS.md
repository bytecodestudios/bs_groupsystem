# CLIENT

### Party Data (State Bags)
State bags are automatically updated for the local player.

```lua
local myPartyData = LocalPlayer.state.partyData

if myPartyData and myPartyData.inParty then
    print(myPartyData.currentJob) -- Returns current job name or false
else
    -- Not in a party
end
```

---

# SERVER

### sendPartyNotification
Send a notification to all members of a party using `ox_lib`.
- `partyId`: (number) The ID of the party.
- `data`: (table) `ox_lib` notification data (title, description, icon, type, etc.).
```lua
exports['cad-groupsystem']:sendPartyNotification(partyId, {
    title = 'Group Message',
    description = 'Everyone report to the warehouse!',
    icon = 'info-circle'
})
```

### getPlayerPartyId
Returns the party ID for a given player's citizen ID.
- `citizenid`: (string) The player's unique identifier.
- `@return`: (number|false) Party ID or false if not in a party.
```lua
local partyId = exports['cad-groupsystem']:getPlayerPartyId(citizenid)
```

### getPartyById
Returns the full party data table.
```lua
local party = exports['cad-groupsystem']:getPartyById(partyId)
```

### getPartyMembers
Returns a list of members in the party.
- `@return`: (table|false) List of `{ citizenid, name }` or false.
```lua
local members = exports['cad-groupsystem']:getPartyMembers(partyId)
```

### getPartyLeader
Returns the citizen ID of the party leader.
```lua
local leaderId = exports['cad-groupsystem']:getPartyLeader(partyId)
```

### isPartyLeader
Checks if a specific player is the leader of a party.
```lua
local isLeader = exports['cad-groupsystem']:isPartyLeader(partyId, citizenid)
```

### getPartySize
Returns the current number of members in the party.
```lua
local size = exports['cad-groupsystem']:getPartySize(partyId)
```

### getPartyJob
Returns the name of the job currently assigned to the party.
```lua
local jobName = exports['cad-groupsystem']:getPartyJob(partyId)
```

### getPartyType
Returns the type of the party (e.g., 'legal' or 'illegal').
```lua
local partyType = exports['cad-groupsystem']:getPartyType(partyId)
```

### hasPartyShadowMod
Checks if all members of the party have access to illegal activities (VPN Access).
```lua
local hasAccess = exports['cad-groupsystem']:hasPartyShadowMod(partyId)
```

### canJoinParty
Checks if a job has reached its maximum concurrent party limit.
```lua
local canJoin = exports['cad-groupsystem']:canJoinParty('garbage')
```

### setPartyJob
Assigns a registered job to the party.
```lua
exports['cad-groupsystem']:setPartyJob(partyId, 'garbage')
```

### updatePartyTasks
Updates the interactive task list for all party members.
- `tasks`: (table) List of `{ name, status }`. Status can be 'done', 'current', or 'pending'.
```lua
exports['cad-groupsystem']:updatePartyTasks(partyId, {
    { name = 'Collect trash', status = 'done' },
    { name = 'Go to landfill', status = 'current' },
    { name = 'Return truck', status = 'pending' }
})
```

### createParty
Creates a new party with specified parameters.
- `source`: (number) Server ID of the creator.
- `partyName`: (string) Name for the party.
- `maxMembers`: (number) Limit of members (default 6).
- `joinType`: (string) 'Request to Join' or 'Open' (default 'Request to Join').
```lua
exports['cad-groupsystem']:createParty(source, 'My Party', 4, 'Open')
```

### disbandParty
Forcefully disbands a party.
```lua
exports['cad-groupsystem']:disbandParty(source, partyId, citizenid)
```

### registerJob
Registers a new job that parties can perform.
```lua
local data = {
    name = 'Fishing',
    icon = 'fas fa-fish',
    size = 3, -- Max concurrent groups (-1 for unlimited)
    type = 'legal'
}
exports['cad-groupsystem']:registerJob(data)
```

### sendToPartyMembers
Executes a callback for every member in the party.
- `cb`: `function(playerId, citizenId)`
```lua
exports['cad-groupsystem']:sendToPartyMembers(partyId, function(playerId, citizenId)
    if playerId then
        -- Do something to online player
    end
end)
```

### createPartyBlip
Creates a synchronized blip for all party members.
- `blipName`: (string) Unique identifier for this blip.
- `blipData`: (table) contains `coords`, `sprite`, `color`, `scale`, `label`, `route`.
```lua
exports['cad-groupsystem']:createPartyBlip(partyId, 'target_loc', {
    coords = vector3(100.0, 200.0, 30.0),
    sprite = 1,
    color = 3,
    label = "Target Warehouse"
})
```

### removePartyBlip / removeAllPartyBlips
Removes shared blips.
```lua
exports['cad-groupsystem']:removePartyBlip(partyId, 'target_loc')
exports['cad-groupsystem']:removeAllPartyBlips(partyId)
```
