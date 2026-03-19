local partyJobs = {}
local parties = {
    -- [1] = {
    --     members = {{citizenid = 'citizenid', name = 'name'}},
    --     leader = 'citizenid',
    --     name = 'Test Party',
    --     currentJob = 'Test Job',
    --     icon = 'fa-solid fa-people-group',
    --     partyType = 'legal',
    --     partyTasks = {{name = 'Test Task 1', status = 'done'}, {name = 'Test Task 2', status = 'current'}, {name = 'Test Task 3', status = 'pending'}},
    -- }
}
local partyCreationTime = os.time() + (Config.StartingPartyCooldown * 60)


---Updates the party data of all the members of the party.
---@param members table List of all the members of the party.
---@param action string Action to perform. (refreshParties, refreshTasksDetail, backToParties)
---@param tasks? table List of all party tasks.
local function updatePartyData(members, action, tasks)
    for _, member in pairs(members) do
        local player = Players:get(member.citizenid)
        if player then
            local data = {app = 'party', action = action, data = parties}
            if action == 'refreshTasksDetail' then data.tasks = tasks end
            TriggerClientEvent('bs_groupsystem:client:updatePhoneData', player.source, data)
        end
    end
end

---Checks if the party exists by the given party id.
---@param partyId number Party id to check.
---@return table|nil exists Table if the party exists, otherwise nil.
local function doesPartyExist(partyId)
    return parties[partyId]
end

---Generates a random and unique party id.
---@return number partyId Random and unique party id.
local function generatePartyId()
    local partyId = math.random(100000, 999999)
    if doesPartyExist(partyId) then
        return generatePartyId()
    end
    return partyId
end

---This function checks if the party name is unique or not
---@param name string Party name to check.
---@return boolean isUnique True if the party name is unique, otherwise false.
local function isPartyNameUnique(name)
    for _, party in pairs(parties) do
        if (party.name):lower() == name:lower() then
            return false
        end
    end
    return true
end

---Send notification to all the party members using phone's popup.
---@param partyId number Party id of the player's joined party.
---@param data Notify Notification data.
---@return table status Status of the function.
local function sendPartyNotification(partyId, data)
    local party = parties[partyId]
    if not party then return {status = false, msg = locale('party_invalid_id')} end
    for _, member in pairs(party.members) do
        local player = Players:get(member.citizenid)
        if player then
            TriggerClientEvent('bs_groupsystem:client:notification', player.source, data)
        end
    end
    return {status = true}
end exports('sendPartyNotification', sendPartyNotification)

---Returns the party id of the player's party.
---To retrieve the party data use the getPartyById(partyId) function.
---@param citizenid string Citizen id of the player.
---@return false|number partyId Party id of the player's joined party. False if the player is not in a party.
local function getPlayerPartyId(citizenid)
    for partyId, party in pairs(parties) do
        for _, member in pairs(party.members) do
            if member.citizenid == citizenid then
                return partyId
            end
        end
    end
    return false
end exports('getPlayerPartyId', getPlayerPartyId)

---Returns the player's party if the player is in a party.
---@param partyId number Party id of the player's joined party.
---@return nil|table party Player's party. False if the player is not in a party.
local function getPartyById(partyId)
    return parties[partyId]
end exports('getPartyById', getPartyById)

---Returns the list of all the members that are inside the party.
---@param partyId number Party id of the player's joined party.
---@return false|table members List of all the members that are inside the party.
local function getPartyMembers(partyId)
    local party = parties[partyId]
    if not party then return false end
    return party.members
end exports('getPartyMembers', getPartyMembers)

---Returns the citizen id of the party leader.
---@param partyId number Party id of the player's joined party.
---@return false|string citizenid Citizen id of the party leader.
local function getPartyLeader(partyId)
    local party = parties[partyId]
    if not party then return false end
    local player = Players:get(party.leader)
    if not player then return false end
    return player.citizenid
end exports('getPartyLeader', getPartyLeader)

--Returns if the citizenid is the leader of the party.
---@param partyId number Party id to check.
---@param citizenid string Citizen id to check.
---@return boolean isLeader True if the citizenid is the leader of the party, otherwise false.
local function isPartyLeader(partyId, citizenid)
    local party = parties[partyId]
    if not party then return false end
    return party.leader == citizenid
