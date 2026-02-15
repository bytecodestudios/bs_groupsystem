if (GetResourceState('ps-playergroups') ~= 'started') then return end

--- Returns the client's current job stage (job name or false).
--- ps-playergroups reads this from the group's job status.
---@return string|false jobStage
exports('GetJobStage', function()
    local partyData = LocalPlayer.state.partyData
    if not partyData or not partyData.inParty then return false end
    return partyData.currentJob or false
end)

--- Returns the client's current group ID.
--- Returns 0 if the player is not in any group (ps-playergroups convention).
---@return number groupID
exports('GetGroupID', function()
    return lib.callback.await('bs_groupsystem:compat:getGroupID', false)
end)

--- Returns whether the client is the leader of their current group.
---@return boolean isLeader
exports('IsGroupLeader', function()
    return lib.callback.await('bs_groupsystem:compat:isGroupLeader', false)
end)
