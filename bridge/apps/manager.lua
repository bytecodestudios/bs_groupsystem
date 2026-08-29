--- App surface manager.
---
--- A "surface" is any external UI host that can display this resource's web app
--- inside its own frame: a laptop (kartik-laptop), a phone (sd-phone), etc.
--- Each surface registers an adapter here; the group modules then talk to the
--- UI through `Apps.sendMessage` without caring which surface is active.
---@class AppManager
Apps = {}

--- Registered surface adapters, keyed by resource name.
---@type table<string, { sendMessage: fun(data: table), notify: (fun(data: table))? }>
local surfaces = {}

--- The surface currently displaying the app, or nil when the standalone
--- (fullscreen NUI) instance owns the UI.
---@type string|nil
local activeSurface = nil

--- Registers a surface adapter.
---@param name string Resource name of the surface (e.g. 'sd-phone').
---@param adapter { sendMessage: fun(data: table), notify: (fun(data: table))? } Adapter implementation.
function Apps.register(name, adapter)
    surfaces[name] = adapter
end

--- Whether at least one app surface is integrated. Used to disable the
--- standalone keybind so the app is only reachable through its host.
---@return boolean
function Apps.hasSurface()
    return next(surfaces) ~= nil
end

--- Marks which surface is currently showing the UI so messages route to it.
--- Pass nil when the surface closes to fall back to the standalone instance.
---@param name string|nil
function Apps.setActive(name)
    activeSurface = name
end

--- Sends a message to the UI through the active surface, or to the standalone
--- NUI instance when no surface owns the UI.
---@param data table `{ action = string, data = any }`
function Apps.sendMessage(data)
    -- No surface integrated at all: this is a standalone (fullscreen NUI) build.
    if next(surfaces) == nil then
        SendNUIMessage(data)
        return
    end

    -- Prefer the surface that reported itself active. When none has (the host's
    -- open lifecycle can land a beat after the app's iframe has already mounted
    -- and started receiving pushes), broadcast to every registered surface so
    -- live updates still reach the open app instead of being dropped. A closed
    -- surface simply ignores/queues the message, so this is safe.
    local surface = activeSurface and surfaces[activeSurface]
    if surface then
        surface.sendMessage(data)
    else
        for _, s in pairs(surfaces) do
            s.sendMessage(data)
        end
    end
end

--- Sends a party data/state push to the interactive app AND to this resource's
--- own persistent NUI layer.
---
--- The interactive Groups UI is hosted by whichever surface is active (phone,
--- laptop), but the always-on task HUD (TaskWidget) lives in the resource's own
--- standalone NUI frame, which is loaded on screen at all times regardless of any
--- surface. Routing data through `sendMessage` alone would only ever reach the
--- surface, leaving the on-screen HUD stale/hidden. This delivers to both.
---@param data table `{ action = string, data = any }`
function Apps.sendData(data)
    Apps.sendMessage(data)
    -- When a surface exists, `sendMessage` went to the surface only; also feed
    -- the standalone HUD frame. With no surface, `sendMessage` already targeted
    -- that same frame, so avoid delivering twice.
    if next(surfaces) ~= nil then
        SendNUIMessage(data)
    end
end

--- Shows a notification to the player. When a surface with native notification
--- support (e.g. sd-phone's banner) is integrated it is used regardless of
--- whether the app is currently open, so the player is alerted even with the
--- phone put away. Falls back to an in-app notification message otherwise.
---@param data table Notification payload (title/body/...).
function Apps.notify(data)
    for _, surface in pairs(surfaces) do
        if surface.notify then
            surface.notify(data)
            return true
        end
    end
    return false
end
