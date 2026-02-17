import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { teamService, decisionService } from '../services/api';
import { useLayout } from '../contexts/LayoutContext';
import { Users, AlertTriangle, Activity, Shield, Layout as LayoutIcon, Plus, Settings2, ArrowLeft, Layers } from 'lucide-react';
import StatCard from '../components/StatCard';
import DecisionCard from '../components/DecisionCard';
import ManageMembersModal from '../components/ManageMembersModal';
import DecisionKanban from '../components/kanban/DecisionKanban';
import AssignRoleModal from '../components/AssignRoleModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamDashboard() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);
    const [assigningRolesFor, setAssigningRolesFor] = useState(null);
    const [view, setView] = useState('list');
    const { setHideSidebar, setFullWidth } = useLayout();

    const queryParams = new URLSearchParams(location.search);
    const assignRolesId = queryParams.get('assignRoles');

    useEffect(() => {
        if (assignRolesId && teamData && teamData.decisions) {
            const decision = teamData.decisions.find(d => d.id === assignRolesId);
            if (decision && !assigningRolesFor) {
                setAssigningRolesFor(decision);
                navigate(location.pathname, { replace: true });
            }
        }
    }, [assignRolesId, teamData, location.pathname, navigate]);

    useEffect(() => {
        if (view === 'kanban') {
            setHideSidebar(true);
            setFullWidth(true);
        } else {
            setHideSidebar(false);
            setFullWidth(false);
        }
    }, [view]);

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
            fetchTeamData();
        } catch (error) {
            console.error('Error updating roles:', error);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50/50">
            <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Initializing Workspace...</p>
        </div>
    );

    if (!teamData) return (
        <div className="h-screen flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center">
                <Users className="w-10 h-10 text-slate-300" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Workspace Not Found</h2>
                <p className="text-slate-500 font-medium">The team configuration requested is currently unavailable.</p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200">
                Return to Dashboard
            </button>
        </div>
    );

    const { team, members, decisions, stats } = teamData;

    return (
        <div className="flex flex-col h-screen bg-slate-50/50 overflow-hidden">
            {/* Contextual Header */}
            <div className="flex-none bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    {view === 'kanban' ? (
                        <button
                            onClick={() => setView('list')}
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none group flex items-center gap-2">
                            {team.name}
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Team Space</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            {members.length} Intellectual Collaborators
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-1 bg-slate-100 rounded-2xl flex items-center mr-4">
                        <button
                            onClick={() => setView('list')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Summary
                        </button>
                        <button
                            onClick={() => setView('kanban')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Flow
                        </button>
                    </div>

                    <button
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        onClick={() => setShowAddMember(true)}
                    >
                        <Settings2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* View Port Area */}
            <div className="flex-1 overflow-auto relative">
                <AnimatePresence mode="wait">
                    {view === 'kanban' ? (
                        <motion.div
                            key="kanban"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="h-full bg-white"
                        >
                            <DecisionKanban decisions={decisions} onUpdate={fetchTeamData} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-8 space-y-10 max-w-[1600px] mx-auto w-full"
                        >
                            {/* Analytics Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    label="Active Strategic Nodes"
                                    value={stats.active}
                                    color="blue"
                                    icon={<Activity className="w-6 h-6" />}
                                />
                                <StatCard
                                    label="Synchronizing Reviews"
                                    value={stats.underReview}
                                    color="amber"
                                    icon={<Users className="w-6 h-6" />}
                                />
                                <StatCard
                                    label="Critical Pathways"
                                    value={stats.highImpact}
                                    color="red"
                                    icon={<AlertTriangle className="w-6 h-6" />}
                                />
                                <StatCard
                                    label="Governance Compliance"
                                    value={stats.governanceLocked}
                                    color="green"
                                    icon={<Shield className="w-6 h-6" />}
                                />
                            </div>

                            {/* Main Listing Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Team Architecture</h2>
                                        <p className="text-sm text-slate-500 font-medium">Monitoring {decisions.length} active decision matrices.</p>
                                    </div>
                                    <button
                                        onClick={() => setView('kanban')}
                                        className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all font-bold text-sm shadow-sm"
                                    >
                                        <LayoutIcon className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                        Visualize Flow
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {decisions.length === 0 ? (
                                        <div className="col-span-full py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                                                <Layers className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900">No collective intelligence found</h3>
                                            <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">Team decisions will appear here once nodes are added to this shared workspace.</p>
                                        </div>
                                    ) : (
                                        decisions.map((decision, idx) => (
                                            <motion.div
                                                key={decision.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <DecisionCard
                                                    decision={decision}
                                                    onEdit={(d) => setAssigningRolesFor(d)}
                                                />
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals & Overlays */}
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
        </div>
    );
}
