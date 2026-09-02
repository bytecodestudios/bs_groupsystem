--- Discord webhook URL; leave empty to log through ox_lib only.
local webhook = ''

--- Sends an action to the Discord webhook and/or the ox_lib logger.
---@param id number|nil Source of the player who caused the action.
---@param type string Log category, shown as the webhook username.
---@param title string Log title.
---@param msg string Log body.
function SendLog(id, type, title, msg)
    if webhook and webhook ~= '' then
        PerformHttpRequest(webhook, function() end, 'POST', json.encode({
            username = string.format('Group System - %s', type),
            embeds = {
                {
                    title = title,
                    color = 40153,
                    author = {
                        name = 'bytecodestudios',
                    },
                    description = msg,
                    footer = {
                        text = os.date('%c'),
                    },
                }
            }
        }), { ['Content-Type'] = 'application/json' })
    end
    if GetResourceState('ox_lib') == 'started' then
        lib.logger(id or -1, title, msg)
    end
end