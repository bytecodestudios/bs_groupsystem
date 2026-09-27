export const NUI_MOCKS: Record<string, any> = {
  "bsgroup:nui:getPlayerData": { citizenid: "CITIZEN_123" },
  "bsgroup:nui:getLocale": {},
  "bsgroup:nui:checkVpnAccess": { hasAccess: true, isConnected: true },
  "bsgroup:nui:toggleVpn": { success: true, connected: true },
  "bsgroup:nui:getNearbyPlayers": [
    { source: 1, name: "Michael De Santa", citizenid: "CITIZEN_001" },
    { source: 2, name: "Franklin Clinton", citizenid: "CITIZEN_002" },
    { source: 3, name: "Trevor Philips", citizenid: "CITIZEN_003" },
    { source: 4, name: "Lamar Davis", citizenid: "CITIZEN_004" },
    { source: 5, name: "Wade Hebert", citizenid: "CITIZEN_005" }
  ],
  "bsgroup:nui:invitePlayer": { status: true },
  "bsgroup:nui:createParty": { status: true, msg: "Group created successfully" },
  "bsgroup:nui:requestJoinParty": { status: true, msg: "Request submitted" },
  "bsgroup:nui:resolveJobOffer": { status: true },
  "bsgroup:nui:processRequest": { status: true },
  "bsgroup:nui:promoteLeader": { status: true },
  "bsgroup:nui:kickMember": { status: true },
  "bsgroup:nui:disbandParty": { status: true },
  "bsgroup:nui:leaveParty": { status: true },
  "bsgroup:nui:closeUI": { status: true },
  "bsgroup:nui:updateJoinType": { status: true },
  "bsgroup:nui:updateMaxMembers": { status: true },
  "bsgroup:nui:updatePartyName": { status: true },
  "bsgroup:nui:appOpened": { status: true },
  "bsgroup:nui:appClosed": { status: true },
  "bsgroup:nui:fetchParties": {
    status: true,
    data: {
      canSeeIllegalParties: true,
      parties: {
        "party_1": {
          name: "Los Santos Drifters",
          leader: "CITIZEN_123",
          members: [
            { citizenid: "CITIZEN_123", name: "Jane Smith" },
            { citizenid: "CITIZEN_456", name: "Marcus Vance" },
            { citizenid: "CITIZEN_222", name: "Mia Wong" },
            { citizenid: "CITIZEN_333", name: "Diego Alvarez" }
          ],
          maxMembers: 6,
          joinType: "Request to Join",
          currentJob: "Pacific Standard Heist",
          partyTasks: [
            { name: "Scout Vault Entrance & Security Grid", status: "done", type: "checkbox" },
            { name: "Steal 3 Armored Kurumas", status: "current", type: "numerical-progress", progress: { current: 2, target: 3, unit: "cars" } },
            { name: "Disable Security Cameras", status: "current", type: "numerical", progress: { current: 4, target: 6, unit: "cams" } },
            { name: "Acquire Military-Grade Thermite", status: "pending", type: "checkbox" },
            { name: "Escape to Sandy Shores Airstrip", status: "pending", type: "checkbox" }
          ],
          jobOffer: {
            job: "pacific_standard",
            title: "Pacific Standard Vault Job",
            description: "Lester's contact delivered blueprints for the underground vault. Prep phase completed.",
            confirmLabel: "Accept Job",
            cancelLabel: "Decline"
          },
          requests: [
            { id: "CITIZEN_789", name: "Bob Builder" },
            { id: "CITIZEN_501", name: "Franklin Clinton" },
            { id: "CITIZEN_502", name: "Niko Bellic" }
          ],
          partyType: "illegal"
        },
        "party_2": {
          name: "Downtown Sanitation Crew",
          leader: "CITIZEN_111",
          members: [
            { citizenid: "CITIZEN_111", name: "Steve Trash" },
            { citizenid: "CITIZEN_112", name: "Carl Johnson" }
          ],
          maxMembers: 4,
          joinType: "Request to Join",
          currentJob: false,
          partyTasks: [
            { name: "Collect Trash Bags in Sector 1", status: "done", type: "checkbox" },
            { name: "Clean Sector 4 Alleyways", status: "current", type: "numerical", progress: { current: 5, target: 10, unit: "bags" } },
            { name: "Return Trashmaster to Depot", status: "pending", type: "checkbox" }
          ],
          requests: [],
          partyType: "legal"
        },
        "party_3": {
          name: "Gruppe Sechs Security Transit",
          leader: "CITIZEN_301",
          members: [
            { citizenid: "CITIZEN_301", name: "Mike Vance" },
            { citizenid: "CITIZEN_302", name: "Lucas Gray" },
            { citizenid: "CITIZEN_303", name: "Sarah Jenkins" }
          ],
          maxMembers: 4,
          joinType: "Request to Join",
          currentJob: "Armored Route 4B",
          partyTasks: [
            { name: "Inspect Armored Stockade", status: "done", type: "checkbox" },
            { name: "Collect 5 Cash Depository Bags", status: "current", type: "numerical-progress", progress: { current: 3, target: 5, unit: "bags" } },
            { name: "Deliver to Central Bank Vault", status: "pending", type: "checkbox" }
          ],
          requests: [],
          partyType: "legal"
        },
        "party_4": {
          name: "Redline Underground Racing",
          leader: "CITIZEN_401",
          members: [
            { citizenid: "CITIZEN_401", name: "Dominic Toretto" },
            { citizenid: "CITIZEN_402", name: "Brian O'Conner" },
            { citizenid: "CITIZEN_403", name: "Letty Ortiz" }
          ],
          maxMembers: 6,
          joinType: "Request to Join",
          currentJob: false,
          partyTasks: [],
          requests: [
            { id: "CITIZEN_404", name: "Roman Pearce" }
          ],
          partyType: "illegal"
        },
        "party_5": {
          name: "Downtown Tow & Recovery",
          leader: "CITIZEN_501",
          members: [
            { citizenid: "CITIZEN_501", name: "Tonya Wiggins" }
          ],
          maxMembers: 3,
          joinType: "Request to Join",
          currentJob: false,
          partyTasks: [],
          requests: [],
          partyType: "legal"
        },
        "party_6": {
          name: "Midnight Syndicate",
          leader: "CITIZEN_601",
          members: [
            { citizenid: "CITIZEN_601", name: "Kenji Sato" },
            { citizenid: "CITIZEN_602", name: "Tatsuya Yoshida" },
            { citizenid: "CITIZEN_603", name: "Ren Amamiya" },
            { citizenid: "CITIZEN_604", name: "Hana Song" },
            { citizenid: "CITIZEN_605", name: "Kazuma Kiryu" },
            { citizenid: "CITIZEN_606", name: "Goro Majima" }
          ],
          maxMembers: 6,
          joinType: "Invite Only",
          currentJob: false,
          partyTasks: [],
          requests: [],
          partyType: "illegal"
        },
        "party_7": {
          name: "FlyWheels Air Freight",
          leader: "CITIZEN_701",
          members: [
            { citizenid: "CITIZEN_701", name: "David Miller" },
            { citizenid: "CITIZEN_702", name: "Alice Cooper" },
            { citizenid: "CITIZEN_703", name: "Victor Stone" },
            { citizenid: "CITIZEN_704", name: "Barry Allen" }
          ],
          maxMembers: 4,
          joinType: "Closed",
          currentJob: false,
          partyTasks: [],
          requests: [],
          partyType: "legal"
        },
        "party_8": {
          name: "Vagos Cartel Operations",
          leader: "CITIZEN_801",
          members: [
            { citizenid: "CITIZEN_801", name: "Esteban Gomez" },
            { citizenid: "CITIZEN_802", name: "Mateo Silva" },
            { citizenid: "CITIZEN_803", name: "Alejandro Ruiz" },
            { citizenid: "CITIZEN_804", name: "Sofia Morales" },
            { citizenid: "CITIZEN_805", name: "Carlos Santana" }
          ],
          maxMembers: 6,
          joinType: "Invite Only",
          currentJob: "Distribution Run",
          partyTasks: [
            { name: "Pack Contraband Packages", status: "done", type: "checkbox" },
            { name: "Deliver to 5 Drop-off Points", status: "current", type: "numerical-progress", progress: { current: 3, target: 5, unit: "drops" } },
            { name: "Evade Police Surveillance", status: "pending", type: "checkbox" }
          ],
          requests: [],
          partyType: "illegal"
        },
        "party_9": {
          name: "San Andreas Medical Transport",
          leader: "CITIZEN_901",
          members: [
            { citizenid: "CITIZEN_901", name: "Dr. Sarah Connor" },
            { citizenid: "CITIZEN_902", name: "Dr. John Watson" }
          ],
          maxMembers: 5,
          joinType: "Request to Join",
          currentJob: false,
          partyTasks: [],
          requests: [],
          partyType: "legal"
        },
        "party_10": {
          name: "The Lost Brotherhood MC",
          leader: "CITIZEN_911",
          members: [
            { citizenid: "CITIZEN_911", name: "Johnny Klebitz" },
            { citizenid: "CITIZEN_912", name: "Terry Thorpe" },
            { citizenid: "CITIZEN_913", name: "Clay Simons" },
            { citizenid: "CITIZEN_914", name: "Angus Martin" }
          ],
          maxMembers: 6,
          joinType: "Request to Join",
          currentJob: false,
          partyTasks: [],
          requests: [],
          partyType: "illegal"
        },
        "party_11": {
          name: "PostOP Express Logistics",
          leader: "CITIZEN_921",
          members: [
            { citizenid: "CITIZEN_921", name: "Gary Post" },
            { citizenid: "CITIZEN_922", name: "Emma Bradley" }
          ],
          maxMembers: 4,
          joinType: "Request to Join",
          currentJob: "Postal Route 12",
          partyTasks: [
            { name: "Sort 20 Packages at Depot", status: "done", type: "checkbox" },
            { name: "Deliver Packages in Vinewood", status: "current", type: "numerical-progress", progress: { current: 7, target: 15, unit: "packages" } },
            { name: "Clock Out & Return Boxville", status: "pending", type: "checkbox" }
          ],
          requests: [],
          partyType: "legal"
        },
        "party_12": {
          name: "Dynasty 8 Executive Protection",
          leader: "CITIZEN_931",
          members: [
            { citizenid: "CITIZEN_931", name: "Charles Sterling" },
            { citizenid: "CITIZEN_932", name: "Olivia Chase" },
            { citizenid: "CITIZEN_933", name: "Daniel Craig" },
            { citizenid: "CITIZEN_934", name: "James Bond" },
            { citizenid: "CITIZEN_935", name: "Vesper Lynd" }
          ],
          maxMembers: 5,
          joinType: "Closed",
          currentJob: false,
          partyTasks: [],
          requests: [],
          partyType: "legal"
        }
      }
    }
  }
};
