if (GetResourceState('qb-core') ~= "started") then return end

local QBCore = exports['qb-core']:GetCoreObject()

function CheckStates()
    local ped = PlayerPedId()
    local data = QBCore.Functions.GetPlayerData()
    return (
        IsPedSwimming(ped)
        or IsPedSwimmingUnderWater(ped)
        or data.metadata.ishandcuffed
        or data.metadata.inlaststand
        or data.metadata.isdead
    )
end