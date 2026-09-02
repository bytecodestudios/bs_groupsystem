---@type table<number, PlayerData>
local store = {}

--- Player registry, keyed by server id and searchable by citizen id.
---@class PlayerStore
Players = {}

setmetatable(store , {
	__index = function(self, source)
		local player = nil
		local idFound = false
		for _, v in pairs(store) do
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

--- Stores a player and notifies their client of the change.
---@param source number Server id of the player.
---@param data PlayerData Normalised player data.
---@return PlayerData
function Players:set(source, data)
    store[source] = data
    return store[source]
end

--- Removes a player from the store and clears their client mirror.
---@param source number Server id of the player.
---@return boolean removed True when a player was removed.
function Players:clear(source)
    if not store[source] then return false end
    store[source] = nil
    return true
end

--- Looks a player up by server id or citizen id.
---@param key number|string Server id or citizen id.
---@return PlayerData|nil
function Players:get(key)
    return store[key]
end