import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { teamService, decisionService } from '../services/api';
import { useLayout } from '../contexts/LayoutContext';
import { Users, AlertTriangle, Activity, Shield } from 'lucide-react';
import StatCard from '../components/StatCard';
import DecisionCard from '../components/DecisionCard';
import ManageMembersModal from '../components/ManageMembersModal';
import DecisionKanban from '../components/kanban/DecisionKanban';
import AssignRoleModal from '../components/AssignRoleModal';

export default function TeamDashboard() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);
    const [assigningRolesFor, setAssigningRolesFor] = useState(null); // { id, title, teamMap }
    const [view, setView] = useState('list');
    const { setHideSidebar, setFullWidth } = useLayout();

    // Parse query params
    const queryParams = new URLSearchParams(location.search);
    const assignRolesId = queryParams.get('assignRoles');

    useEffect(() => {
        if (assignRolesId && teamData && teamData.decisions) {
            const decision = teamData.decisions.find(d => d.id === assignRolesId);
            if (decision && !assigningRolesFor) {
                setAssigningRolesFor(decision);
                // Clear the query param without refreshing
                navigate(location.pathname, { replace: true });
            }
        }
    }, [assignRolesId, teamData, location.pathname, navigate]);

    // Hide sidebar & go fullWidth when in kanban, restore when leaving
    useEffect(() => {
        if (view === 'kanban') {
            setHideSidebar(true);
            setFullWidth(true);
        } else {
            setHideSidebar(false);
            setFullWidth(false);
        }
    }, [view]);

    // Restore sidebar when leaving this page
    useEffect(() => {
        return () => {
            setHideSidebar(false);
            setFullWidth(false);
        };
    }, []);

    useEffect(() => {
        fetchTeamData();
    }, [id]);

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            const response = await teamService.getDashboard(id || 'default');
            setTeamData(response.data);
        } catch (error) {
            console.error('Error fetching team data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRoles = async (updatedRoles) => {
        if (!assigningRolesFor) return;
        try {
            await decisionService.updateTeamRoles(assigningRolesFor.id, updatedRoles);
            setAssigningRolesFor(null);
            fetchTeamData(); // Refresh to show new roles
        } catch (error) {
            console.error('Error updating roles:', error);
            alert('Failed to update roles: ' + error.message);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );
    if (!teamData) return <div className="p-8 text-gray-500 text-center">Team not found</div>;

    const { team, members, decisions, stats } = teamData;

    return (
        <>
            <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
                {/* Header - Only shown in Kanban mode */}
                {view === 'kanban' && (
                    <div className="flex-none bg-white border-b border-gray-100 px-6 py-2 flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setView('list')}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                                title="Back to Workspace"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-lg font-bold text-gray-900 tracking-tight">{team.name}</h1>
                        </div>
                        <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowAddMember(true)} title="Manage Members">
                            <Users className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Scrollable Content Area */}
                <div className={`flex-1 overflow-auto ${view === 'kanban' ? 'bg-white' : 'bg-gray-50'}`}>
                    {view === 'kanban' ? (
                        <div className="h-full">
                            <DecisionKanban decisions={decisions} onUpdate={fetchTeamData} />
                        </div>
                    ) : (
                        <div className="px-6 pt-6 pb-6 space-y-6 w-full animate-fade-in">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <StatCard
                                    label="Active Decisions"
                                    value={stats.active}
                                    color="blue"
                                    icon={<Activity className="w-6 h-6" />}
                                />
                                <StatCard
                                    label="Under Review"
                                    value={stats.underReview}
                                    color="amber"
                                    icon={<Users className="w-6 h-6" />}
                                />
                                <StatCard
                                    label="High Impact"
                                    value={stats.highImpact}
                                    color="purple"
                                    icon={<AlertTriangle className="w-6 h-6" />}
                                />
                                <StatCard
                                    label="Governance Locked"
                                    value={stats.governanceLocked}
                                    color="red"
                                    icon={<Shield className="w-6 h-6" />}
                                />
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Main Content: Decision List */}
                                <div className="space-y-4 w-full">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-gray-900">Team Decisions</h2>
                                        <button
                                            onClick={() => setView('kanban')}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium transition-all active:scale-[0.98]"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                            </svg>
                                            Kanban Board
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {decisions.length === 0 ? (
                                            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
                                                <p className="text-gray-500">No decisions yet.</p>
                                            </div>
                                        ) : (
                                            decisions.map(decision => (
                                                <DecisionCard
                                                    key={decision.id}
                                                    decision={decision}
                                                    onEdit={(d) => setAssigningRolesFor(d)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {showAddMember && (
                <ManageMembersModal
                    teamId={team.id}
                    members={members}
                    onClose={() => setShowAddMember(false)}
                    onUpdate={fetchTeamData}
                />
            )}
            {assigningRolesFor && (
                <AssignRoleModal
                    isOpen={!!assigningRolesFor}
                    onClose={() => setAssigningRolesFor(null)}
                    decisionId={assigningRolesFor.id}
                    currentRoles={{
                        ownerId: assigningRolesFor.teamMap?.owner_id,
                        reviewerId: assigningRolesFor.teamMap?.reviewer_id
                    }}
                    onRoleUpdate={handleUpdateRoles}
                />
            )}
        </>
    );
}
