import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as countryGuideService from '../../../services/countryGuideService';
import './CountryGuideForm.css';

const CountryGuideForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial State
    const [formData, setFormData] = useState({
        country: '',
        countryCode: '',
        region: 'Middle East',
        flagEmoji: '',
        overview: { en: '', bn: '' },
        salaryRanges: [], // { jobType, title: {en, bn}, minSalary, maxSalary, currency, period, notes: {en, bn} }
        culture: {
            language: { official: [], commonlySpoken: [] },
            religion: { primary: '', important: { en: '', bn: '' } },
            customs: { dressCode: { en: '', bn: '' }, doAndDonts: { dos: [], donts: [] } }
        },
        legalRights: {
            workerProtections: []
        },
        civilianRules: {
            prohibitedItems: [],
            photographyRestrictions: { en: '', bn: '' },
            internetLaws: { en: '', bn: '' }
        },
        drivingGuidelines: {
            licenseRequired: true,
            drivingSide: 'right',
            speedLimits: { urban: '', highway: '', unit: 'km/h' },
            bloodAlcoholLimit: { limit: 0, notes: { en: '', bn: '' } },
            penalties: []
        },
        emergencyContacts: {
            bangladeshiEmbassy: { phone: [], address: { en: '', bn: '' }, emergencyHotline: '' },
            localEmergencyServices: { police: '', ambulance: '', fire: '' }
        },
        livingCosts: {
            currency: '',
            accommodation: { averageRent: { min: 0, max: 0 } },
            food: { monthlyEstimate: { min: 0, max: 0 } }
        }
    });

    const [activeSections, setActiveSections] = useState({
        basic: true,
        salary: false,
        culture: false,
        legal: false,
        civilian: false,
        driving: false,
        emergency: false,
        living: false
    });

    useEffect(() => {
        if (isEditMode) {
            loadGuide();
        }
    }, [id]);

    const loadGuide = async () => {
        try {
            setLoading(true);
            const allRes = await countryGuideService.getAllGuides({ limit: 200 });
            const found = allRes.data.find(g => g._id === id);
            if (found) {
                setFormData(prev => ({
                    ...prev,
                    ...found,
                    civilianRules: { ...prev.civilianRules, ...found.civilianRules },
                    drivingGuidelines: { ...prev.drivingGuidelines, ...found.drivingGuidelines },
                    salaryRanges: found.salaryRanges || [],
                    legalRights: { ...prev.legalRights, ...found.legalRights, workerProtections: found.legalRights?.workerProtections || [] }
                }));
            } else {
                setError('Guide not found');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load guide data');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setActiveSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Generic Update Item Field
    const updateItemField = (path, index, fieldPath, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            let current = newData;
            const parts = path.split('.');
            for (let i = 0; i < parts.length; i++) {
                current = current[parts[i]];
            }
            let item = current[index];
            const fieldParts = fieldPath.split('.');
            for (let i = 0; i < fieldParts.length - 1; i++) {
                if (!item[fieldParts[i]]) item[fieldParts[i]] = {};
                item = item[fieldParts[i]];
            }
            item[fieldParts[fieldParts.length - 1]] = value;
            return newData;
        });
    };

    // Generic Change Handler
    const updateField = (path, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            let current = newData;
            const parts = path.split('.');
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return newData;
        });
    };

    const addItem = (path, itemTemplate) => {
        setFormData(prev => {
            const newData = { ...prev };
            let current = newData;
            const parts = path.split('.');
            for (let i = 0; i < parts.length; i++) {
                if (!current[parts[i]]) current[parts[i]] = [];
                current = current[parts[i]];
            }
            current.push(itemTemplate);
            return newData;
        });
    };

    const removeItem = (path, index) => {
        setFormData(prev => {
            const newData = { ...prev };
            let current = newData;
            const parts = path.split('.');
            for (let i = 0; i < parts.length; i++) {
                current = current[parts[i]];
            }
            current.splice(index, 1);
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                await countryGuideService.updateGuide(id, formData);
            } else {
                await countryGuideService.createGuide(formData);
            }
            navigate('/admin/country-guides');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to save guide');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.country) {
        return <div className="admin-form-container">Loading...</div>;
    }

    return (
        <div className="admin-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Country Guide' : 'Create New Country Guide'}</h1>
                <button onClick={() => navigate('/admin/country-guides')} className="btn-secondary">
                    Cancel
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('basic')}>
                        <h2>Basic Information</h2>
                        <span>{activeSections.basic ? '▼' : '▶'}</span>
                    </div>
                    {activeSections.basic && (
                        <div className="section-content">
                            <div className="form-grid-2">
                                <div className="form-group"><label>Country Name</label><input className="form-control" value={formData.country} onChange={(e) => updateField('country', e.target.value)} required /></div>
                                <div className="form-group"><label>Country Code</label><input className="form-control" value={formData.countryCode} onChange={(e) => updateField('countryCode', e.target.value)} maxLength="2" style={{ textTransform: 'uppercase' }} required /></div>
                                <div className="form-group"><label>Region</label><input className="form-control" value={formData.region} onChange={(e) => updateField('region', e.target.value)} /></div>
                                <div className="form-group"><label>Flag Emoji</label><input className="form-control" value={formData.flagEmoji} onChange={(e) => updateField('flagEmoji', e.target.value)} /></div>
                            </div>
                            <div className="form-group"><label>Overview (EN)</label><textarea className="form-control" value={formData.overview.en} onChange={(e) => updateField('overview.en', e.target.value)} /></div>
                            <div className="form-group"><label>Overview (BN)</label><textarea className="form-control" value={formData.overview.bn} onChange={(e) => updateField('overview.bn', e.target.value)} /></div>
                        </div>
                    )}
                </div>

                {/* Salary Ranges */}
                <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('salary')}>
                        <h2>Salary Ranges</h2>
                        <span>{activeSections.salary ? '▼' : '▶'}</span>
                    </div>
                    {activeSections.salary && (
                        <div className="section-content">
                            {formData.salaryRanges.map((item, idx) => (
                                <div key={idx} className="dynamic-list-item">
                                    <button type="button" className="remove-item-btn" onClick={() => removeItem('salaryRanges', idx)}>×</button>
                                    <div className="form-grid-2">
                                        <div className="form-group"><label>Job Type</label><input className="form-control" value={item.jobType} onChange={(e) => updateItemField('salaryRanges', idx, 'jobType', e.target.value)} /></div>
                                        <div className="form-group"><label>Currency</label><input className="form-control" value={item.currency} onChange={(e) => updateItemField('salaryRanges', idx, 'currency', e.target.value)} /></div>
                                    </div>
                                    <div className="form-grid-2">
                                        <div className="form-group"><label>Min</label><input type="number" className="form-control" value={item.minSalary} onChange={(e) => updateItemField('salaryRanges', idx, 'minSalary', Number(e.target.value))} /></div>
                                        <div className="form-group"><label>Max</label><input type="number" className="form-control" value={item.maxSalary} onChange={(e) => updateItemField('salaryRanges', idx, 'maxSalary', Number(e.target.value))} /></div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="add-item-btn" onClick={() => addItem('salaryRanges', { jobType: '', minSalary: 0, maxSalary: 0, currency: '', period: 'monthly', title: { en: '', bn: '' } })}>+ Add Range</button>
                        </div>
                    )}
                </div>

                {/* Civilian Rules */}
                <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('civilian')}>
                        <h2>⚖️ Civilian Rules</h2>
                        <span>{activeSections.civilian ? '▼' : '▶'}</span>
                    </div>
                    {activeSections.civilian && (
                        <div className="section-content">
                            {formData.civilianRules?.prohibitedItems?.map((item, idx) => (
                                <div key={idx} className="dynamic-list-item">
                                    <button type="button" className="remove-item-btn" onClick={() => removeItem('civilianRules.prohibitedItems', idx)}>×</button>
                                    <div className="form-grid-2">
                                        <div className="form-group"><label>Item (EN)</label><input className="form-control" value={item.item.en} onChange={(e) => updateItemField('civilianRules.prohibitedItems', idx, 'item.en', e.target.value)} /></div>
                                        <div className="form-group"><label>Penalty (EN)</label><input className="form-control" value={item.penalty.en} onChange={(e) => updateItemField('civilianRules.prohibitedItems', idx, 'penalty.en', e.target.value)} /></div>
                                    </div>
                                    <div className="form-group">
                                        <label>Severity</label>
                                        <div className="severity-selector">
                                            {['low', 'medium', 'high', 'critical'].map(sev => (
                                                <div key={sev}
                                                    className={`severity-option ${item.severity === sev ? 'selected' : ''}`}
                                                    style={{ color: sev === 'critical' ? 'red' : sev === 'high' ? 'orange' : sev === 'medium' ? '#d69e2e' : 'green' }}
                                                    onClick={() => updateItemField('civilianRules.prohibitedItems', idx, 'severity', sev)}
                                                >
                                                    {sev.toUpperCase()}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="add-item-btn" onClick={() => addItem('civilianRules.prohibitedItems', { item: { en: '', bn: '' }, penalty: { en: '', bn: '' }, severity: 'medium' })}>+ Add Prohibited Item</button>
                        </div>
                    )}
                </div>

                {/* Driving Guidelines */}
                <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('driving')}>
                        <h2>🚗 Driving</h2>
                        <span>{activeSections.driving ? '▼' : '▶'}</span>
                    </div>
                    {activeSections.driving && (
                        <div className="section-content">
                            <div className="form-grid-3">
                                <div className="form-group"><label>License Required</label><select className="form-control" value={formData.drivingGuidelines?.licenseRequired?.toString()} onChange={(e) => updateField('drivingGuidelines.licenseRequired', e.target.value === 'true')}><option value="true">Yes</option><option value="false">No</option></select></div>
                                <div className="form-group"><label>Driving Side</label><select className="form-control" value={formData.drivingGuidelines?.drivingSide} onChange={(e) => updateField('drivingGuidelines.drivingSide', e.target.value)}><option value="right">Right</option><option value="left">Left</option></select></div>
                                <div className="form-group"><label>Speed Limit (Urban)</label><input type="number" className="form-control" value={formData.drivingGuidelines?.speedLimits?.urban || ''} onChange={(e) => updateField('drivingGuidelines.speedLimits.urban', Number(e.target.value))} /></div>
                            </div>
                            <button type="button" className="add-item-btn" onClick={() => addItem('drivingGuidelines.penalties', { violation: { en: '', bn: '' }, penalty: { en: '', bn: '' }, severity: 'medium' })}>+ Add Penalty</button>
                        </div>
                    )}
                </div>

                {/* Emergency Contacts */}
                <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('emergency')}><h2>Emergency Contacts</h2><span>{activeSections.emergency ? '▼' : '▶'}</span></div>
                    {activeSections.emergency && (
                        <div className="section-content">
                            <div className="form-group"><label>Police</label><input className="form-control" value={formData.emergencyContacts.localEmergencyServices.police} onChange={(e) => updateField('emergencyContacts.localEmergencyServices.police', e.target.value)} /></div>
                            <div className="form-group"><label>Ambulance</label><input className="form-control" value={formData.emergencyContacts.localEmergencyServices.ambulance} onChange={(e) => updateField('emergencyContacts.localEmergencyServices.ambulance', e.target.value)} /></div>
                            <div className="form-group"><label>Embassy Hotline</label><input className="form-control" value={formData.emergencyContacts.bangladeshiEmbassy.emergencyHotline} onChange={(e) => updateField('emergencyContacts.bangladeshiEmbassy.emergencyHotline', e.target.value)} /></div>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Country Guide'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CountryGuideForm;
