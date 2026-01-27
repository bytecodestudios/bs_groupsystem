Config = {}

lib.locale()

---party timeout in milliseconds
Config.PartyTimeout = 1000 * 60 * 5 -- 5 minutes
---cooldown after how many minutes the players are able to create a party
Config.StartingPartyCooldown = 0 -- minutes
---If players should be able to leave the party when a job is active
Config.AllowLeavePartyDuringJob = true