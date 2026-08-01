--- Exports a function to bd-groups.
---@param name string
---@param cb function
local function exportHandler(name, cb)
    AddEventHandler(('__cfx_export_bd-groups_%s'):format(name), function(setCB)
        setCB(cb)
    end)
end

--- Returns the active task/job for the player's group.
--- Returns "WAITING" if no job is active.
---@return string jobStage
exportHandler('GetJobStage', function()
    return lib.callback.await('bs_groupsystem:compat:bd:getJobStage', false)
end)

--- Returns the group ID of the player's active group.
--- Returns -1 if the player is not in any group.
---@return number groupId
exportHandler('GetGroupId', function()
    return lib.callback.await('bs_groupsystem:compat:bd:getGroupId', false)
end)

--- Returns whether the player is the leader of their active group.
---@return boolean isLeader
exportHandler('IsGroupLeader', function()
    return lib.callback.await('bs_groupsystem:compat:bd:isGroupLeader', false)
end)
