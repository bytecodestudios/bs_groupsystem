local groupBlips = {}

local isRequesting = false
local vpnConnected = false

RegisterNUICallback('bsgroup:nui:fetchParties', function(_, cb)
    local response = lib.callback.await('bs_groupsystem:server:retrieveParties', false)
    if response then
        local dataToSend = {
            parties = response,
            canSeeIllegalParties = CanSeeIllegalParties()
        }
        cb({ status = true, data = dataToSend })
    else
        cb({ status = false, msg = response })
    end
end)

RegisterNUICallback('bsgroup:nui:checkVpnAccess', function(_, cb)
    local hasAccess = CanSeeIllegalParties()

    if vpnConnected and not hasAccess then
        vpnConnected = false
    end

    cb({ hasAccess = hasAccess, isConnected = vpnConnected })
end)

RegisterNUICallback('bsgroup:nui:toggleVpn', function(data, cb)
    local wantsToConnect = data.connect
    if wantsToConnect then
        local hasAccess = CanSeeIllegalParties()
        if hasAccess then
            vpnConnected = true
            cb({ success = true, connected = true })
        else
            vpnConnected = false
            cb({ success = false, connected = false, msg = 'No VPN hardware detected' })
        end
    else
        vpnConnected = false
        cb({ success = true, connected = false })
    end
end)

RegisterNUICallback('bsgroup:nui:createParty', function(data, cb)
    local response = lib.callback.await('bs_groupsystem:server:createParty', false, data)
    local result = {
        status = response and response.status or false,
        msg = response and response.msg or response
    }
    cb(result)
end)

RegisterNUICallback('bsgroup:nui:requestJoinParty', function(data, cb)
    if isRequesting then return cb({ status = false, msg = locale('please_wait') }) end
    isRequesting = true
    local response = lib.callback.await('bs_groupsystem:server:requestJoinGroup', false, data)
    isRequesting = false
    local result = {
        status = response and response.status or false,
        msg = response and response.msg or response
    }
    cb(result)
end)

RegisterNUICallback('bsgroup:nui:disbandParty', function(data, cb)
    local response = lib.callback.await('bs_groupsystem:server:requestDisbandParty', false, data)
    cb(response)
end)

RegisterNUICallback('bsgroup:nui:leaveParty', function(data, cb)
    local response = lib.callback.await('bs_groupsystem:server:leaveParty', false, data)
    cb(response)
end)

RegisterNUICallback('bsgroup:nui:kickMember', function(data, cb)
    local response = lib.callback.await('bs_groupsystem:server:kickMember', false, data)
    cb(response)
end)

RegisterNUICallback('bsgroup:nui:updateTasks', function(data, cb)
    local response = lib.callback.await('bs_groupsystem:server:updateTasks', false, data)
    cb(response)
end)

RegisterNUICallback('bsgroup:nui:fetchSingleGroup', function(data, cb)
    local response = lib.callback.await('bs_groupsystem:server:fetchSingleGroup', false, data.groupId)
    cb(response)
end)

RegisterNUICallback('bsgroup:nui:processRequest', function(data, cb)
    local response = lib.callback.await('bs_groupsystem:server:processRequest', false, data)
    cb(response)
end)

RegisterNUICallback('bsgroup:nui:promoteLeader', function(data, cb)
    local response = lib.callback.await('bs_groupsystem:server:promoteLeader', false, data)
    cb({ status = response ~= nil, group = response })
end)

RegisterNUICallback('bsgroup:nui:getNearbyPlayers', function(_, cb)
    local response = lib.callback.await('bs_groupsystem:server:getNearbyPlayers', false)
    cb(response)
end)

RegisterNUICallback('bsgroup:nui:invitePlayer', function(data, cb)
    local response = lib.callback.await('bs_groupsystem:server:invitePlayer', false, data)
    cb(response)
end)

lib.callback.register('bs_groupsystem:client:receiveConfirmationPopup', function(data)
    local alert = lib.alertDialog({
        header = data.title or 'Group',
        content = data.description or data.msg,
        centered = true,
        cancel = true,
        labels = {
            confirm = "Accept",
            cancel = "Decline"
        }
    })

    return { status = alert == 'confirm' }
end)

RegisterNUICallback('bsgroup:nui:getPlayerData', function(_, cb)
    local response = lib.callback.await('bs_groupsystem:server:getPlayerData', false)
    cb(response)
end)

RegisterNUICallback('bsgroup:nui:closeUI', function(_, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

---Sets the locales of the UI
local function setLocales()
    local localeData = lib.getLocales()
    if not localeData then return end

    local appData = {
        action = 'setLocale',
        data = localeData
    }
    if SendAppMessage then
        SendAppMessage(appData)
    else
        SendNUIMessage(appData)
    end
end

---Sets the visibility of the UI
---@param bool boolean Whether to show the UI
local function setVisible(bool)
    local appData = {
        action = "setVisible",
        data = bool
    }
    if SendAppMessage then
        SendAppMessage(appData)
    else
        SendNUIMessage(appData)
    end
end

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
RegisterNetEvent('bs_groupsystem:client:party:createBlip', function(name, data)
    if not name or not data then return end

    if findBlipByName(name) then
        TriggerEvent('bs_groupsystem:client:party:removeBlip', name)
    end

    local blip = nil
    if data.entity then
        blip = AddBlipForEntity(data.entity)
    elseif data.netId then
        blip = AddBlipForEntity(NetworkGetEntityFromNetworkId(data.netId))
    elseif data.radius then
        blip = AddBlipForRadius(data.coords.x, data.coords.y, data.coords.z, data.radius)
    else
        blip = AddBlipForCoord(data.coords.x, data.coords.y, data.coords.z)
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
RegisterNetEvent('bs_groupsystem:client:party:removeBlip', function(name)
    local i = findBlipByName(name)
    if i then
        local blip = groupBlips[i].blip
        if blip then
            RemoveBlip(blip)
        end
        table.remove(groupBlips, i)
    end
end)

RegisterNetEvent('bs_groupsystem:client:party:removeAllBlips', removeAllGroupBlips)

RegisterNetEvent('bs_groupsystem:client:updatePhoneData', function(data)
    if data and data.app == 'party' then
        local appData = {
            action = data.action,
            data = data
        }
        if SendAppMessage then
            SendAppMessage(appData)
        else
            SendNUIMessage(appData)
        end
    end
end)

RegisterNetEvent('bs_groupsystem:client:notification', function(data)
    SendNUIMessage({
        action = 'notification',
        data = {
            type = data.type or 'info',
            title = data.title or 'Group',
            message = data.description or data.msg
        }
    })
end)

RegisterNetEvent("bs_groupsystem:client:toggle", function(bool)
    setVisible(bool)
    if bool then setLocales() end
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        removeAllGroupBlips()
    end
end)

CreateThread(function()
    Wait(500)
    setLocales()
end)

if SendAppMessage then return end
RegisterKeyMapping('openGroups', 'Open Groups', 'keyboard', 'F6')
RegisterCommand('openGroups', function()
    SetNuiFocus(true, true)
    setVisible(true)
    setLocales()
end, false)
