import React from 'react';
import { BarChart3, TrendingUp, Users, AlertCircle } from 'lucide-react';

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

interface MonthlyStatsProps {
  stats: MonthlyStats | null;
}

const MonthlyStatsComponent: React.FC<MonthlyStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="p-4">
        <div className="text-gray-500">Chargement des statistiques...</div>
      </div>
    );
  }

  const totalAbsences = stats.absences_am + stats.absences_pm;
  const totalExcused = stats.excused_am + stats.excused_pm;
  const totalUnjustified = stats.unjustified_am + stats.unjustified_pm;
  const totalMedical = stats.medical_am + stats.medical_pm;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="h-5 w-5 text-sky-600" />
        <h3 className="font-semibold text-gray-900">Statistiques mensuelles</h3>
      </div>

      {/* Total Absences */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Total absences</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{totalAbsences}</span>
        </div>
        <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-2">
          <div>Matin: {stats.absences_am}</div>
          <div>Après-midi: {stats.absences_pm}</div>
        </div>
      </div>

      {/* Excused Absences */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Absences excusées</span>
          </div>
          <span className="text-lg font-bold text-green-600">{totalExcused}</span>
        </div>
        <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-2">
          <div>Matin: {stats.excused_am}</div>
          <div>Après-midi: {stats.excused_pm}</div>
        </div>
      </div>

      {/* Unjustified Absences */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Absences injustifiées</span>
          </div>
          <span className="text-lg font-bold text-red-600">{totalUnjustified}</span>
        </div>
        <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-2">
          <div>Matin: {stats.unjustified_am}</div>
          <div>Après-midi: {stats.unjustified_pm}</div>
        </div>
      </div>

      {/* Medical Certificates */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Certificats médicaux</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{totalMedical}</span>
        </div>
        <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-2">
          <div>Matin: {stats.medical_am}</div>
          <div>Après-midi: {stats.medical_pm}</div>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Indicateur</span>
        </div>
        <div className="text-xs text-gray-600">
          {totalUnjustified > 10 ? (
            <div className="text-red-600 font-medium">
              ⚠️ Niveau d'absences injustifiées élevé
            </div>
          ) : (
            <div className="text-green-600">
              ✓ Niveau d'absences acceptable
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Légende</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>E = Excusé</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>O = Injustifié</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>C = Certificat médical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>P = Présent (vide)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStatsComponent;