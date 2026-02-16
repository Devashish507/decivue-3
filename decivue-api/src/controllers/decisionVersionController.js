const { DecisionVersion, Decision } = require('../models');

exports.getVersions = async (req, res) => {
    try {
        const { id } = req.params;
        const versions = await DecisionVersion.findAll({
            where: { decision_id: id },
            order: [['version_number', 'DESC']],
            attributes: ['id', 'version_number', 'created_at', 'confidence_before', 'confidence_after', 'created_by']
        });

        res.json({ success: true, data: versions });
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
