--- Stores a player and announces them to the group system.
---@param source number
---@param citizenid string
---@param name string
local function pushPlayer(source, citizenid, name)
    local data = { source = source, citizenid = citizenid, name = name }
    Players:set(source, data)
    TriggerEvent('bs_groupsystem:server:initialised', data)
end

--- Clears a player and announces their removal.
---@param source number
local function dropPlayer(source)
    local player = Players:get(source)
    if not player then return end
    Players:clear(source)
    TriggerEvent('bs_groupsystem:server:terminated', player)
end

if GetResourceState('qb-core') == 'started' or GetResourceState('qbx_core') == 'started' then
    local isQbox = GetResourceState('qbx_core') == 'started'
    local QBCore = not isQbox and exports['qb-core']:GetCoreObject() or nil

    local function nameOf(pd)
        return ('%s %s'):format(pd.charinfo.firstname, pd.charinfo.lastname)
    end

    function HasAdmin(source)
        if isQbox then
            return IsPlayerAceAllowed(source, 'command') or exports.qbx_core:HasPermission(source, 'mod')
        end
        return IsPlayerAceAllowed(source, 'command') or QBCore.Functions.HasPermission(source, 'mod')
    end

    RegisterNetEvent('QBCore:Server:PlayerLoaded', function(Player)
        pushPlayer(Player.PlayerData.source, Player.PlayerData.citizenid, nameOf(Player.PlayerData))
    end)

    RegisterNetEvent('QBCore:Player:SetPlayerData', function(PlayerData)
        local source = PlayerData.source
        local existing = Players:get(source)
        local name = nameOf(PlayerData)
        if existing and existing.name == name then return end
        if existing then
            TriggerEvent('bs_groupsystem:server:terminated', existing)
            if isQbox then TriggerClientEvent('bs_groupsystem:client:terminated', source) end
            Wait(1500)
        end
        pushPlayer(source, PlayerData.citizenid, name)
    end)

    RegisterNetEvent('QBCore:Server:OnPlayerUnload', function(source)
        dropPlayer(source)
    end)

    RegisterNetEvent('QBCore:Server:PlayerDropped', function(Ply)
        dropPlayer(Ply.PlayerData.source)
    end)

    AddEventHandler('onResourceStart', function(resourceName)
        if GetCurrentResourceName() ~= resourceName then return end
        Wait(1000)
        local players = isQbox and exports.qbx_core:GetQBPlayers() or QBCore.Functions.GetQBPlayers()
        for _, Player in pairs(players) do
            pushPlayer(Player.PlayerData.source, Player.PlayerData.citizenid, nameOf(Player.PlayerData))
        end
    end)

elseif GetResourceState('es_extended') == 'started' then
    ESX = exports['es_extended']:getSharedObject()

    function HasAdmin(source)
        return IsPlayerAceAllowed(source, 'command')
    end

    RegisterNetEvent('esx:playerLoaded', function(_, xPlayer)
        pushPlayer(xPlayer.source, xPlayer.identifier, xPlayer.name)
    end)

    RegisterNetEvent('esx:playerDropped', function(playerId)
        dropPlayer(playerId)
    end)

    AddEventHandler('onResourceStart', function(resourceName)
        if GetCurrentResourceName() ~= resourceName then return end
        Wait(1000)
        for _, src in pairs(ESX.GetPlayers()) do
            local xPlayer = ESX.GetPlayerFromId(src)
            if xPlayer then
                pushPlayer(xPlayer.source, xPlayer.identifier, xPlayer.name)
            end
        end
    end)

elseif GetResourceState('ox_core') == 'started' then
    local Ox = require '@ox_core.lib.init'

    local function nameOf(Player)
        return ('%s %s'):format(Player.get('firstName'), Player.get('lastName'))
    end

    function HasAdmin(source)
        local Player = Ox.GetPlayer(source)
        return IsPlayerAceAllowed(source, 'command') or (Player and Player.hasPermission('group.admin'))
    end

    RegisterNetEvent('ox:playerLoaded', function(playerId, userId)
        pushPlayer(playerId, userId, nameOf(Ox.GetPlayerFromUserId(userId)))
    end)

    RegisterNetEvent('ox:playerLogout', function(playerId)
        dropPlayer(playerId)
    end)

    AddEventHandler('playerDropped', function()
        dropPlayer(source)
    end)

    AddEventHandler('onResourceStart', function(resourceName)
        if GetCurrentResourceName() ~= resourceName then return end
        Wait(1000)
        for _, Player in pairs(Ox.GetPlayers()) do
            pushPlayer(Player.source, Player.userId, nameOf(Player))
        end
    end)
end
