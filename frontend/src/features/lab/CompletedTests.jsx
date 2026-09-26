import React, { useState } from 'react';
import { Search, FlaskConical, Download, CheckCircle2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';

const CompletedTests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: allTests, isLoading, error } = useFetch('/lab');

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading archives...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  const tests = (allTests || []).filter(t => t.status === 'Completed');
  const filteredTests = tests.filter(test => 
    test.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    test._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Completed Tests Archive</h2>
          <p className="text-text-muted mt-1">Search and view past laboratory results and uploaded files.</p>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border bg-surface/30">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by Patient Name or Lab ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary bg-white" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/50 text-xs uppercase tracking-wider text-text-muted border-b border-border">
                <th className="px-6 py-4 font-medium">Lab ID & Test</th>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Processed Date</th>
                <th className="px-6 py-4 font-medium text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {filteredTests.map((test) => (
                <tr key={test._id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-main text-sm flex items-center gap-2">
                      <FlaskConical size={16} className="text-primary"/> {test.testName}
                    </div>
                    <div className="text-xs text-text-muted mt-1">{test._id.substring(0, 8).toUpperCase()} • {test.category}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-text-main">{test.patientId?.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text-main">{new Date(test.updatedAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={test.reportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary-light px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary/20">
                      <Download size={16} /> Download
                    </a>
                  </td>
                </tr>
              ))}
              {filteredTests.length === 0 && (
                <tr><td colSpan="4" className="text-center p-8 text-text-muted">No completed tests match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompletedTests;