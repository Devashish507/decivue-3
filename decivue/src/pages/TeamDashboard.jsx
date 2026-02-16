import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { teamService } from '../services/api';
import Layout from '../layouts/Layout';
import { Users, AlertTriangle, Activity, Shield, Plus } from 'lucide-react';
import DecisionCard from '../components/DecisionCard';
import ManageMembersModal from '../components/ManageMembersModal';

export default function TeamDashboard() {
    const { id } = useParams(); // Team ID
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);

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

    if (loading) return <Layout><div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>;
    if (!teamData) return <Layout><div className="p-8">Team not found</div></Layout>;

    const { team, members, decisions, stats } = teamData;

    return (
        <Layout>
            <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{team.name}</h1>
                        <p className="text-gray-500 mt-1 text-lg">{team.description}</p>
                    </div>
                    <div className="flex -space-x-3">
                        {members.slice(0, 5).map((member, i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 shadow-sm" title={member.user_name}>
                                {member.user_avatar ? <img src={member.user_avatar} alt={member.user_name} className="w-full h-full rounded-full object-cover" /> : member.user_name.charAt(0)}
                            </div>
                        ))}
                        <button className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors" onClick={() => setShowAddMember(true)}>
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        label="Active Decisions"
                        value={stats.active}
                        icon={<Activity className="w-6 h-6 text-blue-600" />}
                        color="bg-blue-50 border-blue-100"
                    />
                    <StatCard
                        label="Under Review"
                        value={stats.underReview}
                        icon={<Users className="w-6 h-6 text-amber-600" />}
                        color="bg-amber-50 border-amber-100"
                    />
                    <StatCard
                        label="High Impact"
                        value={stats.highImpact}
                        icon={<AlertTriangle className="w-6 h-6 text-purple-600" />}
                        color="bg-purple-50 border-purple-100"
                    />
                    <StatCard
                        label="Governance Locked"
                        value={stats.governanceLocked}
                        icon={<Shield className="w-6 h-6 text-red-600" />}
                        color="bg-red-50 border-red-100"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Decision List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Team Decisions</h2>
                            <div className="flex gap-2">
                                {/* Filters could go here */}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {decisions.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                                    <p className="text-gray-500">No decisions yet.</p>
                                </div>
                            ) : (
                                decisions.map(decision => (
                                    <DecisionCard key={decision.id} decision={decision} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Activity & Members */}
                    <div className="space-y-8">
                        {/* Members Panel */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
                                <button className="text-sm font-medium text-blue-600 hover:text-blue-700" onClick={() => setShowAddMember(true)}>Manage</button>
                            </div>
                            <div className="space-y-4">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                                                {member.user_avatar ? <img src={member.user_avatar} alt={member.user_name} className="w-full h-full rounded-full" /> : member.user_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{member.user_name}</p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${member.role === 'Owner' ? 'bg-indigo-100 text-indigo-800' :
                                                    member.role === 'Reviewer' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {member.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity Feed placeholder */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-6">
                                <div className="text-sm text-gray-500 text-center py-4">Effectively connected to Decision Audit Logs</div>
                            </div>
                        </div>
                    </div>
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
        </Layout>
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
