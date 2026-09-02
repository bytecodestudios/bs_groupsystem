if GetResourceState('qb-core') == 'started' then
    local QBCore = exports['qb-core']:GetCoreObject()

    --- Whether the player is in a state that blocks group actions.
    ---@return boolean
    function CheckStates()
        local ped = PlayerPedId()
        local data = QBCore.Functions.GetPlayerData()
        return IsPedSwimming(ped)
            or IsPedSwimmingUnderWater(ped)
            or data.metadata.ishandcuffed
            or data.metadata.inlaststand
            or data.metadata.isdead
    end

elseif GetResourceState('qbx_core') == 'started' then
    --- Whether the player is in a state that blocks group actions.
    ---@return boolean
    function CheckStates()
        local ped = PlayerPedId()
        local data = exports.qbx_core:GetPlayerData()
        return IsPedSwimming(ped)
            or IsPedSwimmingUnderWater(ped)
            or data.metadata.ishandcuffed
            or data.metadata.inlaststand
            or data.metadata.isdead
    end

elseif GetResourceState('es_extended') == 'started' then
    ESX = exports.es_extended:getSharedObject()

    --- Whether the player is in a state that blocks group actions.
    ---@return boolean
    function CheckStates()
        local ped = PlayerPedId()
        return IsPedSwimming(ped)
            or IsPedSwimmingUnderWater(ped)
            or IsPedCuffed(ped)
            or LocalPlayer.state.isDead
    end

elseif GetResourceState('ox_core') == 'started' then
    --- Whether the player is in a state that blocks group actions.
    ---@return boolean
    function CheckStates()
        local ped = PlayerPedId()
        return IsPedSwimming(ped)
            or IsPedSwimmingUnderWater(ped)
            or LocalPlayer.state.isCuffed
            or LocalPlayer.state.isEscorted
            or IsPedFatallyInjured(ped)
            or GetIsTaskActive(ped, 0)
            or IsPedRagdoll(ped)
            or IsEntityPlayingAnim(ped, 'dead', 'dead_a', 3)
            or IsEntityPlayingAnim(ped, 'missminuteman_1ig_2', 'handsup_base', 3)
            or IsEntityPlayingAnim(ped, 'missminuteman_1ig_2', 'handsup_enter', 3)
            or IsEntityPlayingAnim(ped, 'random@mugging3', 'handsup_standing_base', 3)
    end
end
