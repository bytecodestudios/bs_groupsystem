local groupExports = exports['cad-groupsystem']

--- Registers a compatibility export under another resource's name.
---@param resource string Resource whose export name is being provided.
---@param name string Export name.
---@param cb function Handler.
local function exportHandler(resource, name, cb)
    AddEventHandler(('__cfx_export_%s_%s'):format(resource, name), function(setCB)
        setCB(cb)
    end)
end

-- bd-groups

if GetResourceState('bd-groups') == 'started' then
    exportHandler('bd-groups', 'GetGroupLeader', function(groupId)
        local party = groupExports:getPartyById(groupId)
        if not party then return false end
        local player = Players:get(party.leader)
        return player and player.source or false
    end)

    exportHandler('bd-groups', 'GetJobStatus', function(groupId)
        local job = groupExports:getPartyJob(groupId)
        if type(job) == 'table' then return false end
        return job or false
    end)

    exportHandler('bd-groups', 'SetJobStatus', function(groupId, status)
        return groupExports:setPartyJob(groupId, status)
    end)

    exportHandler('bd-groups', 'GetGroupMembersCount', function(groupId)
        return groupExports:getPartySize(groupId)
    end)

    exportHandler('bd-groups', 'GetGroupMembers', function(groupId)
        local members = groupExports:getPartyMembers(groupId)
        if not members then return false end
        local sources = {}
        for _, member in ipairs(members) do
            local player = Players:get(member.citizenid)
            if player then sources[#sources + 1] = player.source end
        end
        return sources
    end)

    exportHandler('bd-groups', 'IsGroupLeader', function(groupId, playerSource)
        local player = Players:get(playerSource)
        if not player then return false end
        return groupExports:isPartyLeader(groupId, player.citizenid)
    end)

    exportHandler('bd-groups', 'FindGroupByMember', function(playerSource)
        local player = Players:get(playerSource)
        if not player then return -1 end
        return groupExports:getPlayerPartyId(player.citizenid) or -1
    end)

    exportHandler('bd-groups', 'CreateBlipForGroup', function(groupId, blipName, blipData)
        groupExports:createPartyBlip(groupId, blipName, {
            coords = blipData.coords,
            sprite = blipData.sprite or 1,
            color = blipData.color or 1,
            scale = blipData.scale or 0.8,
            label = blipData.label or blipName,
            route = blipData.route or false,
        })
    end)

    exportHandler('bd-groups', 'RemoveBlipForGroup', function(groupId, blipName)
        groupExports:removePartyBlip(groupId, blipName)
    end)

    exportHandler('bd-groups', 'DestroyGroup', function(groupId)
        local party = groupExports:getPartyById(groupId)
        if not party then return end
        groupExports:disbandParty(nil, groupId, party.leader)
    end)

    exportHandler('bd-groups', 'NotifyGroup', function(groupId, message, timeout)
        groupExports:sendPartyNotification(groupId, {
            title = 'Group',
            description = message,
            icon = 'users',
            duration = timeout or 5000,
        })
    end)

    exportHandler('bd-groups', 'DoesGroupExist', function(groupId)
        return groupExports:getPartyById(groupId) ~= nil
    end)

    lib.callback.register('bs_groupsystem:compat:bd:getGroupId', function(source)
        local player = Players:get(source)
        if not player then return -1 end
        return groupExports:getPlayerPartyId(player.citizenid) or -1
    end)

    lib.callback.register('bs_groupsystem:compat:bd:isGroupLeader', function(source)
        local player = Players:get(source)
        if not player then return false end
        local partyId = groupExports:getPlayerPartyId(player.citizenid)
        if not partyId then return false end
        return groupExports:isPartyLeader(partyId, player.citizenid)
    end)

    lib.callback.register('bs_groupsystem:compat:bd:getJobStage', function(source)
        local player = Players:get(source)
        if not player then return 'WAITING' end
        local partyId = groupExports:getPlayerPartyId(player.citizenid)
        if not partyId then return 'WAITING' end
        local party = groupExports:getPartyById(partyId)
        if not party or not party.currentJob then return 'WAITING' end
        return party.currentJob
    end)
end

-- ps-playergroups

if GetResourceState('ps-playergroups') == 'started' then
    exportHandler('ps-playergroups', 'GetGroupLeader', function(groupId)
        local party = groupExports:getPartyById(groupId)
        if not party then return false end
        local player = Players:get(party.leader)
        return player and player.source or false
    end)

    exportHandler('ps-playergroups', 'getJobStatus', function(groupId)
        local job = groupExports:getPartyJob(groupId)
        if type(job) == 'table' then return false end
        return job or false
    end)

    exportHandler('ps-playergroups', 'setJobStatus', function(groupId, status)
        return groupExports:setPartyJob(groupId, status)
    end)

    exportHandler('ps-playergroups', 'getGroupSize', function(groupId)
        return groupExports:getPartySize(groupId)
    end)

    exportHandler('ps-playergroups', 'getGroupMembers', function(groupId)
        local members = groupExports:getPartyMembers(groupId)
        if not members then return false end
        local sources = {}
        for _, member in ipairs(members) do
            local player = Players:get(member.citizenid)
            if player then sources[#sources + 1] = player.source end
        end
        return sources
    end)

    exportHandler('ps-playergroups', 'CreateBlipForGroup', function(groupId, name, label, coords, sprite, color, scale, route)
        groupExports:createPartyBlip(groupId, name, {
            coords = coords,
            sprite = sprite or 1,
            color = color or 1,
            scale = scale or 0.8,
            label = label or name,
            route = route or false,
        })
    end)

    exportHandler('ps-playergroups', 'RemoveBlipForGroup', function(groupId, name)
        groupExports:removePartyBlip(groupId, name)
    end)

    exportHandler('ps-playergroups', 'FindGroupByMember', function(playerId)
        local player = Players:get(playerId)
        if not player then return 0 end
        return groupExports:getPlayerPartyId(player.citizenid) or 0
    end)

    exportHandler('ps-playergroups', 'GroupEvent', function(groupId, eventName, args)
        groupExports:sendToPartyMembers(groupId, function(playerId)
            if not playerId then return end
            if args then
                TriggerClientEvent(eventName, playerId, table.unpack(args))
            else
                TriggerClientEvent(eventName, playerId)
            end
        end)
    end)

    lib.callback.register('bs_groupsystem:compat:getGroupID', function(source)
        local player = Players:get(source)
        if not player then return 0 end
        return groupExports:getPlayerPartyId(player.citizenid) or 0
    end)

    lib.callback.register('bs_groupsystem:compat:isGroupLeader', function(source)
        local player = Players:get(source)
        if not player then return false end
        local partyId = groupExports:getPlayerPartyId(player.citizenid)
        if not partyId then return false end
        return groupExports:isPartyLeader(partyId, player.citizenid)
    end)
end
