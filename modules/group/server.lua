---@class GroupServer
Group = {}

---@type table<string, PartyJob>
local partyJobs = {}

---@type table<number, Party>
local parties = {}

--- Timestamp before which new parties cannot be created.
local partyUnlockTime = os.time() + (Config.StartingPartyCooldown * 60)

--- Builds a standard failure result.
---@param msg string
---@return Result
local function fail(msg)
    return { status = false, msg = msg }
end

--- Builds a standard success result.
---@param msg? string
---@return Result
local function ok(msg)
    return { status = true, msg = msg }
end

--- Broadcasts the full party list to everyone, so idle players see updated slots.
local function broadcastPartyList()
    TriggerClientEvent('bs_groupsystem:client:updatePhoneData', -1, {
        app = 'party',
        action = 'refreshParties',
        data = parties,
    })
end

--- Updates the shared state bag for every online member of a party.
---@param party Party
---@param inParty boolean
local function syncMemberState(party, inParty)
    for _, member in ipairs(party.members) do
        local player = Players:get(member.citizenid)
        if player then
            Player(player.source).state:set('partyData', {
                inParty = inParty,
                currentJob = inParty and (party.currentJob or false) or false,
            }, true)
        end
    end
end

--- Finds a member's array index within a party.
---@param party Party
---@param citizenid string
---@return number|nil
local function memberIndex(party, citizenid)
    for i, member in ipairs(party.members) do
        if member.citizenid == citizenid then return i end
    end
    return nil
end

--- Generates a unique six digit party id.
---@return number
local function generatePartyId()
    local id
    repeat
        id = math.random(100000, 999999)
    until not parties[id]
    return id
end

--- Checks whether a party name is free (case insensitive).
---@param name string
---@return boolean
local function isPartyNameUnique(name)
    local target = name:lower()
    for _, party in pairs(parties) do
        if party.name:lower() == target then return false end
    end
    return true
end

--- Detaches a member, clearing their state and notifying them. No permission check.
---@param party Party
---@param partyId number
---@param citizenid string
---@return PartyMember|nil removed
local function detachMember(party, partyId, citizenid)
    local index = memberIndex(party, citizenid)
    if not index then return nil end

    local member = table.remove(party.members, index)
    local player = Players:get(citizenid)
    if player then
        local source = player.source
        TriggerClientEvent('bs_groupsystem:client:updatePhoneData', source, {
            app = 'party', action = 'backToParties', data = parties,
        })
        Player(source).state:set('partyData', { inParty = false, currentJob = false }, true)
        TriggerEvent('bs_groupsystem:server:leftParty', source, {
            partyId = partyId, currentJob = party.currentJob,
        })
    end
    return member
end

--- Pushes party data to every member's phone/app.
---@param members PartyMember[] Members to notify.
---@param action string UI action (refreshParties, refreshTasksDetail, backToParties).
---@param tasks? PartyTask[] Task list, only used by refreshTasksDetail.
function Group.updatePartyData(members, action, tasks)
    for _, member in ipairs(members) do
        local player = Players:get(member.citizenid)
        if player then
            local data = { app = 'party', action = action, data = parties }
            if action == 'refreshTasksDetail' then data.tasks = tasks end
            TriggerClientEvent('bs_groupsystem:client:updatePhoneData', player.source, data)
        end
    end
end

--- Sends an ox_lib notification to every member of a party.
---@param partyId number
---@param data Notify
---@return Result
function Group.sendPartyNotification(partyId, data)
    local party = parties[partyId]
    if not party then return fail(locale('party_invalid_id')) end
    for _, member in ipairs(party.members) do
        local player = Players:get(member.citizenid)
        if player then
            TriggerClientEvent('bs_groupsystem:client:notification', player.source, data)
        end
    end
    return ok()
end
exports('sendPartyNotification', Group.sendPartyNotification)

--- Returns the party id a player belongs to.
---@param citizenid string
---@return number|false
function Group.getPlayerPartyId(citizenid)
    for partyId, party in pairs(parties) do
        if memberIndex(party, citizenid) then return partyId end
    end
    return false
