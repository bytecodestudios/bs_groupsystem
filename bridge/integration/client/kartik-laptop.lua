if (GetResourceState('kartik-laptop') ~= "started") then return end

local function registerApp()
    local returnData = Config.AppSettings
    local appId = returnData.id
    exports['kartik-laptop']:RegisterApp(appId, returnData)
end

AddEventHandler("onResourceStart", function(resource)
	if resource == "kartik-laptop" then
		registerApp()
	end
end)

CreateThread(function()
    Wait(2000)
    registerApp()
end)