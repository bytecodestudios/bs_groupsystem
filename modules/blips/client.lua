---@class GroupBlip
---@field name string
---@field blip number
---@field data GroupBlipData

---@type GroupBlip[]
local blips = {}

--- Returns the index of a stored blip by name.
---@param name string
---@return number|false
local function findBlipByName(name)
    for i, entry in ipairs(blips) do
        if entry.name == name then return i end
    end
    return false
end

--- Removes every stored blip.
local function removeAllBlips()
    for _, entry in ipairs(blips) do
        if entry.blip then RemoveBlip(entry.blip) end
    end
    blips = {}
end

RegisterNetEvent('bs_groupsystem:client:party:createBlip', function(name, data)
    if not name or not data then return end
    if findBlipByName(name) then
        TriggerEvent('bs_groupsystem:client:party:removeBlip', name)
    end

    local blip
    if data.entity then
        blip = AddBlipForEntity(data.entity)
    elseif data.netId then
        blip = AddBlipForEntity(NetworkGetEntityFromNetworkId(data.netId))
    elseif data.radius then
        blip = AddBlipForRadius(data.coords.x, data.coords.y, data.coords.z, data.radius)
    else
        blip = AddBlipForCoord(data.coords.x, data.coords.y, data.coords.z)
    end

    data.color = data.color or 1
    data.alpha = data.alpha or 255

    if not data.radius then
        data.sprite = data.sprite or 1
        data.scale = data.scale or 0.7
        data.label = data.label or 'NO LABEL FOUND'

        SetBlipSprite(blip, data.sprite)
        SetBlipScale(blip, data.scale)
        BeginTextCommandSetBlipName('STRING')
        AddTextComponentSubstringPlayerName(data.label)
        EndTextCommandSetBlipName(blip)
    end

    SetBlipColour(blip, data.color)
    SetBlipAlpha(blip, data.alpha)

    if data.route and data.coords then
        SetNewWaypoint(data.coords.x, data.coords.y)
    end

    blips[#blips + 1] = { name = name, blip = blip, data = data }
end)

RegisterNetEvent('bs_groupsystem:client:party:removeBlip', function(name)
    local i = findBlipByName(name)
    if not i then return end
    if blips[i].blip then RemoveBlip(blips[i].blip) end
    table.remove(blips, i)
end)

RegisterNetEvent('bs_groupsystem:client:party:removeAllBlips', removeAllBlips)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        removeAllBlips()
    end
end)
