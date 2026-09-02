--- App surface manager. A "surface" is any external UI host (kartik-laptop,
--- sd-phone) hosting this app; modules reach it via `Apps.sendMessage`.
---@class AppManager
Apps = {}

--- Registered surface adapters, keyed by resource name.
---@type table<string, AppSurface>
local surfaces = {}

--- Surface currently displaying the app, or nil for the standalone NUI.
---@type string|nil
local activeSurface = nil

--- Registers a surface adapter.
---@param name string Resource name of the surface (e.g. 'sd-phone').
---@param adapter AppSurface Adapter implementation.
function Apps.register(name, adapter)
    surfaces[name] = adapter
end

--- Whether any surface is integrated; used to disable the standalone keybind.
---@return boolean
function Apps.hasSurface()
    return next(surfaces) ~= nil
end

--- Marks which surface is showing the UI so messages route to it.
--- Pass nil on close to fall back to the standalone instance.
---@param name string|nil
function Apps.setActive(name)
    activeSurface = name
end

--- Sends a message to the UI through the active surface, or to the standalone
--- NUI instance when no surface owns the UI.
---@param data table `{ action = string, data = any }`
function Apps.sendMessage(data)
    -- No surface integrated: this is a standalone (fullscreen NUI) build.
    if next(surfaces) == nil then
        SendNUIMessage(data)
        return
    end

    -- Prefer the active surface; when none reported yet, broadcast to all so
    -- early pushes are not dropped. Closed surfaces just ignore the message.
    local surface = activeSurface and surfaces[activeSurface]
    if surface then
        surface.sendMessage(data)
    else
        for _, s in pairs(surfaces) do
            s.sendMessage(data)
        end
    end
end

--- Pushes party data to both the hosted app and this resource's own NUI layer,
--- so the always-on task HUD stays in sync alongside the surface.
---@param data table `{ action = string, data = any }`
function Apps.sendData(data)
    Apps.sendMessage(data)
    -- With a surface, sendMessage reached only it; also feed the HUD frame.
    -- Without one it already targeted that frame, so do not deliver twice.
    if next(surfaces) ~= nil then
        SendNUIMessage(data)
    end
end

--- Shows a notification, preferring a surface's native banner so the player is
--- alerted even with the app closed.
---@param data table Notification payload (title/body/...).
---@return boolean delivered True when a surface handled it.
function Apps.notify(data)
    for _, surface in pairs(surfaces) do
        if surface.notify then
            surface.notify(data)
            return true
        end
    end
    return false
end
