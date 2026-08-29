Config = {}

lib.locale()

---party timeout in milliseconds
Config.PartyTimeout = 1000 * 60 * 5 -- 5 minutes

---cooldown after how many minutes the players are able to create a party
Config.StartingPartyCooldown = 0 -- minutes

---If players should be able to leave the party when a job is active
Config.AllowLeavePartyDuringJob = true

---custom app integration for laptops/tablets
---supported: kartik-laptop
Config.AppSettings = {
    id = "bsgroup",
    name = "Groups",
    url= 'https://cfx-nui-' .. GetCurrentResourceName() .. '/web/index.html',
    color = "from-blue-500 to-indigo-600",
    icon = "Users",
    isVisible = function ()
        return true
    end,
    onAppOpen = function()
        TriggerEvent("bs_groupsystem:client:toggle", true)
    end,
    onAppClose = function()
        TriggerEvent("bs_groupsystem:client:toggle", false)
    end,
}

---phone app integration
---supported: sd-phone (also registers under lb-phone)
Config.PhoneApp = {
    identifier = "bsgroup",             -- unique app id, never shown to players
    name = "Groups",                    -- home screen + App Store display name
    description = "Create and manage your groups.",
    developer = "Bytecode Studios",
    defaultApp = true,                  -- true = pre-installed, false = App Store download
    icon = ('https://cfx-nui-%s/web/icon.svg'):format(GetCurrentResourceName()),
}