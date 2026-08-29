---@class GroupClient
Group = {}

--- Sends a message to the UI, routed through the active app surface (laptop,
--- phone, ...) or the standalone NUI instance when none owns the UI.
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

--- Pushes locale strings to the UI with a few retries. When the app is hosted by
--- a surface (phone/laptop) the iframe can mount a moment after we're told it
--- opened, so a single push may arrive before the React locale listener exists.
--- Re-sending over ~1s ensures the strings land regardless of that race.
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

-- -----------------------------------------------------------------------------
-- UI facing events
-- -----------------------------------------------------------------------------

RegisterNetEvent('bs_groupsystem:client:updatePhoneData', function(data)
    if not data or data.app ~= 'party' then return end
    -- Party refreshes drive both the interactive app (active surface) and the
    -- always-on task HUD in the standalone NUI frame, so use sendData.
    Apps.sendData({ action = data.action, data = data })
end)

RegisterNetEvent('bs_groupsystem:client:notification', function(data)
    local title = data.title or 'Group'
    local body = data.description or data.msg

    -- Prefer a surface's native notification (e.g. sd-phone's banner) so the
    -- player is alerted even when the app isn't open. Falls back to an in-app
    -- notification message when no surface provides one.
    -- Note: data.icon is a Font Awesome name (in-app use), not an image URL, so
    -- it is not forwarded as the banner image; the group app icon is used.
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

-- Standalone keybind, skipped when the app is hosted by a surface (laptop/phone).
if Apps.hasSurface() then return end

RegisterKeyMapping('openGroups', 'Open Groups', 'keyboard', 'F6')
RegisterCommand('openGroups', function()
    SetNuiFocus(true, true)
    Group.setVisible(true)
    Group.setLocales()
end, false)
