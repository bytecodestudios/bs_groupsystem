--- Whether a player owns the item required to see and run illegal jobs.
---@param source number
---@return boolean|nil
function CanSeeIllegalParties(source)
    -- Swap this for any item or condition your server uses to gate illegal jobs.
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
    end
end
