import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Lightbulb, Users, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { MOCK_NEWS, PERFORMANCE_DATA } from '../constants';

const Dashboard: React.FC = () => {
    const { user, setAiDrawerOpen, setAiDrawerQuery, openAiTool, reloadUser } = useAppContext();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Ensure displayName is loaded if it was just set during signup
    useEffect(() => {
        if (user && !user.displayName) {
            reloadUser();
        }
    }, [user, reloadUser]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setAiDrawerQuery(searchQuery);
            setAiDrawerOpen(true);
        }
    };

    const tools = [
        { icon: FileText, title: 'Briefing', desc: 'Create new briefs, faster.', color: 'text-yellow-600', bg: 'bg-yellow-50', action: () => openAiTool('briefing') },
        { icon: Lightbulb, title: 'Research & Insights', desc: 'Gather insights for briefing.', color: 'text-orange-500', bg: 'bg-orange-50', action: () => openAiTool('research') },
        { icon: Users, title: 'Audiences', desc: 'Test with synthetic personas.', color: 'text-blue-500', bg: 'bg-blue-50', action: () => openAiTool('audiences') },
        { icon: BarChart2, title: 'Campaign Analysis', desc: 'Monitor performance, live.', color: 'text-green-500', bg: 'bg-green-50', action: () => openAiTool('analysis') },
    ];

    // Time-based greeting
    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";

    const displayName = user?.displayName;
    const displayGreeting = displayName ? `${greeting}, ${displayName}!` : 'Welcome!';

    return (
        <div className="flex-1 overflow-y-auto bg-white">
            {/* Top Yellow Section */}
            <div className="bg-mcd-yellow px-12 pt-16 pb-16 relative overflow-hidden">
                
                {/* McDonald's Arches Graphic Background */}
                <div className="absolute right-0 top-0 h-full w-[60%] pointer-events-none overflow-hidden opacity-30">
                    <div className="absolute right-[-5%] top-[15%] w-[35%] h-[150%] border-[60px] border-[#D9A012] rounded-t-full"></div>
                    <div className="absolute right-[22%] top-[15%] w-[35%] h-[150%] border-[60px] border-[#D9A012] rounded-t-full"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-sm font-bold tracking-wider uppercase mb-2 text-mcd-black/80">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            <h1 className="text-5xl font-extrabold text-mcd-black mb-4 tracking-tight">
                                {displayGreeting}
                            </h1>
                            <p className="text-xl text-mcd-black/90 font-medium">
                                What would you like to work on today?
                            </p>
                        </div>
                        
                        {/* Language Selector */}
                        <div className="bg-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm cursor-pointer text-mcd-black">
                            🇺🇸 EN <span className="text-xs text-gray-500">▼</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative max-w-3xl mt-10 bg-white rounded-xl shadow-lg flex items-center p-1.5">
                        <input
                            id="main-search"
                            type="text"
                            placeholder="Ask anything or describe what you need..."
                            className="flex-1 py-3 pl-5 pr-4 text-lg focus:outline-none bg-transparent text-gray-800 placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="bg-mcd-red text-white p-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center flex-shrink-0"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom White Section */}
            <div className="max-w-6xl mx-auto px-12 pt-12 relative z-10 pb-20">
                
                {/* Tools Section */}
                <div className="mb-12">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-bold text-mcd-black">Your Top Tools</h2>
                        <a href="#" className="text-sm font-medium text-gray-500 hover:text-mcd-black flex items-center gap-1">
                            See all <ArrowRight size={14} />
                        </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tools.map((tool, idx) => (
                            <div 
                                key={idx} 
                                onClick={tool.action}
                                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                            >
                                <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                    <tool.icon size={24} className={tool.color} />
                                </div>
                                <h3 className="font-bold text-mcd-black mb-2 text-lg">{tool.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Performance */}
                    <div>
                        <h2 className="text-2xl font-bold text-mcd-black mb-6">Today's Performance</h2>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                            <h3 className="font-bold text-sm mb-6 text-gray-800">Holiday 2026 Social Campaign</h3>
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={PERFORMANCE_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dx={-10} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="value" stroke="#DA291C" strokeWidth={3} dot={{r: 4, fill: '#DA291C', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6, strokeWidth: 0}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* News */}
                    <div>
                        <h2 className="text-2xl font-bold text-mcd-black mb-6">McDonald's in the News</h2>
                        <div className="flex flex-col gap-4">
                            {MOCK_NEWS.map(news => (
                                <div key={news.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-md flex gap-5 items-center hover:bg-gray-50 cursor-pointer transition-colors">
                                    <img src={news.image} alt="News" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                                    <div>
                                        <span className="text-xs font-bold text-mcd-red tracking-wider uppercase">{news.category}</span>
                                        <h3 className="font-bold text-mcd-black text-base mt-1.5 mb-2 line-clamp-2 leading-tight">{news.headline}</h3>
                                        <span className="text-xs text-gray-500 font-medium">{news.source}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
