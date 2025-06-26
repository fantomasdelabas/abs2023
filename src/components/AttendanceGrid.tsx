import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, AlertTriangle } from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';
import { getDaysInMonth, getDay, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import PupilRow from './PupilRow';
import MonthlyStats from './MonthlyStats';

const AttendanceGrid: React.FC = () => {
  const { 
    pupils, 
    absences, 
    stats,
    currentMonth, 
    currentYear, 
    loading,
    setCurrentMonth, 
    setCurrentYear,
    updateAbsence 
  } = useAttendance();

  const [observations, setObservations] = useState<{ [key: number]: string }>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1));
  const monthName = format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy', { locale: fr });

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getAbsenceStatus = (pupilId: number, date: string, halfDay: 'AM' | 'PM') => {
    const absence = absences.find(
      a => a.pupil_id === pupilId && a.date === date && a.half_day === halfDay
    );
    return absence?.status || 'P';
  };

  const handleCellClick = (pupilId: number, date: string, halfDay: 'AM' | 'PM') => {
    const currentStatus = getAbsenceStatus(pupilId, date, halfDay);
    const statusCycle = ['P', 'E', 'O', 'C'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle] as 'P' | 'E' | 'O' | 'C';
    
    updateAbsence(pupilId, date, halfDay, nextStatus);
  };

  const renderDayHeaders = () => {
    const headers = [];
    
    for (let day = 1; day <= 31; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const isValidDay = day <= daysInMonth;
      const dayOfWeek = getDay(date);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const weekdayNames = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
      
      headers.push(
        <th
          key={day}
          className={clsx(
            'w-20 h-24 text-xs border border-gray-300 relative',
            isWeekend && isValidDay ? 'bg-gray-200' : 'bg-white',
            !isValidDay && 'bg-gray-100'
          )}
        >
          {isValidDay && (
            <>
              <div className="font-bold text-center pt-1 text-2xl">{day}</div>
              <div className="text-center text-gray-600 text-xs">
                {weekdayNames[dayOfWeek]}
              </div>
            </>
          )}
        </th>
      );
    }
    
    return headers;
  };

  const renderPupilRows = () => {
    // Fill to 70 rows as per updated requirements
    const rows = [];
    const maxRows = 70;
    
    for (let i = 0; i < maxRows; i++) {
      const pupil = pupils[i];
      
      rows.push(
        <PupilRow
          key={i}
          rowNumber={i + 1}
          pupil={pupil}
          currentYear={currentYear}
          currentMonth={currentMonth}
          daysInMonth={daysInMonth}
          absences={absences}
          onCellClick={handleCellClick}
          observations={observations}
          setObservations={setObservations}
        />
      );
    }
    
    return rows;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-sky-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Users className="h-6 w-6" />
            <h2 className="text-xl font-bold">Feuille de Présence Mensuelle</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-sky-700 rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-semibold capitalize min-w-48 text-center">
              {monthName}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-sky-700 rounded-full transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="lg:hidden p-2 hover:bg-sky-700 rounded-full transition-colors"
          >
            <AlertTriangle className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Main Grid */}
        <div className="flex-1 overflow-auto max-h-[70vh]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-12 h-12 bg-sky-100 border border-gray-300 text-xs font-bold">
                  N°
                </th>
                <th className="w-64 h-12 bg-sky-100 border border-gray-300 text-xs font-bold text-left px-2">
                  Nom et prénom(s) des élèves
                </th>
                {renderDayHeaders()}
              </tr>
            </thead>
            <tbody>
              {renderPupilRows()}
            </tbody>
          </table>
        </div>

        {/* Sidebar */}
        <div className={clsx(
          'transition-all duration-300 bg-gray-50 border-l border-gray-200',
          sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'
        )}>
          <MonthlyStats stats={stats} />
        </div>
      </div>

      {/* Bottom Signature Section */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-2xl">
              Visa et date de contrôle:
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-2xl"
              placeholder="Signature et date"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Signature du directeur:
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Signature"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-2xl">
              Date:
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceGrid;