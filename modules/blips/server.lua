--- Creates a blip shown to every party member.
---@param partyId number
---@param blipName string
---@param blipData GroupBlipData
function Group.createPartyBlip(partyId, blipName, blipData)
    Group.sendToPartyMembers(partyId, function(playerId)
        if playerId then
            TriggerClientEvent('bs_groupsystem:client:party:createBlip', playerId, blipName, blipData)
        end
    end)
end
exports('createPartyBlip', Group.createPartyBlip)

--- Removes a named blip from every party member.
---@param partyId number
---@param blipName string
function Group.removePartyBlip(partyId, blipName)
    Group.sendToPartyMembers(partyId, function(playerId)
        if playerId then
            TriggerClientEvent('bs_groupsystem:client:party:removeBlip', playerId, blipName)
        end
    end)
end
exports('removePartyBlip', Group.removePartyBlip)

--- Removes every blip from all party members.
---@param partyId number
function Group.removeAllPartyBlips(partyId)
    Group.sendToPartyMembers(partyId, function(playerId)
        if playerId then
            TriggerClientEvent('bs_groupsystem:client:party:removeAllBlips', playerId)
        end
    end)
end
exports('removeAllPartyBlips', Group.removeAllPartyBlips)