end exports('isPartyLeader', isPartyLeader)

---Returns the number of players that are inside the party.
---@param partyId number Party id of the player's joined party.
---@return false|number size Number of players that are inside the party.
local function getPartySize(partyId)
    local party = parties[partyId]
    if not party then return false end
    return #party.members
end exports('getPartySize', getPartySize)

---Returns the party's current job.
---@param partyId number Party id of the player's joined party.
---@return string|table job Party's current job.
local function getPartyJob(partyId)
    local party = parties[partyId]
    if not party then return {status = false, msg = locale('party_invalid_id')} end
    return party.currentJob
end exports('getPartyJob', getPartyJob)

---Returns the party's type (legal, illegal).
---@param partyId number Party id of the player's joined party.
---@return string|table type Party's type.
local function getPartyType(partyId)
    local party = parties[partyId]
    if not party then return {status = false, msg = locale('party_invalid_id')} end
    return party.partyType
end exports('getPartyType', getPartyType)

---This function will check if all the party members have access to illegal party.
---@param partyId number Party id of the player's joined party.
---@return boolean toggle Returns true if all the party members have access to illegal party.
local function hasPartyShadowMod(partyId)
    local party = parties[partyId]
    if not party then return false end
    for _, member in pairs(party.members) do
        local player = Players:get(member.citizenid)
        if player then
            local hasShadowMod = CanSeeIllegalParties(player.source)
            if not hasShadowMod then return false end
        end
    end
    return true
end exports('hasPartyShadowMod', hasPartyShadowMod)

---Returns if you can join party or no
---@param job string Job Name
---@return boolean canJoin Can join the job if limit not reached
local function canJoinParty(job)
    local count = 0
    if partyJobs[job].size == -1 then return true end
    for _, v in pairs(parties) do
        if v.currentJob == job then
            count = count + 1
        end
    end
    return count < partyJobs[job].size
end exports('canJoinParty', canJoinParty)

---Set the party's current job to the newly passed job.
---@param partyId number Party id of the player's joined party.
---@param job string Job name.
---@return table status Status of the function.
local function setPartyJob(partyId, job)
    local party = parties[partyId]
    if not party then return {status = false, msg = locale('party_invalid_id')} end
    if not canJoinParty(job) then return {status = false, msg = locale('party_enough_people')} end
    if party.currentJob then return {status = false, msg = locale('party_already_hasjob')} end
    if partyJobs[job].type == 'illegal' and not hasPartyShadowMod(partyId) then return {status = false, msg = locale('party_certain_mems_req')} end
    party.currentJob = job
    party.icon = partyJobs[job].icon
    party.partyType = partyJobs[job].type or 'legal'
    for _, member in pairs(party.members) do
        local player = Players:get(member.citizenid)
        if player then
            Player(player.source).state:set('partyData', {inParty = true, currentJob = job}, true)
        end
    end
    updatePartyData(party.members, 'refreshParties')
    SendLog(nil, 'party', 'partyData', json.encode(party))
    return {status = true}
end exports('setPartyJob', setPartyJob)

---Triggers a callback function for each party member.
---@param partyId number Party id of the player's joined party.
---@param cb fun(playerId: number | nil, citizenId: string | nil) Callback to execute for each party member
local function sendToPartyMembers(partyId, cb)
    local members = getPartyMembers(partyId)
    if not members then return cb(nil, nil) end

    for _, member in ipairs(members) do
        local player = Players:get(member.citizenid)
        cb(player?.source, member.citizenid)
    end
end exports('sendToPartyMembers', sendToPartyMembers)

---Creates a blip visible to all party members
---@param partyId number Party id of the player's joined party.
---@param blipName string Player identifier
---@param blipData GroupBlipData Blip data
local function createPartyBlip(partyId, blipName, blipData)
    sendToPartyMembers(partyId, function(playerId)
        if playerId then
            TriggerClientEvent('bs_groupsystem:client:party:createBlip', playerId, blipName, blipData)
        end
    end)
