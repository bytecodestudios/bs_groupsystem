if (GetResourceState('es_extended') ~= "started") then return end

ESX = exports["es_extended"]:getSharedObject()

function HasAdmin(source)
    return IsPlayerAceAllowed(source, 'command')
end

RegisterNetEvent('esx:playerLoaded', function(_, xPlayer, _)
    local source = xPlayer.source
    local _data = {
        source = source,
        citizenid = xPlayer.identifier,
        name = xPlayer.name
    }
    Players:set(source, _data)
    TriggerEvent('phone:server:initialised', _data)
end)

RegisterNetEvent('esx:playerDropped', function(playerId, _)
    local player = Players:get(playerId)
    if player then
        Players:clear(playerId)
        TriggerEvent('phone:server:terminated', player)
    end
end)

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    Wait(1000)
    for _, src in pairs(ESX.GetPlayers()) do
        local xPlayer = ESX.GetPlayerFromId(src)
        if xPlayer then
            local source = xPlayer.source
            local _data = {
                source = source,
                citizenid = xPlayer.identifier,
                name = xPlayer.name
            }
            Players:set(source, _data)
            TriggerEvent('phone:server:initialised', _data)
        end
	end
end)