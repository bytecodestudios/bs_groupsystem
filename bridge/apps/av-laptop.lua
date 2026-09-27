--- av_laptop surface adapter. Apps are registered through `av_apps`, which hosts
--- this resource's `ui_page` in an iframe inside the laptop. Only active when
--- av_apps is running.

if GetResourceState('av_apps') ~= 'started' then return end

local cfg = Config.LaptopApp

--- av_apps has no push export of its own in the public app template, and the
--- laptop is the frame owner, so the exact sender differs between builds.
--- Candidates are tried in order and the first one that survives a pcall is
--- cached; `Config.LaptopApp.sendMessage` overrides the probe entirely.
---@type fun(data: table)|nil
local sender = nil

local candidates = {
    function(data) exports['av_apps']:sendAppMessage(cfg.name, data) end,
    function(data) exports['av_apps']:sendReactMessage(cfg.name, data) end,
    function(data) exports['av_laptop']:sendAppMessage(cfg.name, data) end,
    function(data) exports['av_laptop']:sendReactMessage(data) end,
}

--- Delivers a UI message to the laptop iframe, resolving the sender on first use.
---@param data table `{ action = string, data = any }`
local function send(data)
    if cfg.sendMessage then return cfg.sendMessage(data) end

    if sender then
        if pcall(sender, data) then return end
        sender = nil
    end

    for _, candidate in ipairs(candidates) do
        if pcall(candidate, data) then
            sender = candidate
            return
        end
    end
    -- No push channel available: the UI falls back to polling while it is open.
end

Apps.register('av_apps', {
    sendMessage = send,
    --- av_laptop's own toast, so the player is alerted with the app closed.
    notify = function(data)
        TriggerEvent('av_laptop:notification', data.title or cfg.label, data.body, data.type or 'success')
    end,
})

--- Registers the app with av_apps. Safe to repeat; the same name is replaced.
local function register()
    local ok, err = pcall(function()
        exports['av_apps']:registerApp({
            name      = cfg.name,
            label     = cfg.label,
            resource  = GetCurrentResourceName(),
            icon      = cfg.icon,
            isEnabled = cfg.isEnabled,
        })
    end)
    if not ok then
        print(('[bs_groupsystem] av_apps registration failed: %s'):format(err or 'unknown error'))
    end
end

--- av_apps asks the owning resource whether the app is available for a serial.
exports('getState', function(serial)
    return cfg.isEnabled and cfg.isEnabled(serial) or false
end)

-- The laptop opens the app by mounting the iframe, with no Lua open/close hook,
-- so the UI reports it instead (see modules/nui/client.lua).
CreateThread(function()
    while GetResourceState('av_apps') ~= 'started' do Wait(100) end
    register()
end)

AddEventHandler('onResourceStart', function(resource)
    if resource ~= 'av_apps' then return end
    Wait(1000)
    register()
end)
