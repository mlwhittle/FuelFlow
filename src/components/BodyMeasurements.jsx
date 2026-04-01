import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Ruler, Plus, Calendar, Activity, X, Camera, Image as ImageIcon } from 'lucide-react';
import PageScripture from './PageScripture';
import './BodyMeasurements.css';

const BodyMeasurements = () => {
    const { measurementHistory, addMeasurementEntry, deleteMeasurementEntry } = useApp();
    const [showInput, setShowInput] = useState(false);
    const [weightUnit, setWeightUnit] = useState('lbs'); // Default to lbs
    const [photoDataURL, setPhotoDataURL] = useState(null);
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        weight: '',
        waist: '',
        hips: '',
        chest: '',
        arms: '',
        thighs: ''
    });

    const getLatest = () => measurementHistory.length > 0 ? measurementHistory[measurementHistory.length - 1] : null;
    const latest = getLatest();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Compress image using canvas before storing in localStorage
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Max dimensions to save space
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to 70% quality JPEG
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setPhotoDataURL(dataUrl);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!formData.weight && !formData.waist && !formData.hips && !formData.chest && !formData.arms && !formData.thighs && !photoDataURL) {
            return; // Don't save completely empty
        }

        const metricsToSave = {};
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                let val = parseFloat(formData[key]);
                // If they entered weight in lbs, convert and save as kg to keep backend consistent
                if (key === 'weight' && weightUnit === 'lbs') {
                    val = val / 2.20462;
                }
                metricsToSave[key] = val;
            }
        });

        if (photoDataURL) {
            metricsToSave.photo = photoDataURL;
        }

        addMeasurementEntry(metricsToSave);
        setFormData({ weight: '', waist: '', hips: '', chest: '', arms: '', thighs: '' });
        setPhotoDataURL(null);
        setShowInput(false);
    };

    const getDifference = (key) => {
        if (measurementHistory.length < 2) return null;
        let current = measurementHistory[measurementHistory.length - 1][key];
        let previous = measurementHistory[measurementHistory.length - 2][key];
        
        if (current === undefined || previous === undefined) return null;
        
        if (key === 'weight' && weightUnit === 'lbs') {
            current = current * 2.20462;
            previous = previous * 2.20462;
        }

        const diff = (current - previous).toFixed(1);
        return diff > 0 ? `+${diff}` : diff;
    };

    const metricsList = [
        { id: 'weight', label: 'Weight', unit: weightUnit },
        { id: 'waist', label: 'Waist', unit: 'in' },
        { id: 'hips', label: 'Hips', unit: 'in' },
        { id: 'chest', label: 'Chest', unit: 'in' },
        { id: 'arms', label: 'Arms', unit: 'in' },
        { id: 'thighs', label: 'Thighs', unit: 'in' }
    ];

    return (
        <div className="body-measurements animate-fadeIn">
            <PageScripture 
                verse="Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own."
                reference="1 Corinthians 6:19"
            />
            <div className="measurements-header">
                <div>
                    <h1>Body Measurements <Ruler size={28} style={{ display: 'inline', color: 'var(--primary-500)', verticalAlign: 'middle', marginLeft: '8px' }}/></h1>
                    <p>Track your body composition and weight loss journey</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="unit-toggle" style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden' }}>
                        <button 
                            className={`unit-btn ${weightUnit === 'lbs' ? 'active' : ''}`}
                            onClick={() => setWeightUnit('lbs')}
                            style={{ padding: '6px 12px', border: 'none', background: weightUnit === 'lbs' ? 'var(--primary-500)' : 'transparent', color: weightUnit === 'lbs' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                        >
                            lbs
                        </button>
                        <button 
                            className={`unit-btn ${weightUnit === 'kg' ? 'active' : ''}`}
                            onClick={() => setWeightUnit('kg')}
                            style={{ padding: '6px 12px', border: 'none', background: weightUnit === 'kg' ? 'var(--primary-500)' : 'transparent', color: weightUnit === 'kg' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                        >
                            kg
                        </button>
                    </div>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => setShowInput(!showInput)}
                    >
                        {showInput ? <X size={20} /> : <Plus size={20} />}
                        {showInput ? 'Cancel' : 'Log New Entry'}
                    </button>
                </div>
            </div>

            {showInput && (
                <div className="measurement-input-card card slide-down">
                    <h3>Log Today's Metrics</h3>
                    <p className="subtitle">Enter as many or as few as you like. Leave blank if skipping.</p>
                    
                    <div className="metrics-grid">
                        {metricsList.map(metric => (
                            <div key={metric.id} className="form-group">
                                <label>{metric.label} ({metric.unit})</label>
                                <input
                                    type="number"
                                    name={metric.id}
                                    className="form-input"
                                    value={formData[metric.id]}
                                    onChange={handleInputChange}
                                    placeholder={`e.g. ${metric.id === 'weight' ? '70.5' : '32'}`}
                                    step="0.1"
                                    min="0"
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div className="photo-upload-section">
                        <label>Progress Photo (Optional)</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            style={{ display: 'none' }} 
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                        />
                        <div className="photo-upload-actions">
                            {!photoDataURL ? (
                                <button className="btn btn-secondary photo-btn" onClick={() => fileInputRef.current.click()}>
                                    <Camera size={20} />
                                    Take or Choose Photo
                                </button>
                            ) : (
                                <div className="photo-preview-container">
                                    <img src={photoDataURL} alt="Progress Preview" className="photo-preview" />
                                    <button className="btn-icon danger remove-photo-btn" onClick={() => setPhotoDataURL(null)}>
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="input-actions" style={{ marginTop: 'var(--space-xl)' }}>
                        <button className="btn btn-primary btn-block" onClick={handleSave}>
                            Save Measurements
                        </button>
                    </div>
                </div>
            )}

            <div className="current-stats-grid">
                {metricsList.map(metric => {
                    let value = latest?.[metric.id];
                    
                    if (value !== undefined && value !== null && metric.id === 'weight' && weightUnit === 'lbs') {
                        value = (value * 2.20462).toFixed(1);
                    } else if (value !== undefined && value !== null) {
                        value = value.toFixed(1);
                    }
                    const diff = getDifference(metric.id);
                    const isPositive = diff && parseFloat(diff) > 0;
                    
                    return (
                        <div key={metric.id} className="stat-card card">
                            <h4 className="stat-card-title">{metric.label}</h4>
                            <div className="stat-card-value">
                                {value !== undefined && value !== null ? (
                                    <>
                                        {value} <span className="stat-unit">{metric.unit}</span>
                                    </>
                                ) : (
                                    <span className="stat-empty">-</span>
                                )}
                            </div>
                            {diff && (
                                <div className={`stat-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
                                    {diff} {metric.unit} since last log
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="history-section card">
                <div className="history-header">
                    <h3><Calendar size={20} /> Measurement History</h3>
                </div>
                
                {measurementHistory.length === 0 ? (
                    <div className="empty-state">
                        <Activity size={48} className="empty-icon" />
                        <p>No measurements logged yet. Start tracking your progress today!</p>
                    </div>
                ) : (
                    <div className="history-table-container">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Photo</th>
                                    <th>Weight ({weightUnit})</th>
                                    <th>Waist (in)</th>
                                    <th>Hips (in)</th>
                                    <th>Chest (in)</th>
                                    <th>Arms (in)</th>
                                    <th>Thighs (in)</th>
                                    <th className="align-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...measurementHistory].reverse().map(entry => (
                                    <tr key={entry.id}>
                                        <td>
                                            {new Date(entry.date).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            {entry.photo ? (
                                                <div className="history-thumbnail-wrap">
                                                    <img src={entry.photo} alt="Progress thumbnail" className="history-thumbnail" />
                                                </div>
                                            ) : (
                                                <div className="history-thumbnail-empty">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </td>
                                        <td>{entry.weight ? (weightUnit === 'lbs' ? (entry.weight * 2.20462).toFixed(1) : entry.weight.toFixed(1)) : '-'}</td>
                                        <td>{entry.waist || '-'}</td>
                                        <td>{entry.hips || '-'}</td>
                                        <td>{entry.chest || '-'}</td>
                                        <td>{entry.arms || '-'}</td>
                                        <td>{entry.thighs || '-'}</td>
                                        <td className="align-right">
                                            <button 
                                                className="btn-icon danger" 
                                                onClick={() => deleteMeasurementEntry(entry.id)}
                                                title="Delete entry"
                                            >
                                                <X size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BodyMeasurements;
