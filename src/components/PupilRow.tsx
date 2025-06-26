import React from 'react';
import { getDay } from 'date-fns';
import clsx from 'clsx';

interface Pupil {
  id: number;
  first_name: string;
  last_name: string;
  class_group: string;
  email: string;
}

interface Absence {
  id: number;
  pupil_id: number;
  date: string;
  half_day: 'AM' | 'PM';
  status: 'P' | 'E' | 'O' | 'C';
}

interface PupilRowProps {
  rowNumber: number;
  pupil?: Pupil;
  currentYear: number;
  currentMonth: number;
  daysInMonth: number;
  absences: Absence[];
  onCellClick: (pupilId: number, date: string, halfDay: 'AM' | 'PM') => void;
  observations: { [key: number]: string };
  setObservations: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>;
}

const PupilRow: React.FC<PupilRowProps> = ({
  rowNumber,
  pupil,
  currentYear,
  currentMonth,
  daysInMonth,
  absences,
  onCellClick,
  observations,
  setObservations
}) => {
  const getAbsenceStatus = (date: string, halfDay: 'AM' | 'PM') => {
    if (!pupil) return 'P';
    const absence = absences.find(
      a => a.pupil_id === pupil.id && a.date === date && a.half_day === halfDay
    );
    return absence?.status || 'P';
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'E': return 'E';
      case 'O': return 'O';
      case 'C': return 'C';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'E': return 'text-green-600 bg-green-50';
      case 'O': return 'text-red-600 bg-red-50';
      case 'C': return 'text-blue-600 bg-blue-50';
      default: return '';
    }
  };

  const getStatusTooltip = (status: string) => {
    switch (status) {
      case 'E': return 'Absence excusée';
      case 'O': return 'Absence injustifiée';
      case 'C': return 'Certificat médical';
      default: return 'Présent';
    }
  };

  const renderDayCells = () => {
    const cells = [];
    
    for (let day = 1; day <= 31; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const isValidDay = day <= daysInMonth;
      const dayOfWeek = getDay(date);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const amStatus = getAbsenceStatus(dateStr, 'AM');
      const pmStatus = getAbsenceStatus(dateStr, 'PM');
      
      cells.push(
        <td
          key={day}
          className={clsx(
            'w-20 h-20 border border-gray-300 relative p-0',
            isWeekend && isValidDay ? 'bg-gray-100' : 'bg-white',
            !isValidDay && 'bg-gray-50'
          )}
        >
          {isValidDay && pupil && (
            <div className="flex h-full">
              {/* AM Half */}
              <div
                className={clsx(
                  'flex-1 h-full flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-gray-200 transition-colors',
                  getStatusColor(amStatus)
                )}
                onClick={() => onCellClick(pupil.id, dateStr, 'AM')}
                title={`Matin - ${getStatusTooltip(amStatus)}`}
              >
                {getStatusDisplay(amStatus)}
              </div>
              
              {/* Divider */}
              <div className="w-px bg-gray-300"></div>
              
              {/* PM Half */}
              <div
                className={clsx(
                  'flex-1 h-full flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-gray-200 transition-colors',
                  getStatusColor(pmStatus)
                )}
                onClick={() => onCellClick(pupil.id, dateStr, 'PM')}
                title={`Après-midi - ${getStatusTooltip(pmStatus)}`}
              >
                {getStatusDisplay(pmStatus)}
              </div>
            </div>
          )}
        </td>
      );
    }
    
    return cells;
  };

  return (
    <tr className="hover:bg-gray-50">
      {/* Row Number */}
      <td className="w-24 h-16 bg-sky-50 border border-gray-300 text-center text-sm font-medium">
        {rowNumber}
      </td>
      
      {/* Pupil Name */}
      <td className="w-64 h-16 border border-gray-300 px-2 text-sm">
        {pupil ? (
          <div className="flex items-center justify-between">
            <button
              className="text-left hover:text-sky-600 transition-colors truncate"
              onClick={() => {
                // Open pupil modal - will be implemented
                console.log('Open pupil modal for', pupil.id);
              }}
              title={`${pupil.last_name} ${pupil.first_name} (${pupil.class_group})`}
            >
              <span className="font-medium">{pupil.last_name}</span>{' '}
              <span>{pupil.first_name}</span>
              <span className="text-gray-500 ml-2">({pupil.class_group})</span>
            </button>
          </div>
        ) : (
          <div className="text-gray-400">—</div>
        )}
      </td>
      
      {/* Day Cells */}
      {renderDayCells()}
    </tr>
  );
};

export default PupilRow;