end exports('createPartyBlip', createPartyBlip)

---Removes a blip from all party members' view
---@param partyId number Party id of the player's joined party.
---@param blipName string Blip name to remove
local function removePartyBlip(partyId, blipName)
    sendToPartyMembers(partyId, function(playerId)
        if playerId then
            TriggerClientEvent('bs_groupsystem:client:party:removeBlip', playerId, blipName)
        end
    end)
end exports('removePartyBlip', removePartyBlip)

---Removes all blips from all party members' view
---@param partyId number Party id of the player's joined party.
local function removeAllPartyBlips(partyId)
    sendToPartyMembers(partyId, function(playerId)
        if playerId then
            TriggerClientEvent('bs_groupsystem:client:party:removeAllBlips', playerId)
        end
    end)
end exports('removeAllPartyBlips', removeAllPartyBlips)

---Set the party's current tasks to the newly passed tasks.
---@param partyId number Party id of the player's joined party.
---@param tasks table List of all the tasks that the party need to complete.
---@return table status Status of the function.
local function updatePartyTasks(partyId, tasks)
    local party = parties[partyId]
    if not party then return {status = false, msg = locale('party_invalid_id')} end
    party.partyTasks = tasks
    updatePartyData(party.members, 'refreshTasksDetail', party.partyTasks)

    ---Handler for the jobs so that the last updated time of the task gets updated.
    -- Note: Not sure why was this there
    -- TriggerEvent('bs_groupsystem:server:taskUpdated', -1, {currentJob = party.currentJob, partyId = partyId, updatedTime = os.time()})

    ---This refreshes the party status for other people as well.
    ---This is needed because the party status is not updated for players that are not inside the party.
    ---For example to toggle the join party button.
    TriggerClientEvent('bs_groupsystem:client:updatePhoneData', -1, {app = 'party', action = 'refreshParties', data = parties})
    return {status = true}
end exports('updatePartyTasks', updatePartyTasks)

---Create a party for the player.
---@param source number Source of the player.
---@param partyName string Name of the party.
---@return table result Result table. This table will contain the status, msg.
local function createParty(source, partyName, maxMembers, joinType)
    if partyCreationTime > os.time() then return {status = false, msg = locale('party_nojobs_yet')} end
    local player = Players:get(source)
    if not player then return {status = false, msg = locale('player_not_online')} end
    local leader = player.citizenid
    if getPlayerPartyId(leader) then return {status = false, msg = locale('party_already_inparty')} end
    if not isPartyNameUnique(partyName) then return {status = false, msg = locale('party_name_taken')} end

    local partyId = generatePartyId()
    parties[partyId] = {
        members = {{citizenid = leader, name = player.name}},
        leader = leader,
        name = partyName,
        maxMembers = maxMembers or 6,
        joinType = joinType or 'Request to Join',
        icon = 'fa-solid fa-people-group',
        currentJob = false,
        partyType = 'legal',
        partyTasks = {},
        requests = {}
    }
    Player(source).state:set('partyData', {inParty = true, currentJob = false}, true)
    SendLog(source, 'party', 'partyCreated', json.encode(parties[partyId]))
    TriggerClientEvent('bs_groupsystem:client:updatePhoneData', -1, {app = 'party', action = 'refreshParties', data = parties})
    return {status = true, msg = locale('party_created')}
end exports('createParty', createParty)

---Register a job as partyJob for server.
---@param data table { name: job name, icon: icon to display in party app, size: max parties for this job, type: 'legal', 'illegal' }
---@return boolean status True if the job was registered successfully, otherwise false.
local function registerJob(data)
    if partyJobs[data.name] then return false end
    partyJobs[data.name] = {
        icon = data.icon or 'fa-solid fa-people-group',
        size = data.size or -1,
        type = data.type or 'legal'
    }
    return true
end exports('registerJob', registerJob)

