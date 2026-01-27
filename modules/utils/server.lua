local PlayerStore = {}

Players = {}

setmetatable(PlayerStore , {
	__index = function(self, source)
		local player = nil
		local idFound = false
		for _, v in pairs(PlayerStore) do
			if v.citizenid == source then
				player = v
				idFound = true
				break
			end
		end
		if not idFound then
			return nil
		end
		return player
	end
})

function Players:set(source, data)
	PlayerStore[source] = data
	TriggerClientEvent('__bs_group:internal:onPlayerDataChange', source, data)
	return PlayerStore[source]
end

function Players:clear(source)
	if PlayerStore[source] then
		PlayerStore[source] = nil
		TriggerClientEvent('__bs_group:internal:onPlayerDataChange', source, nil)
		return true
	end
	return false
end

function Players:get(source)
	return PlayerStore[source]
end