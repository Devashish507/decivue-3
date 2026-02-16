import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { teamService } from '../services/api';
import { useLayout } from '../contexts/LayoutContext';
import { Users, AlertTriangle, Activity, Shield, Plus } from 'lucide-react';
import DecisionCard from '../components/DecisionCard';
import ManageMembersModal from '../components/ManageMembersModal';
import DecisionKanban from '../components/kanban/DecisionKanban';

export default function TeamDashboard() {
    const { id } = useParams(); // Team ID
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);
    const [view, setView] = useState('list');
    const { setHideSidebar, setFullWidth } = useLayout();

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

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!teamData) return <div className="p-8">Team not found</div>;

    const { team, members, decisions, stats } = teamData;

    return (
        <>
            <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
                {/* Header - Only shown in Kanban mode */}
                {view === 'kanban' && (
                    <div className="flex-none bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setView('list')}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                                title="Back to Workspace"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-lg font-bold text-gray-900 tracking-tight">{team.name}</h1>
                        </div>
                        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowAddMember(true)} title="Manage Members">
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
                        <div className="px-6 pt-6 pb-6 space-y-6 w-full">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <StatCard
                                    label="Active Decisions"
                                    value={stats.active}
                                    icon={<Activity className="w-5 h-5 text-blue-600" />}
                                    color="bg-blue-50 border-blue-100"
                                />
                                <StatCard
                                    label="Under Review"
                                    value={stats.underReview}
                                    icon={<Users className="w-5 h-5 text-amber-600" />}
                                    color="bg-amber-50 border-amber-100"
                                />
                                <StatCard
                                    label="High Impact"
                                    value={stats.highImpact}
                                    icon={<AlertTriangle className="w-5 h-5 text-purple-600" />}
                                    color="bg-purple-50 border-purple-100"
                                />
                                <StatCard
                                    label="Governance Locked"
                                    value={stats.governanceLocked}
                                    icon={<Shield className="w-5 h-5 text-red-600" />}
                                    color="bg-red-50 border-red-100"
                                />
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Main Content: Decision List */}
                                <div className="space-y-4 w-full">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-gray-900">Team Decisions</h2>
                                        <button
                                            onClick={() => setView('kanban')}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                            </svg>
                                            Kanban Board
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {decisions.length === 0 ? (
                                            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                                                <p className="text-gray-500">No decisions yet.</p>
                                            </div>
                                        ) : (
                                            decisions.map(decision => (
                                                <DecisionCard key={decision.id} decision={decision} />
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
        </>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className={`bg-white rounded-2xl border p-5 flex items-center justify-between shadow-sm transition-shadow hover:shadow-md ${color.replace('bg-', 'border-')}`}>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${color.split(' ')[0]} ${color.split(' ')[0].replace('bg-', 'text-').replace('50', '600')}`}>
                {icon}
            </div>
        </div>
    );
}
