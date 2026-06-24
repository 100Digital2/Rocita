'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface PatientProfile {
  id: number;
  name: string;
  documentType: string;
  documentNumber: string;
  gender: string;
  phone: string;
  email: string;
}

interface AppointmentHistory {
  date: string;
  specialty: string;
  doctor: string;
  status: 'Asistió' | 'Confirmado' | 'Cancelado' | 'Pendiente';
}

interface ChatMessage {
  sender: 'paciente' | 'rocita';
  text: string;
  time: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  documentType?: string;
  documentNumber?: string;
  gender?: string;
  phone: string;
  email: string;
  status: 'Confirmado' | 'Pendiente' | 'Cancelado';
  specialty: string;
  doctor: string;
  doctorEmail?: string;
  doctorPhone?: string;
  nextAppointment: string;
  history: AppointmentHistory[];
  chatHistory: ChatMessage[];
}

export function usePatients() {
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // 1. Fetch consolidated list of patients
  const query = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      let appointments: any[] = [];
      let profiles: PatientProfile[] = [];
      const token = localStorage.getItem('rocita_token');

      // Fetch appointments
      try {
        const res = await fetch(`${apiUrl}/patients`);
        if (res.ok) appointments = await res.json();
      } catch (err) {
        console.warn('Error fetching appointments for patients list:', err);
      }

      // Fetch profiles
      try {
        const res = await fetch(`${apiUrl}/patients-profiles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) profiles = await res.json();
      } catch (err) {
        console.warn('Error fetching profiles, loading offline cache...', err);
        const cached = localStorage.getItem('rocita_patient_profiles');
        if (cached) profiles = JSON.parse(cached);
      }

      // Fetch cached chats from localStorage
      const savedChatsRaw = localStorage.getItem('rocita_chat_histories');
      const savedChats = savedChatsRaw ? JSON.parse(savedChatsRaw) : {};

      const getChatHistory = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        return savedChats[cleanPhone] || [];
      };

      // Map appointments to Patient schema
      const mappedAppointments = appointments.map((p: any) => ({
        id: `pat-${p.id}`,
        name: p.name,
        age: p.age || 30,
        documentType: p.documentType || 'CC',
        documentNumber: p.documentNumber || '',
        gender: p.gender || '',
        phone: p.phone || '',
        email: p.email || '',
        status: p.status || 'Pendiente',
        specialty: p.specialty || 'Consulta General',
        doctor: p.doctor || 'Dr. Alejandro Restrepo',
        doctorEmail: p.doctorEmail || '',
        doctorPhone: p.doctorPhone || '',
        nextAppointment: p.nextAppointment || 'Próximamente',
        history: [
          { date: 'Hoy', specialty: p.specialty || 'Consulta General', doctor: p.doctor || 'Dr. Alejandro Restrepo', status: p.status || 'Pendiente' }
        ],
        chatHistory: getChatHistory(p.phone || '')
      }));

      // Filter profiles that don't have active appointments
      const appointmentDocNumbers = new Set(mappedAppointments.map((a: any) => a.documentNumber.toString().trim()));
      
      const profilesWithoutAppointments = profiles
        .filter(p => !appointmentDocNumbers.has(p.documentNumber.toString().trim()))
        .map(p => ({
          id: `profile-${p.id}`,
          name: p.name,
          age: 30,
          documentType: p.documentType || 'CC',
          documentNumber: p.documentNumber || '',
          gender: p.gender || '',
          phone: p.phone || '',
          email: p.email || '',
          status: 'Pendiente' as const,
          specialty: 'Sin asignar',
          doctor: 'Sin asignar',
          nextAppointment: 'Sin citas programadas',
          history: [],
          chatHistory: getChatHistory(p.phone || '')
        }));

      const finalPatients = [...mappedAppointments, ...profilesWithoutAppointments];

      return finalPatients;
    }
  });

  // 2. Real-time WebSocket connection to synchronize status
  useEffect(() => {
    const socket = io(`${apiUrl}/whatsapp`, {
      transports: ['websocket'],
    });

    socket.on('whatsapp.message', (data: any) => {
      // Comparison of ending digits to see if it's the same patient
      const matchPhones = (phoneA: string, phoneB: string) => {
        const cleanA = phoneA.replace(/\D/g, '');
        const cleanB = phoneB.replace(/\D/g, '');
        if (!cleanA || !cleanB) return false;
        return cleanA.endsWith(cleanB) || cleanB.endsWith(cleanA);
      };

      const cleanedText = data.text.trim().toLowerCase();
      if (!data.fromMe && (cleanedText === '1' || cleanedText === 'si' || cleanedText === 'sí' || cleanedText === '2' || cleanedText === 'no')) {
        // Trigger refetch or local update
        queryClient.invalidateQueries({ queryKey: ['patients'] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl, queryClient]);

  // 3. Create Patient Profile Mutation
  const createPatientMutation = useMutation({
    mutationFn: async (payload: Omit<PatientProfile, 'id'>) => {
      const token = localStorage.getItem('rocita_token');
      const res = await fetch(`${apiUrl}/patients-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al registrar perfil de paciente');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Perfil de paciente registrado exitosamente.');
    },
    onError: async (error, variables) => {
      console.warn('Error al guardar perfil en servidor. Guardando localmente...', error);
      const offlineProfiles = localStorage.getItem('rocita_patient_profiles');
      const current = offlineProfiles ? JSON.parse(offlineProfiles) : [];
      const newProfile = { id: Date.now(), ...variables };
      const updated = [...current, newProfile];
      localStorage.setItem('rocita_patient_profiles', JSON.stringify(updated));
      
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Perfil registrado localmente (Modo Offline).');
    }
  });

  return {
    patients: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createPatient: createPatientMutation.mutateAsync
  };
}
