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

exportHandler('bd-groups', 'GetJobStage', function()
    return lib.callback.await('bs_groupsystem:compat:bd:getJobStage', false)
end)

exportHandler('bd-groups', 'GetGroupId', function()
    return lib.callback.await('bs_groupsystem:compat:bd:getGroupId', false)
end)

exportHandler('bd-groups', 'IsGroupLeader', function()
    return lib.callback.await('bs_groupsystem:compat:bd:isGroupLeader', false)
end)

-- ps-playergroups

exportHandler('ps-playergroups', 'GetJobStage', function()
    local partyData = LocalPlayer.state.partyData
    if not partyData or not partyData.inParty then return false end
    return partyData.currentJob or false
end)

exportHandler('ps-playergroups', 'GetGroupID', function()
    return lib.callback.await('bs_groupsystem:compat:getGroupID', false)
end)

exportHandler('ps-playergroups', 'IsGroupLeader', function()
    return lib.callback.await('bs_groupsystem:compat:isGroupLeader', false)
end)
