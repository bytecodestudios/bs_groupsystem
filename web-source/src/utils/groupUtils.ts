import { Group } from "./types";

export const transformParties = (parties: any, myCitizenId: string, canSeeIllegalParties: boolean = false): { groups: Group[], myGroup: Group | null } => {
    const groups: Group[] = [];
    let myGroup: Group | null = null;

    Object.entries(parties).forEach(([id, party]: [string, any]) => {
        // Filter illegal parties if player can't see them
        if (party.partyType === 'illegal' && !canSeeIllegalParties) {
            // But don't filter if the player is already IN the party
            const isInParty = party.members.some((m: any) => m.citizenid === myCitizenId);
            if (!isInParty) return;
        }

        const isFull = party.members.length >= (party.maxMembers || 6);
        const isActive = party.currentJob !== false;

        const transformed: Group = {
            id,
            name: party.name,
            leader: party.leader,
            members: party.members.map((m: any) => ({
                id: m.citizenid,
                name: m.name,
                isOnline: true
            })),
            maxMembers: party.maxMembers || 6,
            joinType: party.joinType || 'Request to Join',
            status: isActive ? 'Active' : (isFull ? 'Full' : 'Recruiting'),
            partyTasks: (party.partyTasks || []).map((t: any, index: number) => ({
                id: index,
                title: t.name,
                completed: t.status === 'done',
                status: t.status || 'pending'
            })),
            requests: (party.requests || []).map((r: any) => ({
                id: r.id,
                name: r.name,
                isOnline: true
            })),
            jobOffer: party.jobOffer || null,
            isLeader: party.leader === myCitizenId
        };
        groups.push(transformed);
        if (party.members.some((m: any) => m.citizenid === myCitizenId)) {
            myGroup = transformed;
        }
    });

    return { groups, myGroup };
};

export const transformSingleGroup = (party: any, myCitizenId: string): Group => {
    const isFull = party.members.length >= (party.maxMembers || 6);
    const isActive = party.currentJob !== false;

    return {
        id: party.id || '0', 
        name: party.name,
        leader: party.leader,
        members: party.members.map((m: any) => ({
            id: m.citizenid,
            name: m.name,
            isOnline: true
        })),
        maxMembers: party.maxMembers || 6,
        joinType: party.joinType || 'Request to Join',
        status: isActive ? 'Active' : (isFull ? 'Full' : 'Recruiting'),
        partyTasks: (party.partyTasks || []).map((t: any, index: number) => ({
            id: index,
            title: t.name,
            completed: t.status === 'done',
            status: t.status || 'pending'
        })),
        requests: (party.requests || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            isOnline: true
        })),
        jobOffer: party.jobOffer || null,
        isLeader: party.leader === myCitizenId
    };
};
