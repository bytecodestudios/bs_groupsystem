if (GetResourceState('qb-core') ~= "started") then return end

local QBCore = exports['qb-core']:GetCoreObject()

function HasAdmin(source)
    return IsPlayerAceAllowed(source, 'command') or QBCore.Functions.HasPermission(source, 'mod')
end

RegisterNetEvent('QBCore:Server:PlayerLoaded', function(Player)
    local source = Player.PlayerData.source
    local _data = {
        source = source,
        citizenid = Player.PlayerData.citizenid,
        name = ('%s %s'):format(Player.PlayerData.charinfo.firstname, Player.PlayerData.charinfo.lastname)
    }
    Players:set(source, _data)
    TriggerEvent('bs_groupsystem:server:initialised', _data)
end)

RegisterNetEvent('QBCore:Player:SetPlayerData', function(PlayerData)
    local source = PlayerData.source
    local _Player = Players:get(source)
    local name = ('%s %s'):format(PlayerData.charinfo.firstname, PlayerData.charinfo.lastname)

    if _Player and (_Player.name == name) then
        return
    end

    if _Player then
        TriggerEvent('bs_groupsystem:server:terminated', _Player)
        Wait(1500)
    end

    local _data = {
        source = source,
        citizenid = PlayerData.citizenid,
        name = name
    }
    Players:set(source, _data)
    TriggerEvent('bs_groupsystem:server:initialised', _data)
end)

RegisterNetEvent('QBCore:Server:OnPlayerUnload', function(source)
    local player = Players:get(source)
    if player then
        Players:clear(source)
        TriggerEvent('bs_groupsystem:server:terminated', player)
    end
end)

RegisterNetEvent('QBCore:Server:PlayerDropped', function(Ply)
    local source = Ply.PlayerData.source
    local player = Players:get(source)
    if player then
        Players:clear(source)
        TriggerEvent('bs_groupsystem:server:terminated', player)
    end
end)

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    Wait(1000)
    for _, Player in pairs(QBCore.Functions.GetQBPlayers()) do
		local source = Player.PlayerData.source
        local _data = {
            source = source,
            citizenid = Player.PlayerData.citizenid,
            name = ('%s %s'):format(Player.PlayerData.charinfo.firstname, Player.PlayerData.charinfo.lastname),
        }
        Players:set(source, _data)
        TriggerEvent('bs_groupsystem:server:initialised', _data)
	end
end)
