const { DecisionVersion, Decision } = require('../models');

exports.getVersions = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[API] getVersions called for ID: ${id}`);

        const versions = await DecisionVersion.findAll({
            where: { decision_id: id },
            order: [['version_number', 'DESC']]
        });

        console.log(`[API] Found ${versions.length} versions`);

        // Use getDataValue to explicitly extract JSON fields
        const responseData = versions.map(v => {
            const snapshotJson = v.getDataValue('snapshot_json');
            const changedFieldsJson = v.getDataValue('changed_fields_json');

            return {
                id: v.id,
                version_number: v.version_number,
                created_at: v.created_at,
                confidence_before: v.confidence_before,
                confidence_after: v.confidence_after,
                created_by: v.created_by,
                snapshot_json: snapshotJson,
                changed_fields_json: changedFieldsJson
            };
        });

        if (responseData.length > 0) {
            console.log('[API] First version snapshot_json type:', typeof responseData[0].snapshot_json);
            console.log('[API] First version snapshot_json IS NULL:', responseData[0].snapshot_json === null);
            if (responseData[0].snapshot_json) {
                console.log('[API] First version snapshot_json preview:', JSON.stringify(responseData[0].snapshot_json).substring(0, 100));
            }
        }

        res.json({ success: true, data: responseData });
    } catch (err) {
        console.error('Get Versions Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getVersionDetails = async (req, res) => {
    try {
        const { id, versionId } = req.params;
        const version = await DecisionVersion.findOne({
            where: { id: versionId, decision_id: id }
        });

        if (!version) {
            return res.status(404).json({ success: false, message: 'Version not found' });
        }

        res.json({ success: true, data: version });
    } catch (err) {
        console.error('Get Version Details Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
