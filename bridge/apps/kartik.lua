--- kartik-laptop surface adapter.
---
--- Registers the group app with kartik-laptop and routes UI messages into its
--- app iframe. Only active when kartik-laptop is running.

if GetResourceState('kartik-laptop') ~= 'started' then return end

local settings = Config.AppSettings
local id = settings.id

-- Wrap open/close so the manager knows which surface owns the UI. The original
-- config handlers still fire, keeping the toggle behaviour unchanged.
settings.onAppOpen = function()
    Apps.setActive('kartik-laptop')
    TriggerEvent('bs_groupsystem:client:toggle', true)
end

settings.onAppClose = function()
    Apps.setActive(nil)
    TriggerEvent('bs_groupsystem:client:toggle', false)
end

local function registerApp()
    exports['kartik-laptop']:RegisterApp(id, settings)
end

Apps.register('kartik-laptop', {
    sendMessage = function(data)
        data.iframeId = id
        exports['kartik-laptop']:sendReactMessage(data)
    end,
})

AddEventHandler('onResourceStart', function(resource)
    if resource == 'kartik-laptop' then registerApp() end
end)

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
        exports['kartik-laptop']:UnregisterApp(id)
    end
end)

CreateThread(function()
    Wait(2000)
    registerApp()
end)
