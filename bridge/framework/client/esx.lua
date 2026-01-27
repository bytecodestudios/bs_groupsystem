if (GetResourceState('es_extended') ~= "started") then return end

ESX = exports.es_extended:getSharedObject()

function CheckStates()
    local ped = PlayerPedId()
    -- local data = ESX.GetPlayerData()
    return (
        IsPedSwimming(ped)
        or IsPedSwimmingUnderWater(ped)
        or IsPedCuffed(ped)
        or LocalPlayer.state.isDead
    )
end