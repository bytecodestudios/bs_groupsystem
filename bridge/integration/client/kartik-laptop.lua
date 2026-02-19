if (GetResourceState('kartik-laptop') ~= "started") then return end

local function registerApp()
    local returnData = Config.AppSettings
    local appId = returnData.id
    exports['kartik-laptop']:RegisterApp(appId, returnData)
end

function SendAppMessage(data)
    data.iframeId = Config.AppSettings.id
    exports['kartik-laptop']:sendReactMessage(data)
end

AddEventHandler("onResourceStart", function(resource)
	if resource == "kartik-laptop" then
		registerApp()
	end
end)

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
        exports['kartik-laptop']:UnregisterApp(Config.AppSettings.id)
    end
end)

CreateThread(function()
    Wait(2000)
    registerApp()
end)