Config = {}

lib.locale()

---How long a disconnected member is kept before being removed, in milliseconds.
Config.PartyTimeout = 1000 * 60 * 5

---Minutes after server start before players may create a party.
Config.StartingPartyCooldown = 0

---Whether members can leave or be kicked while a job is active.
Config.AllowLeavePartyDuringJob = true

---Laptop app integration, supported: kartik-laptop.
---@type table
Config.AppSettings = {
    id = "bsgroup",                     -- unique app id, never shown to players
    name = "Groups",                    -- title shown on the laptop home screen
    url= 'https://cfx-nui-' .. GetCurrentResourceName() .. '/web/index.html',
    color = "from-blue-500 to-indigo-600", -- tailwind gradient used for the app tile
    icon = "Users",                     -- lucide icon name
    isVisible = function ()             -- return false to hide the app from this player
        return true
    end,
    onAppOpen = function()              -- fired when the laptop opens the app
        TriggerEvent("bs_groupsystem:client:toggle", true)
    end,
    onAppClose = function()             -- fired when the laptop closes the app
        TriggerEvent("bs_groupsystem:client:toggle", false)
    end,
}

---Phone app integration, supported: sd-phone (also registers under lb-phone).
---@type table
Config.PhoneApp = {
    identifier = "bsgroup",             -- unique app id, never shown to players
    name = "Groups",                    -- home screen + App Store display name
    description = "Create and manage your groups.",
    developer = "Bytecode Studios",
    defaultApp = true,                  -- true = pre-installed, false = App Store download
    icon = ('https://cfx-nui-%s/web/icon.svg'):format(GetCurrentResourceName()),
}
