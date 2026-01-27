if (GetResourceState('ox_core') ~= "started") then return end

function CheckStates()
    local ped = PlayerPedId()
    return (
        IsPedSwimming(ped)
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
    )
end