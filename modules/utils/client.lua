local PlayerStore = {}

Client = {}

function Client:get(filter)
    if filter then return PlayerStore[filter] end
    return PlayerStore
end

RegisterNetEvent('__bs_group:internal:onPlayerDataChange', function(data)
    PlayerStore = data
end)