import React, { useState } from 'react';
import { Copy, Check, FileCode2, Terminal, Shield } from 'lucide-react';

interface FlutterCodeViewerProps {
  dartCode: string;
}

export const FlutterCodeViewer: React.FC<FlutterCodeViewerProps> = ({ dartCode }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'pubspec' | 'rules'>('main');
  const [copied, setCopied] = useState(false);

  const pubspecCode = `name: jadwal_shift_app
description: "Aplikasi Jadwal Shift, Lembur, dan Kuota OFF Geser Flutter - Production Ready"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  shared_preferences: ^2.2.2
  supabase_flutter: ^2.5.0
  http: ^1.2.0
  firebase_core: ^3.0.0
  cloud_firestore: ^5.0.0
  excel: ^4.0.3
  pdf: ^3.10.8
  printing: ^5.12.0
  path_provider: ^2.1.2
  universal_html: ^2.2.4
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`;

  const rulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /test/{testId} {
      allow read: if true;
    }
    match /shifts/{shiftId} {
      allow read, write: if true;
    }
    match /users/{userId}/shifts/{shiftId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  const currentCode = activeTab === 'main' ? dartCode : activeTab === 'pubspec' ? pubspecCode : rulesCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl text-white">
      {/* Code Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('main')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'main'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5" />
            <span>lib/main.dart</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pubspec')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'pubspec'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>pubspec.yaml</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>firestore.rules</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center space-x-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Kode'}</span>
        </button>
      </div>

      {/* Code Body */}
      <div className="relative max-h-[600px] overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 bg-slate-950">
        <pre className="whitespace-pre">
          <code>{currentCode}</code>
        </pre>
      </div>
    </div>
  );
};
