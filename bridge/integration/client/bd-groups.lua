if (GetResourceState('bd-groups') ~= 'started') then return end

--- Returns the active task/job for the player's group.
--- Returns "WAITING" if no job is active (bd-groups convention).
---@return string jobStage
exports('GetJobStage', function()
    return lib.callback.await('bs_groupsystem:compat:bd:getJobStage', false)
end)

--- Returns the group ID of the player's active group.
--- Returns -1 if the player is not in any group (bd-groups convention).
---@return number groupId
exports('GetGroupId', function()
    return lib.callback.await('bs_groupsystem:compat:bd:getGroupId', false)
end)

--- Returns whether the player is the leader of their active group.
---@return boolean isLeader
exports('IsGroupLeader', function()
    return lib.callback.await('bs_groupsystem:compat:bd:isGroupLeader', false)
end)
