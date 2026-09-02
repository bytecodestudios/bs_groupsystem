---@class GroupClient
Group = {}

--- Sends a message to the UI through the active app surface, or the standalone
--- NUI instance when no surface owns it.
---@param data table
function Group.sendToApp(data)
    Apps.sendMessage(data)
end

--- Pushes the current locale strings to the UI.
function Group.setLocales()
    local localeData = lib.getLocales()
    if not localeData then return end
    Group.sendToApp({ action = 'setLocale', data = localeData })
end

--- Pushes locale strings with retries over ~1s, since a hosted iframe can mount
--- after the open event and miss a single push.
function Group.setLocalesRetry()
    CreateThread(function()
        for _ = 1, 4 do
            Group.setLocales()
            Wait(300)
        end
    end)
end

--- Shows or hides the UI.
---@param visible boolean
function Group.setVisible(visible)
    Group.sendToApp({ action = 'setVisible', data = visible })
end

RegisterNetEvent('bs_groupsystem:client:updatePhoneData', function(data)
    if not data or data.app ~= 'party' then return end
    -- Party refreshes drive both the app surface and the always-on task HUD.
    Apps.sendData({ action = data.action, data = data })
end)

RegisterNetEvent('bs_groupsystem:client:notification', function(data)
    local title = data.title or 'Group'
    local body = data.description or data.msg

    -- Prefer a surface's native banner so the player is alerted with the app
    -- closed. data.icon is a Font Awesome name, not an image URL.
    local delivered = Apps.notify({
        title = title,
        body  = body,
        time  = data.time,
        app   = data.app,
        image = data.image,
        appId = data.appId,
    })
    if delivered then return end

    Group.sendToApp({
        action = 'notification',
        data = {
            type = data.type or 'info',
            title = title,
            message = body,
        },
    })
end)

RegisterNetEvent('bs_groupsystem:client:toggle', function(visible)
    Group.setVisible(visible)
    if visible then Group.setLocalesRetry() end
end)

CreateThread(function()
    Wait(500)
    Group.setLocales()
end)

-- Standalone keybind, skipped when a surface (laptop/phone) hosts the app.
if Apps.hasSurface() then return end

RegisterKeyMapping('openGroups', 'Open Groups', 'keyboard', 'F6')
RegisterCommand('openGroups', function()
    SetNuiFocus(true, true)
    Group.setVisible(true)
    Group.setLocales()
end, false)
