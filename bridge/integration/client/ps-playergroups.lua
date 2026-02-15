if (GetResourceState('ps-playergroups') ~= 'started') then return end

--- Exports a function to ps-playergroups.
---@param name string
---@param cb function
local function exportHandler(name, cb)
    AddEventHandler(('__cfx_export_ps-playergroups_%s'):format(name), function(setCB)
        setCB(cb)
    end)
end

--- Returns the client's current job stage (job name or false).
--- ps-playergroups reads this from the group's job status.
---@return string|false jobStage
exportHandler('GetJobStage', function()
    local partyData = LocalPlayer.state.partyData
    if not partyData or not partyData.inParty then return false end
    return partyData.currentJob or false
end)

--- Returns the client's current group ID.
--- Returns 0 if the player is not in any group.
---@return number groupID
exportHandler('GetGroupID', function()
    return lib.callback.await('bs_groupsystem:compat:getGroupID', false)
end)

--- Returns whether the client is the leader of their current group.
---@return boolean isLeader
exportHandler('IsGroupLeader', function()
    return lib.callback.await('bs_groupsystem:compat:isGroupLeader', false)
end)
