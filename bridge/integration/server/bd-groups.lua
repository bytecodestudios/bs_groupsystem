if (GetResourceState('bd-groups') ~= 'started') then return end

--- Exports a function to bd-groups.
---@param name string
---@param cb function
local function exportHandler(name, cb)
    AddEventHandler(('__cfx_export_bd-groups_%s'):format(name), function(setCB)
        setCB(cb)
    end)
end

--- Returns the group leader's server source ID.
---@param groupId number
---@return number|false leaderSource
exportHandler('GetGroupLeader', function(groupId)
    local party = exports['cad-groupsystem']:getPartyById(groupId)
    if not party then return false end
    local player = Players:get(party.leader)
    if not player then return false end
    return player.source
end)

--- Returns the group's current job status.
---@param groupId number
---@return string|false jobStatus
exportHandler('GetJobStatus', function(groupId)
    local job = exports['cad-groupsystem']:getPartyJob(groupId)
    if type(job) == 'table' then return false end
    return job or false
end)

--- Sets the group's job status.
---@param groupId number
---@param status string
---@return table result
exportHandler('SetJobStatus', function(groupId, status)
    return exports['cad-groupsystem']:setPartyJob(groupId, status)
end)

--- Returns the total number of members in a group.
---@param groupId number
---@return number|false memberCount
exportHandler('GetGroupMembersCount', function(groupId)
    return exports['cad-groupsystem']:getPartySize(groupId)
end)

--- Returns a table of members for the group.
--- bd-groups returns member source IDs.
---@param groupId number
---@return table|false memberSources
exportHandler('GetGroupMembers', function(groupId)
    local members = exports['cad-groupsystem']:getPartyMembers(groupId)
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

--- Checks if a specific player is the leader of a group.
---@param groupId number
---@param playerSource number Server source ID
---@return boolean isLeader
exportHandler('IsGroupLeader', function(groupId, playerSource)
    local player = Players:get(playerSource)
    if not player then return false end
    return exports['cad-groupsystem']:isPartyLeader(groupId, player.citizenid)
end)

--- Finds the groupId a player belongs to by their server source ID.
--- Returns -1 if the player is not in any group (bd-groups convention).
---@param playerSource number Server source ID
---@return number groupId
exportHandler('FindGroupByMember', function(playerSource)
    local player = Players:get(playerSource)
    if not player then return -1 end
    local partyId = exports['cad-groupsystem']:getPlayerPartyId(player.citizenid)
    return partyId or -1
end)

--- Creates a blip on the map for all group members.
---@param groupId number
---@param blipName string
---@param blipData table { coords, color, alpha, sprite, scale, label, route, routeColor }
exportHandler('CreateBlipForGroup', function(groupId, blipName, blipData)
    exports['cad-groupsystem']:createPartyBlip(groupId, blipName, {
        coords = blipData.coords,
        sprite = blipData.sprite or 1,
        color = blipData.color or 1,
        scale = blipData.scale or 0.8,
        label = blipData.label or blipName,
        route = blipData.route or false,
    })
end)

--- Removes a blip previously created for a group.
---@param groupId number
---@param blipName string
exportHandler('RemoveBlipForGroup', function(groupId, blipName)
    exports['cad-groupsystem']:removePartyBlip(groupId, blipName)
end)

--- Deletes / disbands a group.
---@param groupId number
exportHandler('DestroyGroup', function(groupId)
    local party = exports['cad-groupsystem']:getPartyById(groupId)
    if not party then return end
    exports['cad-groupsystem']:disbandParty(nil, groupId, party.leader)
end)

--- Sends a notification to all members of a group.
---@param groupId number
---@param message string
---@param timeout number|nil Duration in ms
exportHandler('NotifyGroup', function(groupId, message, timeout)
    exports['cad-groupsystem']:sendPartyNotification(groupId, {
        title = 'Group',
        description = message,
        icon = 'users',
        duration = timeout or 5000,
    })
end)

--- Checks if a group with the given ID exists.
---@param groupId number
---@return boolean exists
exportHandler('DoesGroupExist', function(groupId)
    return exports['cad-groupsystem']:getPartyById(groupId) ~= nil
end)

--- Server-side callbacks for bd-groups client export helpers
lib.callback.register('bs_groupsystem:compat:bd:getGroupId', function(source)
    local player = Players:get(source)
    if not player then return -1 end
    local partyId = exports['cad-groupsystem']:getPlayerPartyId(player.citizenid)
    return partyId or -1
end)

lib.callback.register('bs_groupsystem:compat:bd:isGroupLeader', function(source)
    local player = Players:get(source)
    if not player then return false end
    local partyId = exports['cad-groupsystem']:getPlayerPartyId(player.citizenid)
    if not partyId then return false end
    return exports['cad-groupsystem']:isPartyLeader(partyId, player.citizenid)
end)

lib.callback.register('bs_groupsystem:compat:bd:getJobStage', function(source)
    local player = Players:get(source)
    if not player then return 'WAITING' end
    local partyId = exports['cad-groupsystem']:getPlayerPartyId(player.citizenid)
    if not partyId then return 'WAITING' end
    local party = exports['cad-groupsystem']:getPartyById(partyId)
    if not party or not party.currentJob then return 'WAITING' end
    return party.currentJob
end)
