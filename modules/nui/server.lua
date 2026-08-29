local function fail(msg) return { status = false, msg = msg } end

lib.callback.register('bs_groupsystem:server:createParty', function(source, data)
    return Group.createParty(source, data.partyName, data.maxMembers, data.joinType)
end)

lib.callback.register('bs_groupsystem:server:requestJoinGroup', function(source, data)
    local player = Players:get(source)
    if not player then return fail(locale('player_not_online')) end
    if Group.getPlayerPartyId(player.citizenid) then return fail(locale('party_already_inparty')) end

    local partyId = tonumber(data.partyId)
    local party = partyId and Group.getPartyById(partyId)
    if not party then return fail(locale('party_does_not_exist')) end
    if party.joinType == 'Invite Only' then return fail('This group is invite only') end
    if party.joinType == 'Closed' then return fail('This group is closed') end

    local leader = Group.getPartyLeader(partyId)
    if not leader then return fail(locale('player_not_online')) end

    party.requests = party.requests or {}
    local alreadyRequested = false
    for _, req in ipairs(party.requests) do
        if req.id == player.citizenid then alreadyRequested = true break end
    end
    if not alreadyRequested then
        party.requests[#party.requests + 1] = { id = player.citizenid, name = player.name }
        Group.updatePartyData(party.members, 'refreshParties')
    end

    local leaderPlayer = Players:get(leader)
    if leaderPlayer then
        TriggerClientEvent('bs_groupsystem:client:notification', leaderPlayer.source, {
            type = 'info',
            title = locale('party_mem_wants_join_title'),
            description = locale('party_mem_wants_join_description', player.name),
            icon = 'fa-solid fa-bell',
        })
    end

    return { status = true, msg = 'Join request sent to group leader' }
end)

lib.callback.register('bs_groupsystem:server:retrieveParties', function()
    return Group.getAllParties()
end)

lib.callback.register('bs_groupsystem:server:fetchSingleGroup', function(_, groupId)
    local party = Group.getPartyById(tonumber(groupId))
    if not party then return { status = false } end
    return { status = true, group = party }
end)

lib.callback.register('bs_groupsystem:server:getPlayerData', function(source)
    local player = Players:get(source)
    if not player then return nil end
    return { citizenid = player.citizenid, name = player.name, source = source }
end)

lib.callback.register('bs_groupsystem:server:promoteLeader', function(_, data)
    local party = Group.getPartyById(tonumber(data.groupId))
    if not party then return nil end
    party.leader = data.newLeaderId
    Group.updatePartyData(party.members, 'refreshParties')
    return party
end)

lib.callback.register('bs_groupsystem:server:processRequest', function(_, data)
    local partyId = tonumber(data.groupId)
    local party = partyId and Group.getPartyById(partyId)
    if not party then return fail('Group not found') end

    if party.requests then
        for i, req in ipairs(party.requests) do
            if req.id == data.requestId then
                table.remove(party.requests, i)
                break
            end
        end
    end

    if data.action == 'accept' then
        local result = Group.addPlayerToParty(partyId, data.requestId, data.requestName)
        if result.status then Group.updatePartyData(party.members, 'refreshParties') end
        result.group = party
        return result
    end

    Group.updatePartyData(party.members, 'refreshParties')
    return { status = true, msg = 'Request declined', group = party }
end)

lib.callback.register('bs_groupsystem:server:resolveJobOffer', function(source, data)
    local player = Players:get(source)
    if not player then return fail('Player not found') end
    local partyId = Group.getPlayerPartyId(player.citizenid)
    if not partyId then return fail('Party not found') end
    return Group.resolveJobOffer(partyId, player.citizenid, data.action == 'accept')
end)

lib.callback.register('bs_groupsystem:server:kickMember', function(source, data)
    local player = Players:get(source)
    if not player then return fail('Player not found') end

    local targetCitizenid = data.memberId or data.citizenid
    local partyId = Group.getPlayerPartyId(targetCitizenid)
    if not partyId then return fail('Party not found') end

    local result = Group.kickPlayerFromParty(partyId, targetCitizenid, player.citizenid)
    if result.status then result.group = Group.getPartyById(partyId) end
    return result
end)

lib.callback.register('bs_groupsystem:server:leaveParty', function(source)
    local player = Players:get(source)
    if not player then return fail('Player not found') end
    local partyId = Group.getPlayerPartyId(player.citizenid)
    if not partyId then return fail('Party not found') end
    return Group.removePlayerFromParty(partyId, player.citizenid)
end)

lib.callback.register('bs_groupsystem:server:requestDisbandParty', function(source)
    local player = Players:get(source)
    if not player then return fail('Player not found') end
    local partyId = Group.getPlayerPartyId(player.citizenid)
    if not partyId then return fail('Party not found') end
    return Group.disbandParty(source, partyId, player.citizenid)
end)

lib.callback.register('bs_groupsystem:server:updateTasks', function(source, data)
    local player = Players:get(source)
    if not player then return fail('Player not found') end
    local partyId = Group.getPlayerPartyId(player.citizenid)
    if not partyId then return fail('Party not found') end
    if not Group.isPartyLeader(partyId, player.citizenid) then return fail('Leader only') end

    local result = Group.updatePartyTasks(partyId, data.tasks)
    if result.status then result.group = Group.getPartyById(partyId) end
    return result
end)

lib.callback.register('bs_groupsystem:server:getNearbyPlayers', function(source)
    local coords = GetEntityCoords(GetPlayerPed(source))
    local players = {}
    for _, targetSrc in ipairs(GetPlayers()) do
        local targetSrcNum = tonumber(targetSrc)
        if targetSrcNum and targetSrcNum ~= source then
            local targetCoords = GetEntityCoords(GetPlayerPed(targetSrcNum))
            if #(coords - targetCoords) < 15.0 then
                local target = Players:get(targetSrcNum)
                if target then
                    players[#players + 1] = {
                        source = targetSrcNum, name = target.name, citizenid = target.citizenid,
                    }
                end
            end
        end
    end
    return players
end)

lib.callback.register('bs_groupsystem:server:invitePlayer', function(source, data)
    local targetSource = tonumber(data.targetSource)
    if not targetSource then return fail('Invalid target player') end

    local player = Players:get(source)
    local target = Players:get(targetSource)
    if not target then return fail('Player is not online') end

    local partyId = Group.getPlayerPartyId(player.citizenid)
    if not partyId then return fail('You are not in a group') end

    local party = Group.getPartyById(partyId)
    if party.leader ~= player.citizenid then return fail('Only the leader can invite') end
    if #party.members >= party.maxMembers then return fail('Group is full') end
    if Group.getPlayerPartyId(target.citizenid) then return fail('Player is already in a group') end

    local response = lib.callback.await('bs_groupsystem:client:receiveConfirmationPopup', targetSource, {
        icon = 'fa-solid fa-users',
        title = 'Group Invitation',
        description = ('%s invited you to join their group: %s'):format(player.name, party.name),
    })

    if not (response and response.status) then return fail('Invitation declined') end

    local result = Group.addPlayerToParty(partyId, target.citizenid, target.name)
    if not result.status then return result end

    Group.updatePartyData(party.members, 'refreshParties')
    TriggerClientEvent('bs_groupsystem:client:updatePhoneData', targetSource, {
        app = 'party', action = 'joinParty', partyId = partyId,
    })
    return { status = true, msg = 'Invitation accepted', group = party }
end)
