import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, AlertTriangle, Mail, Calendar, User } from 'lucide-react';
import * as attendanceAPI from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

interface Alert {
  id: number;
  pupil_id: number;
  alert_date: string;
  note: string;
}

const PupilModal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [pupil, setPupil] = useState<Pupil | null>(null);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipient: ''
  });

  useEffect(() => {
    if (id) {
      loadPupilData(parseInt(id));
    }
  }, [id]);

  const loadPupilData = async (pupilId: number) => {
    setLoading(true);
    try {
      const [pupilData, absencesData, alertsData] = await Promise.all([
        attendanceAPI.getPupil(pupilId),
        attendanceAPI.getPupilAbsences(pupilId),
        attendanceAPI.getPupilAlerts(pupilId)
      ]);
      
      setPupil(pupilData);
      setAbsences(absencesData);
      setAlerts(alertsData);
      setEmailData(prev => ({ ...prev, recipient: pupilData.email || '' }));
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'élève:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!pupil) return;
    
    const note = prompt('Note pour l\'alerte:');
    if (!note) return;
    
    try {
      await attendanceAPI.createAlert({
        pupil_id: pupil.id,
        alert_date: new Date().toISOString().split('T')[0],
        note
      });
      
      // Reload alerts
      const alertsData = await attendanceAPI.getPupilAlerts(pupil.id);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
      alert('Erreur lors de la création de l\'alerte');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pupil) return;
    
    try {
      await attendanceAPI.sendEmail({
        pupilId: pupil.id,
        subject: emailData.subject,
        message: emailData.message,
        recipientEmail: emailData.recipient
      });
      
      alert('Email envoyé avec succès');
      setShowEmailForm(false);
      setEmailData({ subject: '', message: '', recipient: pupil.email || '' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'E': return 'Excusée';
      case 'O': return 'Injustifiée';
      case 'C': return 'Certificat médical';
      default: return 'Présent';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'E': return 'text-green-600 bg-green-50';
      case 'O': return 'text-red-600 bg-red-50';
      case 'C': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!pupil) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center text-red-600">Élève non trouvé</div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-sky-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {pupil.last_name} {pupil.first_name}
              </h2>
              <p className="text-gray-600">Classe: {pupil.class_group}</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Informations de contact</h3>
            <p className="text-gray-700">
              <strong>Email:</strong> {pupil.email || 'Non renseigné'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleCreateAlert}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Signaler à l'administration</span>
            </button>
            
            <button
              onClick={() => setShowEmailForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!pupil.email}
            >
              <Mail className="h-4 w-4" />
              <span>Envoyer un email</span>
            </button>
          </div>

          {/* Email Form */}
          {showEmailForm && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Envoyer un email</h3>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destinataire:
                  </label>
                  <input
                    type="email"
                    value={emailData.recipient}
                    onChange={(e) => setEmailData(prev => ({ ...prev, recipient: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sujet:
                  </label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Absence de ${pupil.first_name} ${pupil.last_name}`}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message:
                  </label>
                  <textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Bonjour,\n\nNous avons constaté que ${pupil.first_name} ${pupil.last_name} était absent(e).\n\nCordialement,\nL'équipe pédagogique`}
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Envoyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Alerts History */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Alertes ({alerts.length})</span>
            </h3>
            
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-medium text-orange-800">
                        {format(new Date(alert.alert_date), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">{alert.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucune alerte enregistrée</p>
            )}
          </div>

          {/* Absence History */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span>Historique des absences ({absences.length})</span>
            </h3>
            
            {absences.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {absences.map(absence => (
                  <div key={absence.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-medium">
                        {format(new Date(absence.date), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                      <span className="text-sm text-gray-600">
                        {absence.half_day === 'AM' ? 'Matin' : 'Après-midi'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(absence.status)}`}>
                      {getStatusText(absence.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucune absence enregistrée</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PupilModal;