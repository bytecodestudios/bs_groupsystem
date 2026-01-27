if (GetResourceState('qbx_core') ~= "started") then return end

function CheckStates()
    local ped = PlayerPedId()
    local PlayerData = exports.qbx_core:GetPlayerData()
    return (
        IsPedSwimming(ped)
        or IsPedSwimmingUnderWater(ped)
        or PlayerData.metadata.ishandcuffed
        or PlayerData.metadata.inlaststand
        or PlayerData.metadata.isdead
    )
end