end
exports('getPlayerPartyId', Group.getPlayerPartyId)

--- Returns a party by its id.
---@param partyId number
---@return Party|nil
function Group.getPartyById(partyId)
    return parties[partyId]
end
exports('getPartyById', Group.getPartyById)

--- Returns the full map of active parties, keyed by party id.
---@return table<number, Party>
function Group.getAllParties()
    return parties
end

--- Returns the members of a party.
---@param partyId number
---@return PartyMember[]|false
function Group.getPartyMembers(partyId)
    local party = parties[partyId]
    if not party then return false end
    return party.members
end
exports('getPartyMembers', Group.getPartyMembers)

--- Returns the citizen id of the party leader, if online.
---@param partyId number
---@return string|false
function Group.getPartyLeader(partyId)
    local party = parties[partyId]
    if not party then return false end
    local player = Players:get(party.leader)
    if not player then return false end
    return player.citizenid
end
exports('getPartyLeader', Group.getPartyLeader)

--- Checks whether a player is the leader of a party.
---@param partyId number
---@param citizenid string
---@return boolean
function Group.isPartyLeader(partyId, citizenid)
    local party = parties[partyId]
    if not party then return false end
    return party.leader == citizenid
end
exports('isPartyLeader', Group.isPartyLeader)

--- Returns the number of members in a party.
---@param partyId number
---@return number|false
function Group.getPartySize(partyId)
    local party = parties[partyId]
    if not party then return false end
    return #party.members
end
exports('getPartySize', Group.getPartySize)

--- Returns the party's active job.
---@param partyId number
---@return string|false|Result
function Group.getPartyJob(partyId)
    local party = parties[partyId]
    if not party then return fail(locale('party_invalid_id')) end
    return party.currentJob
end
exports('getPartyJob', Group.getPartyJob)

--- Returns the party's type (legal or illegal).
---@param partyId number
---@return PartyType|Result
function Group.getPartyType(partyId)
    local party = parties[partyId]
    if not party then return fail(locale('party_invalid_id')) end
    return party.partyType
end
exports('getPartyType', Group.getPartyType)

--- Checks whether every member of a party can access illegal jobs.
---@param partyId number
---@return boolean
function Group.hasPartyShadowMod(partyId)
    local party = parties[partyId]
    if not party then return false end
    for _, member in ipairs(party.members) do
        local player = Players:get(member.citizenid)
        if player and not CanSeeIllegalParties(player.source) then
            return false
        end
    end
    return true
end
exports('hasPartyShadowMod', Group.hasPartyShadowMod)

--- Checks whether a job still has free party slots.
---@param job string
---@return boolean
function Group.canJoinParty(job)
    local limit = partyJobs[job].size
    if limit == -1 then return true end
    local count = 0
    for _, party in pairs(parties) do
        if party.currentJob == job then count = count + 1 end
    end
    return count < limit
end
exports('canJoinParty', Group.canJoinParty)

--- Assigns a registered job to a party.
---@param partyId number
---@param job string
---@return Result
function Group.setPartyJob(partyId, job)
    local party = parties[partyId]
    if not party then return fail(locale('party_invalid_id')) end
    if not Group.canJoinParty(job) then return fail(locale('party_enough_people')) end
    if party.currentJob and party.currentJob ~= job then return fail(locale('party_already_hasjob')) end
    if partyJobs[job].type == 'illegal' and not Group.hasPartyShadowMod(partyId) then
        return fail(locale('party_certain_mems_req'))
    end

    party.currentJob = job
    party.icon = partyJobs[job].icon
    party.partyType = partyJobs[job].type or 'legal'
    syncMemberState(party, true)
    Group.updatePartyData(party.members, 'refreshParties')
    SendLog(nil, 'party', 'partyData', json.encode(party))
    return ok()
end
exports('setPartyJob', Group.setPartyJob)

