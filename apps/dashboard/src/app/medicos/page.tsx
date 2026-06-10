'use client';
import DashboardLayout from '../../components/DashboardLayout';
import DoctorsManager from '../../components/DoctorsManager';

export default function MedicosPage() {
  return (
    <DashboardLayout
      activeTab="medicos"
      title="Directorio de Médicos Especialistas"
      subtitle="Gestión del Staff Médico"
    >
      <DoctorsManager />
    </DashboardLayout>
  );
}
