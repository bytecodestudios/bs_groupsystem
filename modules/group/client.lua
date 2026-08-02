---@class GroupClient
Group = {}

--- Sends a message to the UI, using the laptop app bridge when present.
---@param data table
function Group.sendToApp(data)
    if SendAppMessage then
        SendAppMessage(data)
    else
        SendNUIMessage(data)
    end
end

--- Pushes the current locale strings to the UI.
function Group.setLocales()
    local localeData = lib.getLocales()
    if not localeData then return end
    Group.sendToApp({ action = 'setLocale', data = localeData })
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
    Group.sendToApp({ action = data.action, data = data })
end)

RegisterNetEvent('bs_groupsystem:client:notification', function(data)
    SendNUIMessage({
        action = 'notification',
        data = {
            type = data.type or 'info',
            title = data.title or 'Group',
            message = data.description or data.msg,
        },
    })
end)

RegisterNetEvent('bs_groupsystem:client:toggle', function(visible)
    Group.setVisible(visible)
    if visible then Group.setLocales() end
end)

CreateThread(function()
    Wait(500)
    Group.setLocales()
end)

-- Standalone keybind, skipped when running inside a laptop app.
if SendAppMessage then return end

RegisterKeyMapping('openGroups', 'Open Groups', 'keyboard', 'F6')
RegisterCommand('openGroups', function()
    SetNuiFocus(true, true)
    Group.setVisible(true)
    Group.setLocales()
end, false)
