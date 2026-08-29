--- sd-phone surface adapter.
---
--- Registers the group app with sd-phone (also replayed under the 'lb-phone'
--- name) and routes UI messages into its app iframe. Registrations live in
--- sd-phone memory only, so the app is re-registered whenever sd-phone starts.

if GetResourceState('sd-phone') ~= 'started' then return end

local cfg = Config.PhoneApp

--- Builds the value handed to addCustomApp as the `ui` field. A full http(s)
--- URL (a live dev server) passes through untouched; anything else becomes the
--- resource-relative form sd-phone rewrites into https://cfx-nui-<resource>/...
---@return string|nil
local function resolveUi()
    local resource = GetCurrentResourceName()
    local uiPage = GetResourceMetadata(resource, 'ui_page', 0)
    if not uiPage or uiPage == '' then return nil end
    if uiPage:find('^https?://') then return uiPage end
    return resource .. '/' .. uiPage
end

--- Registers (or re-registers) the app with sd-phone. Safe to call repeatedly;
--- re-registering the same identifier just replaces it.
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
        print(('[bs_groups] sd-phone registration failed: %s'):format(err or 'unknown error'))
    end
end

Apps.register('sd-phone', {
    sendMessage = function(data)
        exports['sd-phone']:sendCustomAppMessage(cfg.identifier, data)
    end,
    --- Native sd-phone banner. `data` arrives already shaped for the phone
    --- (title/body/app/image/time/appId); we only fill in the app identity so
    --- the group icon shows and tapping the banner opens our app.
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

-- Initial registration once sd-phone is up. The export can land a moment after
-- sd-phone reports "started", so give it a beat.
CreateThread(function()
    Wait(1000)
    register()
end)

-- Re-register after a phone restart so the app returns without rebooting this
-- resource.
AddEventHandler('onResourceStart', function(resource)
    if resource ~= 'sd-phone' then return end
    Wait(1000)
    register()
end)
