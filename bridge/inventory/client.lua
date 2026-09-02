--- Whether the local player owns the item required to see illegal jobs.
---@return boolean|nil
function CanSeeIllegalParties()
    -- Swap this for any item or condition your server uses to gate illegal jobs.
    if GetResourceState('ox_inventory') == 'started' then
        local count = exports.ox_inventory:GetItemCount('shadowmod')
        return count and count > 0
    elseif GetResourceState('tgiann-inventory') == 'started' then
        return exports['tgiann-inventory']:HasItem('shadowmod', 1)
    elseif GetResourceState('qb-inventory') == 'started' then
        return exports['qb-inventory']:HasItem('shadowmod')
    elseif GetResourceState('ps-inventory') == 'started' then
        return exports['ps-inventory']:HasItem('shadowmod')
    end
end
