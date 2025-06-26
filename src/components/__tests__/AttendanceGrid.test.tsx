import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AttendanceGrid from '../AttendanceGrid';
import { AttendanceProvider } from '../../contexts/AttendanceContext';

// Mock the API module
jest.mock('../../services/api', () => ({
  getPupils: jest.fn(() => Promise.resolve([])),
  getMonthlyAbsences: jest.fn(() => Promise.resolve([])),
  getMonthlyStats: jest.fn(() => Promise.resolve({
    absences_am: 0,
    absences_pm: 0,
    excused_am: 0,
    excused_pm: 0,
    unjustified_am: 0,
    unjustified_pm: 0,
    medical_am: 0,
    medical_pm: 0
  })),
  updateAbsence: jest.fn(() => Promise.resolve()),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AttendanceProvider>
        {component}
      </AttendanceProvider>
    </BrowserRouter>
  );
};

describe('AttendanceGrid', () => {
  test('renders the main title', async () => {
    renderWithProviders(<AttendanceGrid />);
    
    expect(screen.getByText('Feuille de Présence Mensuelle')).toBeInTheDocument();
  });

  test('renders month navigation buttons', async () => {
    renderWithProviders(<AttendanceGrid />);
    
    const navigationButtons = screen.getAllByRole('button');
    expect(navigationButtons.length).toBeGreaterThan(0);
  });

  test('renders grid headers correctly', async () => {
    renderWithProviders(<AttendanceGrid />);
    
    expect(screen.getByText('N°')).toBeInTheDocument();
    expect(screen.getByText('Nom et prénom(s) des élèves')).toBeInTheDocument();
  });

  test('renders signature section', async () => {
    renderWithProviders(<AttendanceGrid />);
    
    expect(screen.getByText('Visa et date de contrôle:')).toBeInTheDocument();
    expect(screen.getByText('Signature du directeur:')).toBeInTheDocument();
    expect(screen.getByText('Date:')).toBeInTheDocument();
  });
});