--- Offers a job to the party leader, who accepts or declines it from the UI.
--- Returns immediately; only one pending offer is allowed at a time.
---@param partyId number
---@param job string
---@param opts? JobOfferOptions Display overrides for the offer dialog.
---@return Result
function Group.sendJob(partyId, job, opts)
    opts = opts or {}
    local party = parties[partyId]
    if not party then return fail(locale('party_invalid_id')) end
    if not partyJobs[job] then return fail('Invalid job') end
    if party.currentJob and party.currentJob ~= job then return fail(locale('party_already_hasjob')) end
    if party.jobOffer then return fail('Group already has a pending job offer') end

    local leaderId = Group.getPartyLeader(partyId)
    if not leaderId then return fail(locale('player_not_online')) end

    party.jobOffer = {
        job = job,
        title = opts.title or 'Job Offer',
        description = opts.description or ('Your group has been offered the job: %s'):format(job),
        icon = opts.icon or partyJobs[job].icon,
        confirmLabel = opts.confirmLabel,
        cancelLabel = opts.cancelLabel,
    }
    Group.updatePartyData(party.members, 'refreshParties')

    local leader = Players:get(leaderId)
    if leader then
        TriggerClientEvent('bs_groupsystem:client:notification', leader.source, {
            type = 'info',
            title = party.jobOffer.title,
            description = party.jobOffer.description,
            icon = 'fa-solid fa-briefcase',
        })
    end

    return ok('Job offer sent to group leader')
end
exports('sendJob', Group.sendJob)

--- Resolves a party's pending job offer. Only the leader may respond.
--- Accepting assigns the job via setPartyJob; declining just clears the offer.
---@param partyId number
---@param citizenid string The responding player's citizen id.
---@param accept boolean
---@return Result
function Group.resolveJobOffer(partyId, citizenid, accept)
    local party = parties[partyId]
    if not party then return fail(locale('party_invalid_id')) end
    if not party.jobOffer then return fail('No pending job offer') end
    if party.leader ~= citizenid then return fail('Only the leader can respond to job offers') end

    local job = party.jobOffer.job
    party.jobOffer = nil

    if not accept then
        Group.updatePartyData(party.members, 'refreshParties')
        TriggerEvent('bs_groupsystem:server:jobOfferResolved', partyId, job, false)
        return ok('Job offer declined')
    end

    local result = Group.setPartyJob(partyId, job)
    -- setPartyJob syncs on success; on failure still clear the offer in the UI.
    if not result.status then 
        Group.updatePartyData(party.members, 'refreshParties') 
        TriggerEvent('bs_groupsystem:server:jobOfferResolved', partyId, job, false)
    else
        TriggerEvent('bs_groupsystem:server:jobOfferResolved', partyId, job, true)
    end
    return result
end
exports('resolveJobOffer', Group.resolveJobOffer)

--- Replaces a party's task list and notifies everyone.
---@param partyId number
---@param tasks PartyTask[]
---@return Result
function Group.updatePartyTasks(partyId, tasks)
    local party = parties[partyId]
    if not party then return fail(locale('party_invalid_id')) end
    party.partyTasks = tasks
    Group.updatePartyData(party.members, 'refreshTasksDetail', party.partyTasks)
    broadcastPartyList()
    return ok()
end
exports('updatePartyTasks', Group.updatePartyTasks)

--- Registers a job that parties can take on.
---@param data JobRegistration
---@return boolean registered False if the job already exists.
function Group.registerJob(data)
    if partyJobs[data.name] then return false end
    partyJobs[data.name] = {
        icon = data.icon or 'fa-solid fa-people-group',
        size = data.size or -1,
        type = data.type or 'legal',
    }
    return true
end
exports('registerJob', Group.registerJob)

--- Runs a callback for every member of a party.
---@param partyId number
---@param cb fun(playerId: number|nil, citizenId: string|nil)
function Group.sendToPartyMembers(partyId, cb)
    local members = Group.getPartyMembers(partyId)
    if not members then return cb(nil, nil) end
    for _, member in ipairs(members) do
        local player = Players:get(member.citizenid)
        cb(player and player.source or nil, member.citizenid)
    end
end
exports('sendToPartyMembers', Group.sendToPartyMembers)

