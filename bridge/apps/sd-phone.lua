--- sd-phone surface adapter (also registered under 'lb-phone'). Registrations
--- live in sd-phone memory, so the app re-registers whenever sd-phone starts.

if GetResourceState('sd-phone') ~= 'started' then return end

local cfg = Config.PhoneApp

--- Builds the `ui` value for addCustomApp: an http(s) URL passes through, any
--- other page becomes the resource-relative form sd-phone rewrites.
---@return string|nil
local function resolveUi()
    local resource = GetCurrentResourceName()
    local uiPage = GetResourceMetadata(resource, 'ui_page', 0)
    if not uiPage or uiPage == '' then return nil end
    if uiPage:find('^https?://') then return uiPage end
    return resource .. '/' .. uiPage
end

--- Registers the app with sd-phone. Safe to repeat; the same identifier is replaced.
local function register()
    local ok, err = exports['sd-phone']:addCustomApp({
        identifier  = cfg.identifier,
        name        = cfg.name,
        description = cfg.description,
        developer   = cfg.developer,
        defaultApp  = cfg.defaultApp,
        ui          = resolveUi(),
        icon        = cfg.icon,
        onOpen = function()
            Apps.setActive('sd-phone')
            TriggerEvent('bs_groupsystem:client:toggle', true)
        end,
        onClose = function()
            Apps.setActive(nil)
            TriggerEvent('bs_groupsystem:client:toggle', false)
        end,
    })
    if not ok then
        print(('[bs_groupsystem] sd-phone registration failed: %s'):format(err or 'unknown error'))
    end
end

Apps.register('sd-phone', {
    sendMessage = function(data)
        exports['sd-phone']:sendCustomAppMessage(cfg.identifier, data)
    end,
    --- Native sd-phone banner; data arrives phone-shaped, so only the app
    --- identity is filled in for the icon and tap target.
    notify = function(data)
        exports['sd-phone']:showNotification({
            title = data.title,
            body  = data.body,
            app   = data.app or cfg.identifier,
            image = data.image,
            time  = data.time,
            appId = data.appId or cfg.identifier,
        })
    end,
})

-- The export can land a beat after sd-phone reports "started".
CreateThread(function()
    Wait(1000)
    register()
end)

-- Re-register after a phone restart, without rebooting this resource.
AddEventHandler('onResourceStart', function(resource)
    if resource ~= 'sd-phone' then return end
    Wait(1000)
    register()
end)
