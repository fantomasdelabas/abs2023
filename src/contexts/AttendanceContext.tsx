import React, { createContext, useContext, useState, useEffect } from 'react';
import * as attendanceAPI from '../services/api';

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

interface MonthlyStats {
  absences_am: number;
  absences_pm: number;
  excused_am: number;
  excused_pm: number;
  unjustified_am: number;
  unjustified_pm: number;
  medical_am: number;
  medical_pm: number;
}

interface AttendanceContextType {
  pupils: Pupil[];
  absences: Absence[];
  stats: MonthlyStats | null;
  currentMonth: number;
  currentYear: number;
  loading: boolean;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  updateAbsence: (pupilId: number, date: string, halfDay: 'AM' | 'PM', status: 'P' | 'E' | 'O' | 'C') => Promise<void>;
  refreshData: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const refreshData = async () => {
    setLoading(true);
    try {
      const [pupilsData, absencesData, statsData] = await Promise.all([
        attendanceAPI.getPupils(),
        attendanceAPI.getMonthlyAbsences(currentYear, currentMonth),
        attendanceAPI.getMonthlyStats(currentYear, currentMonth)
      ]);
      
      setPupils(pupilsData);
      setAbsences(absencesData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAbsence = async (pupilId: number, date: string, halfDay: 'AM' | 'PM', status: 'P' | 'E' | 'O' | 'C') => {
    try {
      await attendanceAPI.updateAbsence({ pupil_id: pupilId, date, half_day: halfDay, status });
      await refreshData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'absence:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentMonth, currentYear]);

  const value: AttendanceContextType = {
    pupils,
    absences,
    stats,
    currentMonth,
    currentYear,
    loading,
    setCurrentMonth,
    setCurrentYear,
    updateAbsence,
    refreshData
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};