--- Creates a party led by the given player.
---@param source number
---@param partyName string
---@param maxMembers? number
---@param joinType? JoinType
---@return Result
function Group.createParty(source, partyName, maxMembers, joinType)
    if partyUnlockTime > os.time() then return fail(locale('party_nojobs_yet')) end
    local player = Players:get(source)
    if not player then return fail(locale('player_not_online')) end
    if Group.getPlayerPartyId(player.citizenid) then return fail(locale('party_already_inparty')) end
    if not isPartyNameUnique(partyName) then return fail(locale('party_name_taken')) end

    local partyId = generatePartyId()
    parties[partyId] = {
        members = { { citizenid = player.citizenid, name = player.name } },
        leader = player.citizenid,
        name = partyName,
        maxMembers = maxMembers or 6,
        joinType = joinType or 'Request to Join',
        icon = 'fa-solid fa-people-group',
        currentJob = false,
        partyType = 'legal',
        partyTasks = {},
        requests = {},
    }

    Player(source).state:set('partyData', { inParty = true, currentJob = false }, true)
    SendLog(source, 'party', 'partyCreated', json.encode(parties[partyId]))
    broadcastPartyList()
    return ok(locale('party_created'))
end
exports('createParty', Group.createParty)

--- Adds a player to a party.
---@param partyId number
---@param citizenid string
---@param name string
---@return Result
function Group.addPlayerToParty(partyId, citizenid, name)
    local party = parties[partyId]
    if not party then return fail(locale('party_invalid_id')) end
    if Group.getPlayerPartyId(citizenid) then return fail(locale('party_already_inparty')) end

    party.members[#party.members + 1] = { citizenid = citizenid, name = name }
    local player = Players:get(citizenid)
    if player then
        Player(player.source).state:set('partyData', {
            inParty = true,
            currentJob = party.currentJob or false,
        }, true)
    end
    Group.updatePartyData(party.members, 'refreshTasksDetail', party.partyTasks)
    return ok(locale('party_added_member', name))
end

--- Kicks a member from a party. Only the leader may do this.
---@param partyId number
---@param citizenid string Member to remove.
---@param sourceCitizenId string Player performing the kick.
---@return Result
function Group.kickPlayerFromParty(partyId, citizenid, sourceCitizenId)
    local party = parties[partyId]
    if not party then return fail(locale('party_invalid_id')) end
    if not Group.getPlayerPartyId(sourceCitizenId) then return fail(locale('party_not_inany_group')) end
    if not Group.getPlayerPartyId(citizenid) then return fail(locale('party_not_inany_group_error')) end
    if not Group.isPartyLeader(partyId, sourceCitizenId) then return fail(locale('party_leader_restricted')) end
    if citizenid == sourceCitizenId then return fail(locale('party_cannot_kickself')) end
    if not Config.AllowLeavePartyDuringJob and party.currentJob then
        return fail(locale('party_cannot_kick_jobactive'))
    end

    local index = memberIndex(party, citizenid)
    if not index then return fail(locale('party_was_notfound')) end

    local name = party.members[index].name
    Group.sendPartyNotification(partyId, {
        icon = locale('party_notify_icon'), title = locale('party_notify_title'),
        description = locale('party_was_kicked', name),
    })
    detachMember(party, partyId, citizenid)
    Group.updatePartyData(party.members, 'refreshTasksDetail', party.partyTasks)
    return ok(locale('party_was_kicked_inform'))
end

--- Removes a player from their party voluntarily. The leader cannot leave.
---@param partyId number
---@param citizenid string
---@return Result
function Group.removePlayerFromParty(partyId, citizenid)
    local party = parties[partyId]
    if not Group.getPlayerPartyId(citizenid) then return fail(locale('party_not_inany_group')) end
    if Group.isPartyLeader(partyId, citizenid) then return fail(locale('party_leader_cannot_leave')) end

    local index = memberIndex(party, citizenid)
    if not index then return fail(locale('party_was_notfound')) end

    local name = party.members[index].name
    Group.sendPartyNotification(partyId, {
        icon = locale('party_notify_icon'), title = locale('party_notify_title'),
        description = locale('party_left_party', name),
    })
    detachMember(party, partyId, citizenid)
    Group.updatePartyData(party.members, 'refreshTasksDetail', party.partyTasks)
    return ok(locale('party_was_removed'))
end

--- Disbands a party. Only the leader may do this.
---@param src number|nil Source of the requester, if any.
---@param partyId number
---@param sourceCitizenId string
---@return Result
function Group.disbandParty(src, partyId, sourceCitizenId)
    if not Group.isPartyLeader(partyId, sourceCitizenId) then return fail(locale('party_leader_restricted')) end
    local party = parties[partyId]

    Group.sendPartyNotification(partyId, {
        icon = locale('party_notify_icon'), title = locale('party_notify_title'),
        description = locale('party_disband_byleader'),
    })
    for _, member in ipairs(party.members) do
        local player = Players:get(member.citizenid)
        if player then
            Player(player.source).state:set('partyData', { inParty = false, currentJob = false }, true)
            TriggerEvent('bs_groupsystem:server:leftParty', player.source, {
                partyId = partyId, currentJob = party.currentJob,
            })
        end
    end

    Group.updatePartyData(party.members, 'backToParties')
    SendLog(src, 'party', 'partyDisbanned', json.encode(party))
    parties[partyId] = nil
    broadcastPartyList()
    if src then TriggerEvent('bs_groupsystem:server:disbandParty', src, partyId) end
    return ok(locale('party_was_disband'))
end
exports('disbandParty', Group.disbandParty)

--- Hands leadership to the next member, removing the current leader.
---@param partyId number
---@param droppedCitizenId string
---@return Result|nil
function Group.changeLeader(partyId, droppedCitizenId)
    if not Group.isPartyLeader(partyId, droppedCitizenId) then return fail(locale('party_leader_restricted')) end
    local party = parties[partyId]

    local index = memberIndex(party, droppedCitizenId)
    if index then table.remove(party.members, index) end

    local newLeader = party.members[1]
    party.leader = newLeader.citizenid
    Group.sendPartyNotification(partyId, {
        icon = locale('party_notify_icon'), title = locale('party_notify_title'),
        description = ('%s is now the party leader'):format(newLeader.name),
    })
    Group.updatePartyData(party.members, 'refreshTasksDetail', party.partyTasks)
    SendLog(nil, 'party', 'partyLeaderChange',
        ('%s changed to %s for party: %s'):format(droppedCitizenId, newLeader.citizenid, partyId))
end

--- Handles a player who failed to reconnect in time.
---@param citizenid string
function Group.timedOutPlayer(citizenid)
    if Players:get(citizenid) then return end
    local partyId = Group.getPlayerPartyId(citizenid)
    if not partyId then return end

    if Group.isPartyLeader(partyId, citizenid) then
        if Group.getPartySize(partyId) > 1 then
            Group.changeLeader(partyId, citizenid)
        else
            Group.disbandParty(nil, partyId, citizenid)
            SendLog(nil, 'party', 'partyTimedOut', citizenid .. ' was timedout and party was disbanded')
        end
    else
        Group.removePlayerFromParty(partyId, citizenid)
        SendLog(nil, 'party', 'partyTimedOut', citizenid .. ' was timedout and was removed from party')
    end
end

--- Restores a player's party state after they (re)connect.
RegisterNetEvent('bs_groupsystem:server:initialised', function(player)
    local partyId = Group.getPlayerPartyId(player.citizenid)
    if not partyId then return end

    local party = parties[partyId]
    local currentJob = party.currentJob or false
    Player(player.source).state:set('partyData', { inParty = true, currentJob = currentJob }, true)
    TriggerEvent('bs_groupsystem:server:resumePendingJobs', player.source, {
        citizenid = player.citizenid, partyId = partyId, currentJob = currentJob,
    })
    SendLog(player.source, 'party', 'partyResumed', json.encode(party))
end)

--- Starts the reconnect grace period when a member disconnects.
AddEventHandler('playerDropped', function()
    local player = Players:get(source)
    if not player then return end
    local partyId = Group.getPlayerPartyId(player.citizenid)
    if not partyId then return end
    SetTimeout(Config.PartyTimeout, function()
        Group.timedOutPlayer(player.citizenid)
    end)
end)
