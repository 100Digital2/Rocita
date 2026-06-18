'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  dbId?: number;
  name: string;
  age: number;
  documentType: string;
  documentNumber: string;
  gender: string;
  phone: string;
  email: string;
  status: 'Confirmado' | 'Pendiente' | 'Cancelado';
  specialty: string;
  doctor: string;
  doctorEmail?: string;
  doctorPhone?: string;
  nextAppointment: string;
}

export function useAppointments() {
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // 1. Fetch appointments query
  const query = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      try {
        const res = await fetch(`${apiUrl}/patients`);
        if (!res.ok) throw new Error('Error al obtener citas del servidor');
        const data = await res.json();
        
        const mapped = data.map((p: any) => ({
          id: `pat-${p.id}`,
          dbId: p.id,
          name: p.name,
          age: p.age || 30,
          documentType: p.documentType || 'CC',
          documentNumber: p.documentNumber || '',
          gender: p.gender || 'M',
          phone: p.phone || '',
          email: p.email || '',
          status: p.status || 'Pendiente',
          specialty: p.specialty || 'Consulta General',
          doctor: p.doctor || 'Por asignar',
          doctorEmail: p.doctorEmail || '',
          doctorPhone: p.doctorPhone || '',
          nextAppointment: p.nextAppointment || ''
        }));
        
        // Cache in localStorage for offline fallback
        localStorage.setItem('rocita_appointments', JSON.stringify(mapped));
        return mapped;
      } catch (error) {
        console.warn('Backend offline, usando citas de localStorage...', error);
        const cached = localStorage.getItem('rocita_appointments');
        if (cached) return JSON.parse(cached);
        
        // Fallback static mock list if no cache is present
        return [];
      }
    }
  });

  // 2. Real-time WebSocket connection to listen for hot-reloads
  useEffect(() => {
    const socket = io(`${apiUrl}/whatsapp`, {
      transports: ['websocket'],
    });

    socket.on('whatsapp.appointment_update', (data: any) => {
      console.log('WS hook: Cita actualizada en tiempo real:', data);
      
      // Update specific cache item reactively
      queryClient.setQueryData(['appointments'], (old: Appointment[] = []) =>
        old.map((a) => (a.dbId === data.dbId ? { ...a, status: data.status } : a))
      );
      
      toast.info(`Cita de ${data.notification.patientName} confirmada automáticamente.`);
    });

    socket.on('whatsapp.message', (data: any) => {
      // If patient confirm via reply, we can trigger invalidation
      const cleanedText = data.text.trim().toLowerCase();
      if (!data.fromMe && (cleanedText === '1' || cleanedText === 'sí' || cleanedText === 'si' || cleanedText === '2' || cleanedText === 'no')) {
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl, queryClient]);

  // 3. Create Appointment Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: Omit<Appointment, 'id' | 'dbId'>) => {
      const res = await fetch(`${apiUrl}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al guardar cita en el servidor');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Cita programada con éxito en el servidor.');
    },
    onError: async (error, variables) => {
      console.warn('Guardando cita en memoria local offline...', error);
      const newApp: Appointment = {
        id: `pat-local-${Date.now()}`,
        dbId: Date.now(),
        ...variables
      };
      
      const cached = localStorage.getItem('rocita_appointments');
      const list = cached ? JSON.parse(cached) : [];
      const updated = [...list, newApp];
      localStorage.setItem('rocita_appointments', JSON.stringify(updated));
      
      queryClient.setQueryData(['appointments'], updated);
      toast.success('Cita programada localmente (Modo Offline).');
    }
  });

  // 4. Update Appointment Mutation (handles edit & cancel)
  const updateMutation = useMutation({
    mutationFn: async ({ dbId, payload }: { dbId: number; payload: Partial<Appointment> }) => {
      const token = localStorage.getItem('rocita_token');
      const res = await fetch(`${apiUrl}/patients/${dbId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al actualizar cita en el servidor');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Cita actualizada con éxito.');
    },
    onError: async (error, variables) => {
      console.warn('Actualizando cita localmente offline...', error);
      const cached = localStorage.getItem('rocita_appointments');
      if (cached) {
        const list: Appointment[] = JSON.parse(cached);
        const updated = list.map((a) => {
          if (a.dbId === variables.dbId) {
            return { ...a, ...variables.payload };
          }
          return a;
        });
        localStorage.setItem('rocita_appointments', JSON.stringify(updated));
        queryClient.setQueryData(['appointments'], updated);
        toast.success('Cita actualizada localmente (Modo Offline).');
      }
    }
  });

  // 5. Delete Appointment Mutation
  const deleteMutation = useMutation({
    mutationFn: async (dbId: number) => {
      const res = await fetch(`${apiUrl}/patients/${dbId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar cita en el servidor');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Registro de cita eliminado.');
    },
    onError: async (error, dbId) => {
      console.warn('Eliminando cita localmente offline...', error);
      const cached = localStorage.getItem('rocita_appointments');
      if (cached) {
        const list: Appointment[] = JSON.parse(cached);
        const updated = list.filter((a) => a.dbId !== dbId);
        localStorage.setItem('rocita_appointments', JSON.stringify(updated));
        queryClient.setQueryData(['appointments'], updated);
        toast.success('Cita eliminada de la memoria local.');
      }
    }
  });

  return {
    appointments: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createAppointment: createMutation.mutateAsync,
    updateAppointment: updateMutation.mutateAsync,
    deleteAppointment: deleteMutation.mutateAsync,
  };
}
