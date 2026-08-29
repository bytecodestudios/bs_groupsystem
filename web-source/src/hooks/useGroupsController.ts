import { useState, useEffect } from 'react';
import { fetchNui } from '../utils/fetchNui';
import { useNuiEvent } from './useNuiEvent';
import { Group } from '../utils/types';
import { transformParties } from '../utils/groupUtils';
import { useNotifications } from '../components/misc/Notification';
import { useLocale } from './useLocale';

/**
 * Shared controller for the Groups app. Holds all the group state and the NUI
 * handlers so the laptop (`components/group`) and phone (`components/phone`)
 * front-ends can render completely different UIs on top of identical behaviour.
 */
export function useGroupsController() {
    const [isLoading, setIsLoading] = useState(true);
    const [publicGroups, setPublicGroups] = useState<Group[]>([]);
    const [myGroup, setMyGroup] = useState<Group | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [isVpnConnected, setIsVpnConnected] = useState(false);
    const [hasVpnAccess, setHasVpnAccess] = useState(true);
    const [citizenId, setCitizenId] = useState<string | null>(null);

    const { addNotification } = useNotifications();
    const { t } = useLocale();

    useEffect(() => {
        if (myGroup && selectedGroup && myGroup.id === selectedGroup.id) {
            setSelectedGroup(myGroup);
        }
    }, [myGroup]);

    const fetchGroupsData = async () => {
        // The parties payload doesn't depend on the citizen id (it's used purely
        // client-side to shape the result), so fetch both in parallel instead of
        // paying two sequential round-trips on every open.
        const needCitizen = !citizenId;
        const [playerData, response] = await Promise.all([
            needCitizen
                ? fetchNui<{ citizenid: string }>("bsgroup:nui:getPlayerData", {})
                : Promise.resolve(null),
            fetchNui<{ status: boolean, data: { parties: any, canSeeIllegalParties: boolean } }>("bsgroup:nui:fetchParties", {}),
        ]);

        let currentCitizenId = citizenId;
        if (needCitizen && playerData?.citizenid) {
            currentCitizenId = playerData.citizenid;
            setCitizenId(currentCitizenId);
        }

        if (!currentCitizenId) return;

        if (response?.status) {
            const { groups, myGroup } = transformParties(response.data.parties, currentCitizenId, response.data.canSeeIllegalParties);
            setPublicGroups(groups);
            setMyGroup(myGroup);
        }
    };

    useEffect(() => {
        setIsLoading(true);

        fetchNui<{ hasAccess: boolean, isConnected: boolean }>('bsgroup:nui:checkVpnAccess', {}).then((response) => {
            if (response) {
                setHasVpnAccess(response.hasAccess ?? true);
                setIsVpnConnected(response.isConnected ?? false);
            }
        });

        fetchGroupsData().finally(() => setIsLoading(false));
    }, []);

    const handleVpnToggle = async (connect: boolean) => {
        const response = await fetchNui<{ success: boolean, connected: boolean, msg?: string }>('bsgroup:nui:toggleVpn', { connect });
        if (response?.success) {
            setIsVpnConnected(response.connected);
            fetchGroupsData();
        } else if (response?.msg) {
            addNotification('error', t('ui.groups.notif_vpn_error'), response.msg, 5000);
        }
    };

    useNuiEvent<any>('refreshParties', (response) => {
        if (citizenId) {
            const { groups, myGroup } = transformParties(response.data, citizenId, response.canSeeIllegalParties);
            setPublicGroups(groups);
            setMyGroup(myGroup);
        } else {
            fetchGroupsData();
        }
    });

    useNuiEvent<any>('refreshTasksDetail', (response) => {
        if (citizenId) {
            const { groups, myGroup } = transformParties(response.data, citizenId, response.canSeeIllegalParties);
            setPublicGroups(groups);
            setMyGroup(myGroup);
        } else {
            fetchGroupsData();
        }
    });

    useNuiEvent<any>('backToParties', (response) => {
        if (citizenId) {
            const { groups, myGroup } = transformParties(response.data, citizenId, response.canSeeIllegalParties);
            setPublicGroups(groups);
            setMyGroup(myGroup);
            if (!myGroup) setSelectedGroup(null);
        } else {
            fetchGroupsData();
            setSelectedGroup(null);
        }
    });

    const handleCreateGroup = async (data: { name: string; joinType: Group['joinType']; maxMembers: number; isIllegal?: boolean; }) => {
        const response = await fetchNui<{ status: boolean, msg: string }>("bsgroup:nui:createParty", {
            partyName: data.name,
            maxMembers: data.maxMembers,
            joinType: data.joinType
        });
        if (response?.status) {
            fetchGroupsData();
            addNotification('success', t('ui.groups.notif_group_established'), t('ui.groups.notif_created_format', data.name));
            return true;
        }
        addNotification('error', t('ui.groups.notif_failed'), response?.msg || t('ui.groups.notif_could_not_create'));
        return false;
    };

    const handleRequestToJoin = async (groupId: string) => {
        const response = await fetchNui<{ status: boolean, msg: string }>("bsgroup:nui:requestJoinParty", { partyId: groupId });
        if (response?.status) {
            setSentRequests(prev => new Set(prev).add(groupId));
            addNotification('info', t('ui.groups.notif_application_sent'), t('ui.groups.notif_request_submitted'));
        } else {
            addNotification('error', t('ui.groups.notif_request_failed'), response?.msg || t('ui.groups.notif_could_not_send'));
        }
    };

    const handleResolveJobOffer = async (accept: boolean) => {
        const response = await fetchNui<{ status: boolean, msg?: string }>("bsgroup:nui:resolveJobOffer", {
            action: accept ? 'accept' : 'decline'
        });
        if (response?.status) {
            fetchGroupsData();
            if (accept) {
                addNotification('success', t('ui.joboffer.accepted_title'), t('ui.joboffer.accepted_desc'));
            } else {
                addNotification('info', t('ui.joboffer.declined_title'), t('ui.joboffer.declined_desc'));
            }
        } else {
            addNotification('error', t('ui.groups.notif_failed'), response?.msg || t('ui.joboffer.error_desc'));
        }
    };

    const handleUpdateGroup = async (updatedGroup: Group) => {
        await fetchGroupsData();
        setSelectedGroup(updatedGroup);
    };

    const handleDisbandOrLeave = async () => {
        if (!selectedGroup) return;
        const isLeader = selectedGroup.isLeader;
        const groupName = selectedGroup.name;

        const eventName = isLeader ? "bsgroup:nui:disbandParty" : "bsgroup:nui:leaveParty";
        const response = await fetchNui<{ status: boolean }>(eventName, { partyId: selectedGroup.id });
        if (response?.status) {
            setSelectedGroup(null);
            fetchGroupsData();
            if (isLeader) {
                addNotification('warning', t('ui.groups.notif_group_disbanded_title'), t('ui.groups.notif_group_disbanded_format', groupName));
            } else {
                addNotification('info', t('ui.groups.notif_left_group'), t('ui.groups.notif_left_group_format', groupName));
            }
        }
    };

    return {
        isLoading,
        publicGroups,
        myGroup,
        selectedGroup,
        setSelectedGroup,
        sentRequests,
        isVpnConnected,
        hasVpnAccess,
        citizenId,
        handleVpnToggle,
        handleCreateGroup,
        handleRequestToJoin,
        handleResolveJobOffer,
        handleUpdateGroup,
        handleDisbandOrLeave,
    };
}
