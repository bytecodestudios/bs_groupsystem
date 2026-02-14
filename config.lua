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
    end
}