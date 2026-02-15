if (GetResourceState('ps-playergroups') ~= 'started') then return end

--- Exports a function to ps-playergroups.
---@param name string
---@param cb function
local function exportHandler(name, cb)
    AddEventHandler(('__cfx_export_ps-playergroups_%s'):format(name), function(setCB)
        setCB(cb)
    end)
end

--- Returns the group leader's server source ID.
--- ps-playergroups returns the leader's source, not citizenid.
---@param groupID number
---@return number|false leaderSource
exportHandler('GetGroupLeader', function(groupID)
    local party = exports['cad-groupsystem']:getPartyById(groupID)
    if not party then return false end
    local player = Players:get(party.leader)
    if not player then return false end
    return player.source
end)

--- Returns the group's current job (status).
---@param groupID number
---@return string|false jobStatus
exportHandler('getJobStatus', function(groupID)
    local job = exports['cad-groupsystem']:getPartyJob(groupID)
    if type(job) == 'table' then return false end
    return job or false
end)

--- Sets the group's job status.
---@param groupID number
---@param status string
---@return table result
exportHandler('setJobStatus', function(groupID, status)
    return exports['cad-groupsystem']:setPartyJob(groupID, status)
end)

--- Returns the number of members in the group.
---@param groupID number
---@return number|false size
exportHandler('getGroupSize', function(groupID)
    return exports['cad-groupsystem']:getPartySize(groupID)
end)

--- Returns a table of server source IDs for all group members.
--- ps-playergroups returns player IDs (sources), not citizenids.
---@param groupID number
---@return table|false memberSources
exportHandler('getGroupMembers', function(groupID)
    local members = exports['cad-groupsystem']:getPartyMembers(groupID)
    if not members then return false end

    local sources = {}
    for _, member in ipairs(members) do
        local player = Players:get(member.citizenid)
        if player then
            sources[#sources + 1] = player.source
        end
    end
    return sources
end)

--- Creates a blip visible to all group members.
--- Adapts ps-playergroups' flat parameter style to groupsystem's blipData table.
---@param groupID number
---@param name string
---@param label string
---@param coords vector3
---@param sprite number
---@param color number
---@param scale number
---@param route boolean|nil
exportHandler('CreateBlipForGroup', function(groupID, name, label, coords, sprite, color, scale, route)
    exports['cad-groupsystem']:createPartyBlip(groupID, name, {
        coords = coords,
        sprite = sprite or 1,
        color = color or 1,
        scale = scale or 0.8,
        label = label or name,
        route = route or false,
    })
end)

--- Removes a named blip from all group members.
---@param groupID number
---@param name string
exportHandler('RemoveBlipForGroup', function(groupID, name)
    exports['cad-groupsystem']:removePartyBlip(groupID, name)
end)

--- Finds the groupID a player belongs to by their server source ID.
--- Returns 0 if the player is not in any group (ps-playergroups convention).
---@param playerID number Server source ID
---@return number groupID
exportHandler('FindGroupByMember', function(playerID)
    local player = Players:get(playerID)
    if not player then return 0 end
    local partyId = exports['cad-groupsystem']:getPlayerPartyId(player.citizenid)
    return partyId or 0
end)

--- Triggers a client event for every member in a group.
---@param groupID number
---@param eventname string
---@param args any|nil
exportHandler('GroupEvent', function(groupID, eventname, args)
    exports['cad-groupsystem']:sendToPartyMembers(groupID, function(playerId)
        if playerId then
            if args then
                TriggerClientEvent(eventname, playerId, table.unpack(args))
            else
                TriggerClientEvent(eventname, playerId)
            end
        end
    end)
end)

--- Server-side callbacks for client export helpers
lib.callback.register('bs_groupsystem:compat:getGroupID', function(source)
    local player = Players:get(source)
    if not player then return 0 end
    local partyId = exports['cad-groupsystem']:getPlayerPartyId(player.citizenid)
    return partyId or 0
end)

lib.callback.register('bs_groupsystem:compat:isGroupLeader', function(source)
    local player = Players:get(source)
    if not player then return false end
    local partyId = exports['cad-groupsystem']:getPlayerPartyId(player.citizenid)
    if not partyId then return false end
    return exports['cad-groupsystem']:isPartyLeader(partyId, player.citizenid)
end)
