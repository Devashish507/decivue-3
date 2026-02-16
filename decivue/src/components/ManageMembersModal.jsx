import React, { useState } from 'react';
import { X, Trash2, UserPlus, Shield, Check } from 'lucide-react';
import { teamService } from '../services/api';

export default function ManageMembersModal({ teamId, members = [], onClose, onUpdate }) {
    const [view, setView] = useState('list'); // 'list' or 'add'
    const [loading, setLoading] = useState(false);

    // Add Member State
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('Contributor');

    const handleAddMember = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await teamService.addMember(teamId, {
                user_id: `u-${Date.now()}`,
                user_name: name || email.split('@')[0],
                role,
                user_avatar: null
            });
            onUpdate(); // Refresh data
            setView('list'); // Go back to list
            // Reset form
            setEmail('');
            setName('');
            setRole('Contributor');
        } catch (error) {
            console.error('Failed to add member:', error);
            alert('Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await teamService.removeMember(teamId, userId);
            onUpdate();
        } catch (error) {
            console.error('Failed to remove member:', error);
            alert('Failed to remove member');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await teamService.updateMemberRole(teamId, userId, newRole);
            onUpdate();
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update role');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {view === 'list' ? 'Manage Team Members' : 'Add New Member'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {view === 'list' ? (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setView('add')}
                                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Member
                                </button>
                            </div>

                            <div className="space-y-4">
                                {members.map(member => (
                                    <div key={member.user_id} className="flex items-center justify-between group p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                                                {member.user_avatar ? <img src={member.user_avatar} alt={member.user_name} className="w-full h-full rounded-full" /> : member.user_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{member.user_name}</p>
                                                <p className="text-xs text-gray-500">Member since {new Date(member.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                                                className="text-xs font-medium border-none bg-gray-100 rounded-md py-1 pl-2 pr-6 focus:ring-0 cursor-pointer hover:bg-gray-200"
                                            >
                                                <option value="Contributor">Contributor</option>
                                                <option value="Reviewer">Reviewer</option>
                                                <option value="Owner">Owner</option>
                                            </select>

                                            <button
                                                onClick={() => handleRemoveMember(member.user_id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No members yet.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="colleague@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="Contributor">Contributor</option>
                                    <option value="Reviewer">Reviewer</option>
                                    <option value="Owner">Owner</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {role === 'Owner' && 'Can manage team settings and delete decisions.'}
                                    {role === 'Reviewer' && 'Can approve or reject governance requests.'}
                                    {role === 'Contributor' && 'Can create and edit decisions.'}
                                </p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
