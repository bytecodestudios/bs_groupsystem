local isRequesting = false
local vpnConnected = false

--- Wraps a server callback response into the { status, msg } shape the UI expects.
---@param name string Server callback name.
local function forwardCallback(name)
    return function(data, cb)
        local response = lib.callback.await(name, false, data)
        cb({
            status = response and response.status or false,
            msg = response and response.msg or response,
        })
    end
end

RegisterNUICallback('bsgroup:nui:fetchParties', function(_, cb)
    local response = lib.callback.await('bs_groupsystem:server:retrieveParties', false)
    if not response then return cb({ status = false }) end
    cb({
        status = true,
        data = { parties = response, canSeeIllegalParties = CanSeeIllegalParties() },
    })
end)

RegisterNUICallback('bsgroup:nui:checkVpnAccess', function(_, cb)
    local hasAccess = CanSeeIllegalParties()
    if vpnConnected and not hasAccess then vpnConnected = false end
    cb({ hasAccess = hasAccess, isConnected = vpnConnected })
end)

RegisterNUICallback('bsgroup:nui:toggleVpn', function(data, cb)
    if not data.connect then
        vpnConnected = false
        return cb({ success = true, connected = false })
    end

    if CanSeeIllegalParties() then
        vpnConnected = true
        cb({ success = true, connected = true })
    else
        vpnConnected = false
        cb({ success = false, connected = false, msg = 'No VPN hardware detected' })
    end
end)

RegisterNUICallback('bsgroup:nui:createParty', forwardCallback('bs_groupsystem:server:createParty'))

RegisterNUICallback('bsgroup:nui:requestJoinParty', function(data, cb)
    if isRequesting then return cb({ status = false, msg = locale('please_wait') }) end
    isRequesting = true
    local response = lib.callback.await('bs_groupsystem:server:requestJoinGroup', false, data)
    isRequesting = false
    cb({
        status = response and response.status or false,
        msg = response and response.msg or response,
    })
end)

RegisterNUICallback('bsgroup:nui:disbandParty', function(data, cb)
    cb(lib.callback.await('bs_groupsystem:server:requestDisbandParty', false, data))
end)

RegisterNUICallback('bsgroup:nui:leaveParty', function(data, cb)
    cb(lib.callback.await('bs_groupsystem:server:leaveParty', false, data))
end)

RegisterNUICallback('bsgroup:nui:kickMember', function(data, cb)
    cb(lib.callback.await('bs_groupsystem:server:kickMember', false, data))
end)

RegisterNUICallback('bsgroup:nui:updateTasks', function(data, cb)
    cb(lib.callback.await('bs_groupsystem:server:updateTasks', false, data))
end)

RegisterNUICallback('bsgroup:nui:fetchSingleGroup', function(data, cb)
    cb(lib.callback.await('bs_groupsystem:server:fetchSingleGroup', false, data.groupId))
end)

RegisterNUICallback('bsgroup:nui:processRequest', function(data, cb)
    cb(lib.callback.await('bs_groupsystem:server:processRequest', false, data))
end)

RegisterNUICallback('bsgroup:nui:promoteLeader', function(data, cb)
    local response = lib.callback.await('bs_groupsystem:server:promoteLeader', false, data)
    cb({ status = response ~= nil, group = response })
end)

RegisterNUICallback('bsgroup:nui:getNearbyPlayers', function(_, cb)
    cb(lib.callback.await('bs_groupsystem:server:getNearbyPlayers', false))
end)

RegisterNUICallback('bsgroup:nui:invitePlayer', function(data, cb)
    cb(lib.callback.await('bs_groupsystem:server:invitePlayer', false, data))
end)

RegisterNUICallback('bsgroup:nui:getPlayerData', function(_, cb)
    cb(lib.callback.await('bs_groupsystem:server:getPlayerData', false))
end)

RegisterNUICallback('bsgroup:nui:closeUI', function(_, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

lib.callback.register('bs_groupsystem:client:receiveConfirmationPopup', function(data)
    local alert = lib.alertDialog({
        header = data.title or 'Group',
        content = data.description or data.msg,
        centered = true,
        cancel = true,
        labels = { confirm = 'Accept', cancel = 'Decline' },
    })
    return { status = alert == 'confirm' }
end)
