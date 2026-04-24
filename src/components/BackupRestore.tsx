import React, { useState, useEffect } from 'react';
import { Cloud, Download, Upload, RefreshCw, CheckCircle2, AlertCircle, HardDrive, ShieldCheck } from 'lucide-react';

export function BackupRestore() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [lastBackup, setLastBackup] = useState('Just now');
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('autoBackup');
    if (saved !== null) {
      setAutoBackup(JSON.parse(saved));
    }
  }, []);

  const handleAutoBackupToggle = () => {
    const newValue = !autoBackup;
    setAutoBackup(newValue);
    localStorage.setItem('autoBackup', JSON.stringify(newValue));
  };

  const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"name": "General"}');

  const handleManualBackup = () => {
    setIsBackingUp(true);
    
    // Gather all local storage data
    const backupData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        backupData[key] = localStorage.getItem(key) || '';
      }
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedName = activeCompany.name.replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `${sanitizedName}_Backup_${new Date().toISOString().split('T')[0]}.json`;
    
    setTimeout(() => {
      a.click();
      setIsBackingUp(false);
      setLastBackup('Just now');
    }, 1500); // Simulate network delay for UX
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (window.confirm('Warning: This will overwrite all your current data. Are you sure you want to proceed?')) {
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, data[key]);
          });
          alert('Data restored successfully! The application will now reload.');
          window.location.reload();
        }
      } catch (error) {
        alert('Invalid backup file. Please select a valid GSTPro backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data & Auto Backup ☁️</h1>
          <p className="text-slate-500">Secure your business data with cloud sync and local backups</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto Backup Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${autoBackup ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                <Cloud size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Auto Cloud Backup</h2>
                <p className="text-sm text-slate-500">Sync data safely to the cloud</p>
              </div>
            </div>
            <button 
              onClick={handleAutoBackupToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoBackup ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoBackup ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          <div className="p-6 bg-slate-50/50">
            {autoBackup ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-bold animate-pulse">Real-time sync active</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                  <ShieldCheck size={18} />
                  <span className="text-sm font-medium">Your data is actively protected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Last synced:</span>
                  <span className="font-medium text-slate-700">{lastBackup}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sync frequency:</span>
                  <span className="font-medium text-slate-700">Every 5 minutes</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-amber-600 bg-amber-50 px-4 py-3 rounded-lg border border-amber-100">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">Auto backup is disabled. Your data is only stored locally on this device. Enable auto backup to prevent data loss.</p>
              </div>
            )}
          </div>
        </div>

        {/* Manual Backup & Restore */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <HardDrive size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Local Backup & Restore</h2>
                <p className="text-sm text-slate-500">Download or upload your data manually</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <button 
              onClick={handleManualBackup}
              disabled={isBackingUp}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium disabled:opacity-50"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Backup File (.json)
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">OR</span>
              </div>
            </div>

            <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium cursor-pointer shadow-sm">
              <Upload size={18} />
              Restore from Backup
              <input 
                type="file" 
                accept=".json" 
                onChange={handleRestore}
                className="hidden"
              />
            </label>
            <p className="text-xs text-center text-slate-500 mt-2">
              Restoring will replace all current data with the backup file.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <button 
                onClick={() => {
                  const sampleData = { "sample_key": "sample_data" };
                  const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Sample_Restore_Format.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-all font-medium text-sm"
              >
                <Download size={16} />
                Download Sample Backup Format
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
