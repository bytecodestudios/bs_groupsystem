function CanSeeIllegalParties()
    -- YOU CAN ADD ITEM OR ANY OTHER CHECK TO BE ABLE TO WORK IN ILLEGAL PARTY JOB
    if GetResourceState('ox_inventory') == 'started' then
        local count = exports.ox_inventory:GetItemCount('shadowmod')
        return count and count > 0
    elseif GetResourceState('tgiann-inventory') == 'started' then
        return exports['tgiann-inventory']:HasItem('shadowmod', 1)
    elseif GetResourceState('qb-inventory') == 'started' then
        return exports['qb-inventory']:HasItem('shadowmod')
    elseif GetResourceState('ps-inventory') == 'started' then
        return exports['ps-inventory']:HasItem('shadowmod')
    elseif GetResourceState('ps-inventory') == 'started' then
        return exports['ps-inventory']:HasItem('shadowmod')
    end
end