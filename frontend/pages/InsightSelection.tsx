import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Check, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MOCK_INSIGHTS } from '../constants';

const InsightSelection: React.FC = () => {
    const navigate = useNavigate();
    const { selectedInsights, toggleInsight } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInsights = MOCK_INSIGHTS.filter(insight => 
        insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.source.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNext = () => {
        navigate('/create-brief');
    };

    return (
        <div className="flex-1 bg-white overflow-y-auto">
            <div className="max-w-5xl mx-auto px-12 py-12">
                
                <button 
                    onClick={() => navigate('/')}
                    className="mb-8 p-2 hover:bg-gray-100 rounded-full transition-colors inline-flex"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Text */}
                    <div className="lg:w-1/3">
                        <h1 className="text-4xl font-extrabold text-mcd-black mb-6 leading-tight">
                            Let's gather insights to inform your brief
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Insights are the foundation of a strong brief. Choose the ones that are most relevant to your project, and shape your draft in collaboration with AI.
                        </p>
                    </div>

                    {/* Right Column: Selection */}
                    <div className="lg:w-2/3 flex flex-col">
                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search insights" 
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mcd-yellow shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="text-sm text-gray-500 mb-4 font-medium">
                            {selectedInsights.length} of {MOCK_INSIGHTS.length} selected
                        </div>

                        {/* Insights List */}
                        <div className="flex flex-col gap-3 mb-8">
                            {filteredInsights.map(insight => {
                                const isSelected = selectedInsights.some(i => i.id === insight.id);
                                return (
                                    <div 
                                        key={insight.id}
                                        onClick={() => toggleInsight(insight)}
                                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                                            isSelected 
                                                ? 'border-mcd-yellow bg-yellow-50/30 shadow-sm' 
                                                : 'border-gray-100 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div>
                                            <h3 className={`font-bold mb-2 ${isSelected ? 'text-mcd-black' : 'text-gray-800'}`}>
                                                {insight.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{insight.source}</span>
                                                <span>•</span>
                                                <span>{insight.date}</span>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                                            isSelected 
                                                ? 'bg-mcd-yellow border-mcd-yellow text-white' 
                                                : 'border-gray-300'
                                        }`}>
                                            {isSelected && <Check size={14} strokeWidth={3} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action */}
                        <div className="flex justify-end">
                            <button 
                                onClick={handleNext}
                                disabled={selectedInsights.length === 0}
                                className={`px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all ${
                                    selectedInsights.length > 0 
                                        ? 'bg-mcd-yellow text-mcd-black hover:bg-yellow-400 shadow-md' 
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Next Step <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightSelection;
