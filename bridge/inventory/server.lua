function CanSeeIllegalParties(source)
    -- YOU CAN ADD ITEM OR ANY OTHER CHECK TO BE ABLE TO WORK IN ILLEGAL PARTY JOB
    if GetResourceState('ox_inventory') == 'started' then
        local count = exports.ox_inventory:GetItemCount(source, 'shadowmod')
        return count and count > 0
    elseif GetResourceState('tgiann-inventory') == 'started' then
        local count = exports['tgiann-inventory']:GetItemCount(source, 'shadowmod')
        return count and count > 0
    elseif GetResourceState('qb-inventory') == 'started' then
        return exports['qb-inventory']:HasItem(source, 'shadowmod')
    elseif GetResourceState('ps-inventory') == 'started' then
        return exports['ps-inventory']:HasItem(source, 'shadowmod')
    elseif GetResourceState('ps-inventory') == 'started' then
        return exports['ps-inventory']:HasItem(source, 'shadowmod')
    end
end