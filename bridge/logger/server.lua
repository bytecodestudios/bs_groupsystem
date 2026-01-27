local webhook = ''

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