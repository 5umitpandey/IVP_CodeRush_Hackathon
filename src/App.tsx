import React, { useState, useEffect } from 'react';
import { Calendar, Brain, TrendingUp, PlusCircle, BarChart3, LineChart, PieChart } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface MoodEntry {
  id: string;
  date: string;
  sleep: number;
  stress: number;
  symptoms: number;
  mood: number;
  engagement: number;
  drugNames: string;
  notes: string;
}

// Data validation utilities
const validateNumber = (value: string, min: number, max: number): number | null => {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) return null;
  return num;
};

const sanitizeString = (input: string): string => {
  return input.replace(/[<>\"'/;()&+]/g, '').trim().substring(0, 500);
};

const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  return date instanceof Date && !isNaN(date.getTime()) && date >= oneYearAgo && date <= today;
};

function App() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'entry' | 'charts' | 'reports'>('entry');
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    sleep: '',
    stress: '',
    symptoms: '',
    mood: '',
    engagement: '',
    drugNames: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('moodTrackerEntries');
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    }
  }, []);

  // Save to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('moodTrackerEntries', JSON.stringify(entries));
  }, [entries]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateDate(formData.date)) {
      newErrors.date = 'Please enter a valid date within the last year';
    }

    const sleep = validateNumber(formData.sleep, 0, 24);
    if (sleep === null) {
      newErrors.sleep = 'Sleep must be between 0-24 hours';
    }

    ['stress', 'symptoms', 'mood', 'engagement'].forEach(field => {
      const value = validateNumber(formData[field as keyof typeof formData], 1, 10);
      if (value === null) {
        newErrors[field] = `${field} must be between 1-10`;
      }
    });

    if (formData.notes.length < 10) {
      newErrors.notes = 'Notes must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: formData.date,
      sleep: parseFloat(formData.sleep),
      stress: parseInt(formData.stress),
      symptoms: parseInt(formData.symptoms),
      mood: parseInt(formData.mood),
      engagement: parseInt(formData.engagement),
      drugNames: sanitizeString(formData.drugNames),
      notes: sanitizeString(formData.notes)
    };

    setEntries(prev => [...prev.filter(e => e.date !== formData.date), newEntry].sort((a, b) => b.date.localeCompare(a.date)));
    
    // Reset form
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      sleep: '',
      stress: '',
      symptoms: '',
      mood: '',
      engagement: '',
      drugNames: '',
      notes: ''
    });
    setErrors({});
  };

  // Chart data preparation
  const last30Days = entries.slice(-30).reverse();
  const chartLabels = last30Days.map(e => format(parseISO(e.date), 'MMM dd'));

  const moodChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Mood',
        data: last30Days.map(e => e.mood),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Stress',
        data: last30Days.map(e => e.stress),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Engagement',
        data: last30Days.map(e => e.engagement),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const sleepMoodData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Sleep Hours',
        data: last30Days.map(e => e.sleep),
        backgroundColor: 'rgba(147, 51, 234, 0.6)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 2,
      }
    ]
  };

  // Drug analysis
  const drugAnalysis = entries.reduce((acc, entry) => {
    if (entry.drugNames.trim()) {
      const drugs = entry.drugNames.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
      drugs.forEach(drug => {
        if (!acc[drug]) {
          acc[drug] = { totalMood: 0, count: 0, avgMood: 0 };
        }
        acc[drug].totalMood += entry.mood;
        acc[drug].count += 1;
        acc[drug].avgMood = acc[drug].totalMood / acc[drug].count;
      });
    }
    return acc;
  }, {} as Record<string, { totalMood: number; count: number; avgMood: number }>);

  const drugChartData = {
    labels: Object.keys(drugAnalysis),
    datasets: [{
      label: 'Average Mood by Drug',
      data: Object.values(drugAnalysis).map(d => d.avgMood),
      backgroundColor: [
        'rgba(59, 130, 246, 0.6)',
        'rgba(239, 68, 68, 0.6)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(249, 115, 22, 0.6)',
        'rgba(147, 51, 234, 0.6)',
        'rgba(20, 184, 166, 0.6)',
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, max: 10 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MoodFlow
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your daily mood, analyze patterns, and gain insights into your mental wellness journey
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
            {[
              { key: 'entry', label: 'Daily Entry', icon: PlusCircle },
              { key: 'charts', label: 'Analytics', icon: LineChart },
              { key: 'reports', label: 'Reports', icon: BarChart3 }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Entry Form */}
        {activeTab === 'entry' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-indigo-500" />
              Daily Mood Entry
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.date ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sleep (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={formData.sleep}
                    onChange={(e) => setFormData({...formData, sleep: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.sleep ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="8.5"
                  />
                  {errors.sleep && <p className="text-red-500 text-sm mt-1">{errors.sleep}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { key: 'stress', label: 'Stress Level', color: 'red' },
                  { key: 'symptoms', label: 'Symptoms', color: 'orange' },
                  { key: 'mood', label: 'Mood', color: 'blue' },
                  { key: 'engagement', label: 'Engagement', color: 'green' }
                ].map(({ key, label, color }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label} (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-${color}-500 focus:border-transparent transition-all ${
                        errors[key] ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="5"
                    />
                    {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key]}</p>}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medications/Drugs (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.drugNames}
                  onChange={(e) => setFormData({...formData, drugNames: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="caffeine, ibuprofen, vitamin d"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Notes (How was your day?)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${
                    errors.notes ? 'border-red-300' : 'border-gray-200'
                  }`}
                  rows={4}
                  placeholder="Describe how your day went, overall mood, any significant events..."
                />
                {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Save Entry
              </button>
            </form>
          </div>
        )}

        {/* Charts Section */}
        {activeTab === 'charts' && entries.length > 0 && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-indigo-500" />
                Mood Trends (Last 30 Days)
              </h2>
              <div className="h-96">
                <Line data={moodChartData} options={chartOptions} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Sleep Patterns</h3>
                <div className="h-64">
                  <Bar data={sleepMoodData} options={chartOptions} />
                </div>
              </div>

              {Object.keys(drugAnalysis).length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Drug Impact on Mood</h3>
                  <div className="h-64">
                    <Pie data={drugChartData} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Section */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <PieChart className="w-6 h-6 mr-3 text-indigo-500" />
              Detailed Reports
            </h2>

            {entries.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No entries yet. Start tracking to see reports!</p>
            ) : (
              <div className="space-y-8">
                {/* Overall Stats */}
                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Entries', value: entries.length, color: 'blue' },
                    { label: 'Avg Mood', value: (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1), color: 'green' },
                    { label: 'Avg Sleep', value: (entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length).toFixed(1) + 'h', color: 'purple' },
                    { label: 'Avg Stress', value: (entries.reduce((sum, e) => sum + e.stress, 0) / entries.length).toFixed(1), color: 'red' }
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-2xl border border-${color}-200`}>
                      <h4 className="text-sm font-medium text-gray-600">{label}</h4>
                      <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Drug Analysis Table */}
                {Object.keys(drugAnalysis).length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Drug Impact Analysis</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left font-semibold text-gray-700 rounded-l-xl">Drug/Medication</th>
                            <th className="px-6 py-4 text-center font-semibold text-gray-700">Times Used</th>
                            <th className="px-6 py-4 text-center font-semibold text-gray-700 rounded-r-xl">Average Mood</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(drugAnalysis)
                            .sort((a, b) => b[1].avgMood - a[1].avgMood)
                            .map(([drug, stats]) => (
                            <tr key={drug} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-800 capitalize">{drug}</td>
                              <td className="px-6 py-4 text-center text-gray-600">{stats.count}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  stats.avgMood >= 7 ? 'bg-green-100 text-green-800' :
                                  stats.avgMood >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {stats.avgMood.toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;