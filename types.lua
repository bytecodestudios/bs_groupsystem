---@meta
--- Shared type definitions for the group system.

---@class PlayerData
---@field source number Server id of the player.
---@field citizenid string Unique character identifier.
---@field name string Display name of the character.

---@class PartyMember
---@field citizenid string Member's character identifier.
---@field name string Member's display name.

---@class PartyRequest
---@field id string Citizen id of the player requesting to join.
---@field name string Display name of the requesting player.

---@alias TaskStatus 'done'|'current'|'pending'
---@alias PartyType 'legal'|'illegal'
---@alias JoinType 'Request to Join'|'Invite Only'|'Closed'

---@class PartyTask
---@field name string Task label.
---@field status TaskStatus Current progress state of the task.

---@class Party
---@field members PartyMember[] Members currently in the party.
---@field leader string Citizen id of the party leader.
---@field name string Party name.
---@field maxMembers number Maximum number of members allowed.
---@field joinType JoinType How new members are allowed to join.
---@field icon string Font Awesome icon shown in the UI.
---@field currentJob string|false Active job name, or false when idle.
---@field partyType PartyType Whether the party is legal or illegal.
---@field partyTasks PartyTask[] Task list for the active job.
---@field requests PartyRequest[] Pending join requests.

---@class PartyJob
---@field icon string Icon shown when the job is active.
---@field size number Maximum concurrent parties for the job (-1 for unlimited).
---@field type PartyType Whether the job is legal or illegal.

---@class Result
---@field status boolean Whether the action succeeded.
---@field msg? string Human readable message.
---@field group? Party Party data returned to the UI when relevant.

---@class Notify
---@field icon string Icon name.
---@field title string Notification title.
---@field description string Notification body.
---@field duration? number Display duration in milliseconds.

---@class GroupBlipData
---@field entity? number Entity handle to attach the blip to.
---@field netId? number Network id of an entity to attach the blip to.
---@field radius? number Radius for radius blips.
---@field coords? vector3 World coordinates for the blip.
---@field color? number Blip color (defaults to 1).
---@field alpha? number Blip transparency (defaults to 255).
---@field sprite? number Blip sprite (defaults to 1).
---@field scale? number Blip scale (defaults to 0.7).
---@field label? string Blip label text.
---@field route? boolean Whether to draw a route to the blip.
---@field routeColor? number Color of the route line (defaults to blip color)
---@field display? number Display type of the blip (defaults to 4)
---@field category? number Category of the blip (defaults to 1)
---@field shortRange? boolean Whether the blip should only be visible at short range (defaults to true)