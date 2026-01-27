if (GetResourceState('ox_core') ~= "started") then return end

local Ox = require '@ox_core.lib.init'

function HasAdmin(source)
    local Player = Ox.GetPlayer(source)
    return IsPlayerAceAllowed(source, 'command') or (Player and Player.hasPermission('group.admin'))
end

RegisterNetEvent('ox:playerLoaded', function(playerId, userId, charId)
    local Player = Ox.GetPlayerFromUserId(userId)
    local _data = {
        source = playerId,
        citizenid = userId,
        name = ('%s %s'):format(Player.get('firstName'), Player.get('lastName')),
    }
    Players:set(source, _data)
    TriggerEvent('phone:server:initialised', _data)
end)

RegisterNetEvent('ox:playerLogout', function(playerId, userId, charId)
    local player = Players:get(playerId)
    if player then
        Players:clear(playerId)
        TriggerEvent('phone:server:terminated', player)
    end
end)

AddEventHandler('playerDropped', function()
    local playerId = source
    local player = Players:get(playerId)
    if player then
        Players:clear(playerId)
        TriggerEvent('phone:server:terminated', player)
    end
end)

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    Wait(1000)
    for _, Player in pairs(Ox.GetPlayers()) do
		local source = Player.source
        local _data = {
            source = source,
            citizenid = Player.userId,
            name = ('%s %s'):format(Player.get('firstName'), Player.get('lastName')),
        }
        Players:set(source, _data)
        TriggerEvent('phone:server:initialised', _data)
	end
end)