export const NUI_MOCKS: Record<string, any> = {
  "bsgroup:nui:getPlayerData": { citizenid: "CITIZEN_123" },
  "bsgroup:nui:getLocale": {},
  "bsgroup:nui:checkVpnAccess": { hasAccess: true, isConnected: false },
  "bsgroup:nui:fetchParties": {
    status: true,
    data: {
      canSeeIllegalParties: true,
      parties: {
        "party_1": {
          name: "Los Santos Drifters",
          leader: "CITIZEN_456",
          members: [
            { citizenid: "CITIZEN_456", name: "John Doe" },
            { citizenid: "CITIZEN_123", name: "Jane Smith" }
          ],
          maxMembers: 6,
          joinType: "Open",
          currentJob: "Vehicle Theft",
          partyTasks: [
            { name: "Scout the Location", status: "done", type: "checkbox" },
            { name: "Steal 3 cars", status: "current", type: "numerical-progress", progress: { current: 1, target: 3, unit: "cars" } },
            { name: "Deliver package", status: "pending", type: "checkbox" }
          ],
          requests: [
            { id: "CITIZEN_789", name: "Bob Builder" }
          ],
          partyType: "illegal"
        },
        "party_2": {
          name: "Garbage Collectors",
          leader: "CITIZEN_111",
          members: [
            { citizenid: "CITIZEN_111", name: "Steve Trash" }
          ],
          maxMembers: 4,
          joinType: "Request to Join",
          currentJob: true,
          partyTasks: [
            { name: "Collect Trash Bags", status: "done", type: "checkbox" },
            { name: "Clean Sector 4", status: "current", type: "numerical", progress: { current: 5, target: 10, unit: "bags" } },
            { name: "Return Trash Truck", status: "pending", type: "checkbox" }
          ],
          requests: [],
          partyType: "legal"
        }
      }
    }
  }
};
