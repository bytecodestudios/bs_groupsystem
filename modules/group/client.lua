local groupBlips = {}

local isRequesting = false

RegisterNUICallback('phone:nui:fetchParties', function(_, cb)
    local response = lib.callback.await('phone:server:retrieveParties', false)
    if response then
        local dataToSend = {
            parties = response,
            canSeeIllegalParties = CanSeeIllegalParties()
        }
        cb({status = true, data = dataToSend})
    else
        cb({status = false, msg = response})
    end
end)

RegisterNUICallback('phone:nui:createParty', function(data, cb)
    local response = lib.callback.await('phone:server:createParty', false, data)
    local result = {
        status = response and response.status or false,
        msg = response and response.msg or response
    }
    cb(result)
end)

RegisterNUICallback('phone:nui:requestJoinParty', function(data, cb)
    if isRequesting then return cb({status = false, msg = locale('please_wait')}) end
    isRequesting = true
    local response = lib.callback.await('phone:server:requestJoinGroup', false, data)
    isRequesting = false
    local result = {
        status = response and response.status or false,
        msg = response and response.msg or response
    }
    cb(result)
end)

RegisterNUICallback('phone:nui:disbandParty', function(_, cb)
    TriggerServerEvent('phone:server:requestDisbandParty')
    cb({status = true})
end)

RegisterNUICallback('phone:nui:leaveParty', function(_, cb)
    TriggerServerEvent('phone:server:leaveParty')
    cb({status = true})
end)

RegisterNUICallback('phone:nui:kickMember', function(data, cb)
    TriggerServerEvent('phone:server:kickMember', data)
    cb({status = true})
end)

---Locates blip by the name of the group blip and returns its index in the table
---@param name string The name of the blip to find
---@return number|false index The index of the found blip or false if not found
local function findBlipByName(name)
	for i, blip in ipairs(groupBlips) do
		if blip.name == name then
			return i
		end
	end

	return false
end

---Removes all group blips
local function removeAllGroupBlips()
	for _, groupBlip in ipairs(groupBlips) do
		if groupBlip.blip then
			RemoveBlip(groupBlip.blip)
		end
	end
	groupBlips = {}
end

---Creates a new blip with the specified configuration
---@param name string Name identifier for the blip
---@param data GroupBlipData Configuration data for the blip
RegisterNetEvent('phone:client:party:createBlip', function(name, data)
	if not name or not data then return end

	if findBlipByName(name) then
		TriggerEvent('phone:client:party:removeBlip', name)
	end

	local blip = nil
	if data.entity then
		blip = AddBlipForEntity(data.entity)
	elseif data.netId then
		blip = AddBlipForEntity(NetworkGetEntityFromNetworkId(data.netId))
	elseif data.radius then
		blip = AddBlipForRadius(data.coords.x, data.coords.y, data.coords.z, data.radius)
	else
		blip = AddBlipForCoord(data.coords)
	end

	if not data.color then data.color = 1 end
	if not data.alpha then data.alpha = 255 end

	if not data.radius then
		if not data.sprite then data.sprite = 1 end
		if not data.scale then data.scale = 0.7 end
		if not data.label then data.label = "NO LABEL FOUND" end

		SetBlipSprite(blip, data.sprite)
		SetBlipScale(blip, data.scale)
		BeginTextCommandSetBlipName("STRING")
		AddTextComponentSubstringPlayerName(data.label)
		EndTextCommandSetBlipName(blip)
	end

	SetBlipColour(blip, data.color)
	SetBlipAlpha(blip, data.alpha)

	if data.route then
		if data.coords then
			SetNewWaypoint(data.coords.x, data.coords.y)
		end
	end

	table.insert(groupBlips, { name = name, blip = blip, data = data })
end)

---Removes a blip with the specified name
---@param name string Name of the blip to remove
RegisterNetEvent('phone:client:party:removeBlip', function(name)
	local i = findBlipByName(name)
	if i then
		local blip = groupBlips[i].blip
		if blip then
			RemoveBlip(blip)
		end
		table.remove(groupBlips, i)
	end
end)

RegisterNetEvent('phone:client:party:removeAllBlips', removeAllGroupBlips)

AddEventHandler('onResourceStop', function(resourceName)
	if resourceName == GetCurrentResourceName() then
		removeAllGroupBlips()
	end
end)