---Add a player to the party.
---@param partyId number Party id of the player's joined party.
---@param citizenid string Citizen id of the player that needs to be added to the party.
---@param name string First name of the player that needs to be added to the party.
---@return table result Result table. This table will contain the status, msg fields.
local function addPlayerToParty(partyId, citizenid, name)
    local party = parties[partyId]
    if not party then return {status = false, msg = locale('party_invalid_id')} end
    if getPlayerPartyId(citizenid) then return {status = false, msg = locale('party_already_inparty')} end
    local source = Players:get(citizenid)?.source
    party.members[#party.members + 1] = {citizenid = citizenid, name = name}
    Player(source).state:set('partyData', {inParty = true, currentJob = party.currentJob or false}, true)
    updatePartyData(party.members, 'refreshTasksDetail', party.partyTasks)
    return {status = true, msg = locale('party_added_member', name)}
end

---Kick a player from the party. This action will only work if the sourceCitizenId is the leader of the party.
---@param partyId number Party id of the player's joined party.
---@param citizenid string Citizen id of the player that needs to be removed from the party.
---@param sourceCitizenId string Citizen id of the player that is removing the player from the party. This is only needed if the player is getting kicked from the party.
---@return table result Result table. This table will contain the status and msg fields.
local function kickPlayerFromParty(partyId, citizenid, sourceCitizenId)
    local party = parties[partyId]
    if not party then return {status = false, msg = locale('party_invalid_id')} end
    if not getPlayerPartyId(sourceCitizenId) then return {status = false, msg = locale('party_not_inany_group')} end
    if not getPlayerPartyId(citizenid) then return {status = false, msg = locale('party_not_inany_group_error')} end
    if not isPartyLeader(partyId, sourceCitizenId) then return {status = false, msg = locale('party_leader_restricted')} end
    if citizenid == sourceCitizenId then return {status = false, msg = locale('party_cannot_kickself')} end
    if not Config.AllowLeavePartyDuringJob and party.currentJob then return {status = false, msg = locale('party_cannot_kick_jobactive')} end
    for _, member in pairs(party.members) do
        if member.citizenid == citizenid then
            local player = Players:get(member.citizenid)
            sendPartyNotification(partyId, {icon = locale('party_notify_icon'), title = locale('party_notify_title'), description = locale('party_was_kicked', member.name)})
            table.remove(party.members, _)
            if player then
                local source = player.source
                TriggerClientEvent('bs_groupsystem:client:updatePhoneData', source, {app = 'party', action = 'backToParties', data = parties})
                Player(source).state:set('partyData', {inParty = false, currentJob = false}, true)
                TriggerEvent('bs_groupsystem:server:leftParty', source, { partyId = partyId, currentJob = party.currentJob })
            end
            updatePartyData(party.members, 'refreshTasksDetail', party.partyTasks)
            return {status = true, msg = locale('party_was_kicked_inform')}
        end
    end
    return {status = false, msg = locale('party_was_notfound')}
end

---Remove a player from the party.
---@param partyId number Party id of the player's joined party.
---@param citizenid string Citizen id of the player that needs to be removed from the party.
---@return table result Result table. This table will contain the status and msg fields which will tell us if the player was removed from the party or not.
local function removePlayerFromParty(partyId, citizenid)
    local party = parties[partyId]
    if not getPlayerPartyId(citizenid) then return {status = false, msg = locale('party_not_inany_group')} end
    if isPartyLeader(partyId, citizenid) then return {status = false, msg = locale('party_leader_cannot_leave')} end
    for _, member in pairs(party.members) do
        if member.citizenid == citizenid then
            local player = Players:get(member.citizenid)
            sendPartyNotification(partyId, {icon = locale('party_notify_icon'), title = locale('party_notify_title'), description = locale('party_left_party', member.name)})
            table.remove(party.members, _)
            if player then
                local source = player.source
                TriggerClientEvent('bs_groupsystem:client:updatePhoneData', source, {app = 'party', action = 'backToParties', data = parties})
                Player(source).state:set('partyData', {inParty = false, currentJob = false}, true)
                TriggerEvent('bs_groupsystem:server:leftParty', player.source, { partyId = partyId, currentJob = party.currentJob })
            end
            updatePartyData(party.members, 'refreshTasksDetail', party.partyTasks)
            return {status = true, msg = locale('party_was_removed')}
        end
    end
    return {status = false, msg = locale('party_was_notfound')}
end

---Disband the party. This action will only work if the sourceCitizenId is the leader of the party.
---@param src number|nil Source of the player that is trying to disband the party.
---@param partyId number Party id of the player's joined party.
---@param sourceCitizenId string Citizen id of the player that is trying to disband the party.
---@return table result Result table. This table will contain the status and msg fields which will tell us if the party was disbanded or not.
local function disbandParty(src, partyId, sourceCitizenId)
    if not isPartyLeader(partyId, sourceCitizenId) then return {status = false, msg = locale('party_leader_restricted')} end
    sendPartyNotification(partyId, {icon = locale('party_notify_icon'), title = locale('party_notify_title'), description = locale('party_disband_byleader')})
    local party = parties[partyId]
    for _, member in pairs(party.members) do
        local player = Players:get(member.citizenid)
        if player then
            local source = player.source
            Player(source).state:set('partyData', {inParty = false, currentJob = false}, true)
            TriggerEvent('bs_groupsystem:server:leftParty', source, { partyId = partyId, currentJob = party.currentJob })
        end
    end
    updatePartyData(party.members, 'backToParties')
    SendLog(src, 'party', 'partyDisbanned', json.encode(party))
    parties[partyId] = nil
    TriggerClientEvent('bs_groupsystem:client:updatePhoneData', -1, {app = 'party', action = 'refreshParties', data = parties})
    if src then TriggerEvent('bs_groupsystem:server:disbandParty', src, partyId) end
    return {status = true, msg = locale('party_was_disband')}
end exports('disbandParty', disbandParty)

---Change the leader of the party. This action will only work if droppedCitizenId is the leader of the party.
---@param partyId number Party id of the player's joined party.
---@param droppedCitizenId string Citizen id of the player that is the leader of the party and needs to be changed.
local function changeLeader(partyId, droppedCitizenId)
    if not isPartyLeader(partyId, droppedCitizenId) then return {status = false, msg = locale('party_leader_restricted')} end
    local party = parties[partyId]
    for _, member in pairs(party.members) do
        if member.citizenid == droppedCitizenId then
            table.remove(party.members, _)
            break
        end
    end
    local newLeader = party.members[1]
    party.leader = newLeader.citizenid
    sendPartyNotification(partyId, {icon = locale('party_notify_icon'), title = locale('party_notify_title'), description = ('%s is now the party leader'):format(newLeader.name)})
    updatePartyData(party.members, 'refreshTasksDetail', party.partyTasks)
    SendLog(nil, 'party', 'partyLeaderChange', droppedCitizenId..' changed to '..newLeader.citizenid..' for party: '..partyId)
end

---This function will be called when a player fails to reconnect back to the server within the given time.
---@param citizenid string Citizen id of the player that failed to reconnect back to the server.
local function timedOutPlayer(citizenid)
    local player = Players:get(citizenid)
    if player then return end
    local partyId = getPlayerPartyId(citizenid)
    if not partyId then return end
    local isLeader = isPartyLeader(partyId, citizenid)
    if isLeader then
        local size = getPartySize(partyId)
        if size > 1 then changeLeader(partyId, citizenid)
        else disbandParty(nil, partyId, citizenid) SendLog(nil, 'party', 'partyTimedOut', citizenid..' was timedout and party was disbanded') end
    else removePlayerFromParty(partyId, citizenid) SendLog(nil, 'party', 'partyTimedOut', citizenid..' was timedout and was removed from party') end
end

RegisterNetEvent('bs_groupsystem:server:initialised', function(player)
    local src = player.source
    local citizenid = player.citizenid
    local partyId = getPlayerPartyId(citizenid)
    if not partyId then return end
    local dataToSet = {inParty = true, currentJob = parties[partyId].currentJob or false}
    Player(src).state:set('partyData', dataToSet, true)
    TriggerEvent('bs_groupsystem:server:resumePendingJobs', src, { citizenid = citizenid, partyId = partyId, currentJob = dataToSet.currentJob })
    SendLog(src, 'party', 'partyResumed', json.encode(parties[partyId]))
end)

AddEventHandler('playerDropped', function()
    local src = source
    local player = Players:get(src)
    if not player then return end
    local citizenid = player.citizenid
    local partyId = getPlayerPartyId(citizenid)
    if not partyId then return end
    SetTimeout(Config.PartyTimeout, function()
        timedOutPlayer(citizenid)
    end)
end)

lib.callback.register('bs_groupsystem:server:createParty', function(source, data)
    local src = source
    local result = createParty(src, data.partyName, data.maxMembers, data.joinType)
    return result
end)

lib.callback.register('bs_groupsystem:server:requestJoinGroup', function(source, data)
    local src = source
    local player = Players:get(src)
    if not player then return {status = false, msg = locale('player_not_online')} end
    local citizenid = player.citizenid
    local partyId = getPlayerPartyId(citizenid)
    if partyId then return {status = false, msg = locale('party_already_inparty')} end
    local targetPartyId = tonumber(data.partyId)
    if not targetPartyId then return {status = false, msg = locale('party_does_not_exist')} end
    local party = parties[targetPartyId]
    if not party then return {status = false, msg = locale('party_does_not_exist')} end
    if party.joinType == 'Invite Only' then return {status = false, msg = "This group is invite only"} end
    if party.joinType == 'Closed' then return {status = false, msg = "This group is closed"} end
    local name = player.name
    local dataToSend = {icon = locale('party_notify_icon'), description = locale('party_mem_wants_join_description', name), title = locale('party_mem_wants_join_title')}
    local leader = getPartyLeader(targetPartyId)
    if not leader then return {status = false, msg = locale('player_not_online')} end

    if party then
        party.requests = party.requests or {}
        local alreadyRequested = false
        for _, req in ipairs(party.requests) do
            if req.id == citizenid then alreadyRequested = true break end
        end
        if not alreadyRequested then
            table.insert(party.requests, {id = citizenid, name = name})
            updatePartyData(party.members, 'refreshParties')
        end
    end

    local leaderSrc = Players:get(leader)?.source
    if leaderSrc then
        TriggerClientEvent('bs_groupsystem:client:notification', leaderSrc, {
            type = 'info',
            title = locale('party_mem_wants_join_title'),
            description = locale('party_mem_wants_join_description', name),
            icon = 'fa-solid fa-bell'
        })
    end

    return {status = true, msg = "Join request sent to group leader"}
end)

lib.callback.register('bs_groupsystem:server:retrieveParties', function(_)
    return parties
end)

lib.callback.register('bs_groupsystem:server:fetchSingleGroup', function(source, groupId)
    local party = parties[tonumber(groupId)]
    if not party then return { status = false } end

    return { status = true, group = party }
end)

lib.callback.register('bs_groupsystem:server:getPlayerData', function(source)
    local player = Players:get(source)
    if not player then return nil end

    return {
        citizenid = player.citizenid,
        name = player.name,
        source = source
    }
end)

lib.callback.register('bs_groupsystem:server:promoteLeader', function(source, data)
    local partyId = tonumber(data.groupId)
    local party = parties[partyId]
    if not party then return nil end

    party.leader = data.newLeaderId

    updatePartyData(party.members, 'refreshParties')

    return party
end)

lib.callback.register('bs_groupsystem:server:processRequest', function(source, data)
    local partyId = tonumber(data.groupId)
    local party = parties[partyId]
    if not party then return { status = false, msg = "Group not found" } end

    if party.requests then
        for i, req in ipairs(party.requests) do
            if req.id == data.requestId then
                table.remove(party.requests, i)
                break
            end
        end
    end

    if data.action == 'accept' then
        if not partyId then return { status = false, msg = "Invalid party ID" } end
        local result = addPlayerToParty(partyId, data.requestId, data.requestName)
        if result.status then
            updatePartyData(party.members, 'refreshParties')
        end
        return { status = result.status, msg = result.msg, group = party }
    end

    updatePartyData(party.members, 'refreshParties')
    return { status = true, msg = "Request declined", group = party }
end)

lib.callback.register('bs_groupsystem:server:kickMember', function(source, data)
    local player = Players:get(source)
    if not player then return { status = false, msg = "Player not found" } end
    local targetCitizenid = data.memberId or data.citizenid
    local partyId = getPlayerPartyId(targetCitizenid)
    if not partyId then return { status = false, msg = "Party not found" } end
    local sourceCitizenId = player.citizenid
    local result = kickPlayerFromParty(partyId, targetCitizenid, sourceCitizenId)
    if result.status then
        result.group = parties[partyId]
    end
    return result
end)

lib.callback.register('bs_groupsystem:server:leaveParty', function(source)
    local player = Players:get(source)
    if not player then return { status = false, msg = "Player not found" } end
    local citizenid = player.citizenid
    local partyId = getPlayerPartyId(citizenid)
    if not partyId then return { status = false, msg = "Party not found" } end
    local result = removePlayerFromParty(partyId, citizenid)
    return result
end)

lib.callback.register('bs_groupsystem:server:requestDisbandParty', function(source)
    local player = Players:get(source)
    if not player then return { status = false, msg = "Player not found" } end
    local citizenid = player.citizenid
    local partyId = getPlayerPartyId(citizenid)
    if not partyId then return { status = false, msg = "Party not found" } end
    local result = disbandParty(source, partyId, citizenid)
    return result
end)

lib.callback.register('bs_groupsystem:server:updateTasks', function(source, data)
    local player = Players:get(source)
    if not player then return { status = false, msg = "Player not found" } end
    local citizenid = player.citizenid
    local partyId = getPlayerPartyId(citizenid)
    if not partyId then return { status = false, msg = "Party not found" } end

    if not isPartyLeader(partyId, citizenid) then
        return { status = false, msg = "Leader only" }
    end

    local result = updatePartyTasks(partyId, data.tasks)
    if result.status then
        result.group = parties[partyId]
    end
    return result
end)

lib.callback.register('bs_groupsystem:server:getNearbyPlayers', function(source)
    local src = source
    local coords = GetEntityCoords(GetPlayerPed(src))
    local players = {}
    local allPlayers = GetPlayers()
    for _, targetSrc in ipairs(allPlayers) do
        local targetSrcNum = tonumber(targetSrc)
        if targetSrcNum and targetSrcNum ~= src then
            local targetCoords = GetEntityCoords(GetPlayerPed(targetSrcNum))
            if #(coords - targetCoords) < 15.0 then
                local p = Players:get(targetSrcNum)
                if p then
                    table.insert(players, {
                        source = targetSrcNum,
                        name = p.name,
                        citizenid = p.citizenid
                    })
                end
            end
        end
    end
    return players
end)

lib.callback.register('bs_groupsystem:server:invitePlayer', function(source, data)
    local src = source
    local targetSource = tonumber(data.targetSource)
    if not targetSource then return { status = false, msg = "Invalid target player" } end
    local player = Players:get(src)
    local target = Players:get(targetSource)
    if not target then return { status = false, msg = "Player is not online" } end

    local partyId = getPlayerPartyId(player.citizenid)
    if not partyId then return { status = false, msg = "You are not in a group" } end

    local party = parties[partyId]
    if party.leader ~= player.citizenid then return { status = false, msg = "Only the leader can invite" } end
    if #party.members >= party.maxMembers then return { status = false, msg = "Group is full" } end
    if getPlayerPartyId(target.citizenid) then return { status = false, msg = "Player is already in a group" } end

    local dataToSend = {
        icon = 'fa-solid fa-users',
        title = "Group Invitation",
        description = ("%s invited you to join their group: %s"):format(player.name, party.name)
    }

    local response = lib.callback.await('bs_groupsystem:client:receiveConfirmationPopup', targetSource, dataToSend)
    if response and response.status then
        local result = addPlayerToParty(partyId, target.citizenid, target.name)
        if result.status then
            updatePartyData(party.members, 'refreshParties')
            TriggerClientEvent('bs_groupsystem:client:updatePhoneData', targetSource, {app = 'party', action = 'joinParty', partyId = partyId})
            return { status = true, msg = "Invitation accepted", group = party }
        end
        return result
    else
        return { status = false, msg = "Invitation declined" }
    end
end)
