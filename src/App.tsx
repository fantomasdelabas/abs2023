import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AttendanceGrid from './components/AttendanceGrid';
import PupilModal from './components/PupilModal';
import ImportExport from './components/ImportExport';
import { AttendanceProvider } from './contexts/AttendanceContext';

function App() {
  return (
    <AttendanceProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Feuille de Présence - École Primaire
                  </h1>
                </div>
                <ImportExport />
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<AttendanceGrid />} />
              <Route path="/pupil/:id" element={<PupilModal />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AttendanceProvider>
  );
}

export default App;