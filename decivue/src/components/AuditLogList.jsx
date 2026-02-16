import React from 'react';
import { formatDate } from '../utils/helpers';

const AuditLogList = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No governance activity recorded yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {logs.map((log) => (
                <div key={log.id} className="flex gap-3 text-sm">
                    <div className="mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${log.action === 'APPROVE' ? 'bg-green-100 text-green-700' :
                                log.action === 'REJECT' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                            }`}>
                            {log.user_name ? log.user_name.charAt(0) : 'S'}
                        </div>
                    </div>
                    <div className="flex-1 bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="font-medium text-gray-900">
                                {log.user_name} <span className="text-gray-500 font-normal">
                                    {getActionLabel(log.action)}
                                </span>
                            </p>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {formatDate(log.createdAt || log.timestamp)}
                            </span>
                        </div>
                        {log.justification && (
                            <p className="text-gray-600 mt-1 bg-gray-50 p-2 rounded text-xs select-all">
                                "{log.justification}"
                            </p>
                        )}
                        {log.details && (
                            <details className="mt-2 text-xs text-gray-500 cursor-pointer">
                                <summary>View Details</summary>
                                <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

function getActionLabel(action) {
    switch (action) {
        case 'REQUEST_APPROVAL': return 'requested approval';
        case 'APPROVE': return 'approved the decision';
        case 'REJECT': return 'rejected the decision';
        case 'UPDATE': return 'updated the decision';
        default: return action.toLowerCase().replace('_', ' ');
    }
}

export default AuditLogList;
