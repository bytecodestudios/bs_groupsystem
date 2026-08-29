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
          currentJob: false,
          partyTasks: [
            { name: "Steal 3 cars", status: "pending" },
            { name: "Deliver package", status: "done" }
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
          partyTasks: [],
          requests: [],
          partyType: "legal"
        }
      }
    }
  }
};
