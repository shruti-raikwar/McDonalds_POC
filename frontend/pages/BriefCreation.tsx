import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Upload, Share2, Lightbulb } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const BriefCreation: React.FC = () => {
    const navigate = useNavigate();
    const { briefDraft, updateBriefData, selectedInsights } = useAppContext();
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Calculate progress across all fields
    const fieldsToCheck = [
        'projectName', 'requestedBy', 'firstReviewDate', 'launchDate', 
        'businessGoal', 'marketingGoal', 'communicationObjective', 
        'targetAudience', 'fanTruth', 
        'messageProposition', 'tone', 'strategicRole', 'executionalMandatories'
    ];
    const filledFields = fieldsToCheck.filter(field => {
        const val = briefDraft[field as keyof typeof briefDraft];
        return typeof val === 'string' && val.trim().length > 0;
    }).length;
    const progress = Math.round((filledFields / fieldsToCheck.length) * 100);

    // Determine section statuses
    const getSectionStatus = (fields: string[]) => {
        const filled = fields.filter(f => {
            const val = briefDraft[f as keyof typeof briefDraft];
            return typeof val === 'string' && val.trim().length > 0;
        }).length;
        if (filled === 0) return { text: 'Not Started', color: 'text-gray-500' };
        if (filled === fields.length) return { text: 'Completed', color: 'text-green-600' };
        return { text: 'In Progress', color: 'text-mcd-yellow font-bold' };
    };

    const contextStatus = getSectionStatus(['businessGoal', 'marketingGoal', 'communicationObjective']);
    const peopleStatus = getSectionStatus(['targetAudience', 'fanTruth']);
    const commsStatus = getSectionStatus(['messageProposition', 'tone', 'strategicRole', 'executionalMandatories']);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        updateBriefData({ [e.target.name]: e.target.value });
    };

    // Helper for rendering textareas consistently with focus ring ONLY on the textarea
    const renderTextArea = (name: string, label: string, placeholder: string = "Type here...") => (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <textarea 
                name={name} 
                rows={3}
                placeholder={placeholder}
                value={briefDraft[name as keyof typeof briefDraft] as string} 
                onChange={handleChange}
                onFocus={() => setFocusedField(name)}
                className={`w-full p-4 bg-white border rounded-xl outline-none resize-none shadow-sm transition-all duration-300 ${
                    focusedField === name 
                        ? 'border-mcd-yellow ring-2 ring-mcd-yellow ring-offset-2' 
                        : 'border-gray-200 hover:border-gray-300'
                }`}
            />
        </div>
    );

    return (
        <div className="flex-1 flex bg-gray-50 overflow-hidden">
            {/* Main Form Area */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12 relative">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h1 className="text-4xl font-extrabold text-mcd-black mb-4">Existing Platform Extension</h1>
                            <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
                                <button className="flex items-center gap-2 hover:text-mcd-black"><User size={16}/> Team</button>
                                <button className="flex items-center gap-2 hover:text-mcd-black"><Upload size={16}/> Export</button>
                                <button className="flex items-center gap-2 hover:text-mcd-black"><Share2 size={16}/> Share</button>
                            </div>
                        </div>
                        
                        {/* Progress Ring */}
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-gray-100"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-mcd-yellow transition-all duration-500 ease-out"
                                    strokeWidth="3"
                                    strokeDasharray={`${progress}, 100`}
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="absolute text-xs font-bold text-mcd-black">{progress}%</span>
                        </div>
                    </div>

                    {/* Form Sections */}
                    <div className="space-y-12">
                        
                        {/* Brief Details */}
                        <section>
                            <h2 className="text-lg font-bold text-mcd-black mb-1">Brief Details</h2>
                            <p className="text-sm text-gray-500 mb-6">Not Started</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Project Name</label>
                                    <input 
                                        type="text" name="projectName" placeholder="Type here..."
                                        value={briefDraft.projectName} onChange={handleChange}
                                        onFocus={() => setFocusedField('projectName')}
                                        className={`w-full p-3 bg-white border rounded-lg outline-none transition-all shadow-sm ${
                                            focusedField === 'projectName' ? 'border-mcd-yellow ring-2 ring-mcd-yellow ring-offset-2' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Requested by</label>
                                    <input 
                                        type="text" name="requestedBy" placeholder="Type here..."
                                        value={briefDraft.requestedBy} onChange={handleChange}
                                        onFocus={() => setFocusedField('requestedBy')}
                                        className={`w-full p-3 bg-white border rounded-lg outline-none transition-all shadow-sm ${
                                            focusedField === 'requestedBy' ? 'border-mcd-yellow ring-2 ring-mcd-yellow ring-offset-2' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Review Date</label>
                                    <input 
                                        type="date" name="firstReviewDate"
                                        value={briefDraft.firstReviewDate} onChange={handleChange}
                                        onFocus={() => setFocusedField('firstReviewDate')}
                                        className={`w-full p-3 bg-white border rounded-lg outline-none transition-all text-gray-600 shadow-sm ${
                                            focusedField === 'firstReviewDate' ? 'border-mcd-yellow ring-2 ring-mcd-yellow ring-offset-2' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Launch Date</label>
                                    <input 
                                        type="date" name="launchDate"
                                        value={briefDraft.launchDate} onChange={handleChange}
                                        onFocus={() => setFocusedField('launchDate')}
                                        className={`w-full p-3 bg-white border rounded-lg outline-none transition-all text-gray-600 shadow-sm ${
                                            focusedField === 'launchDate' ? 'border-mcd-yellow ring-2 ring-mcd-yellow ring-offset-2' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Context */}
                        <section>
                            <h2 className="text-lg font-bold text-mcd-black mb-1">Context</h2>
                            <p className={`text-sm mb-6 ${contextStatus.color}`}>{contextStatus.text}</p>
                            
                            <div className="space-y-6">
                                {renderTextArea('businessGoal', 'Business Goal', 'Drive a 4% lift in comparable sales...')}
                                {renderTextArea('marketingGoal', 'Marketing Goal')}
                                {renderTextArea('communicationObjective', 'Communications Objective')}
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* People */}
                        <section>
                            <h2 className="text-lg font-bold text-mcd-black mb-1">People</h2>
                            <p className={`text-sm mb-6 ${peopleStatus.color}`}>{peopleStatus.text}</p>
                            
                            <div className="space-y-6">
                                {renderTextArea('targetAudience', 'Target Audience')}
                                
                                {/* Insights Display */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Insights</label>
                                    {selectedInsights.length > 0 ? (
                                        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                            <ul className="space-y-3">
                                                {selectedInsights.map(insight => (
                                                    <li key={insight.id} className="text-sm text-gray-700 flex items-start gap-2">
                                                        <span className="text-mcd-yellow mt-0.5">★</span>
                                                        {insight.title}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-500 italic">
                                            No insights selected. Go back to the Insights step to add some.
                                        </div>
                                    )}
                                </div>

                                {renderTextArea('fanTruth', 'Fan Truth')}
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Communications */}
                        <section>
                            <h2 className="text-lg font-bold text-mcd-black mb-1">Communications</h2>
                            <p className={`text-sm mb-6 ${commsStatus.color}`}>{commsStatus.text}</p>
                            
                            <div className="space-y-6">
                                {renderTextArea('messageProposition', 'Message (Proposition)')}
                                {renderTextArea('tone', 'Tone')}
                                {renderTextArea('strategicRole', 'Strategic Role of Channel')}
                                {renderTextArea('executionalMandatories', 'Executional Mandatories')}
                            </div>
                        </section>
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end gap-4">
                        <button className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                            Save Draft
                        </button>
                        <button className="px-6 py-3 rounded-xl font-bold bg-mcd-black text-white hover:bg-gray-800 transition-colors shadow-md">
                            Submit Brief
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BriefCreation;
