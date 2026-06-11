const XLSX = require('xlsx');
const path = require('path');

const data = [
  {
    'Documento': '10203040',
    'Nombre': 'Carlos Humberto Pérez',
    'Telefono': '3005291396',
    'Doctor': 'Dra. Carolina Gómez',
    'Especialidad': 'Cardiología',
    'Fecha': 'Lunes 15 de Junio',
    'Hora': '10:30 AM',
    'Correo': 'carlos.perez@example.com'
  },
  {
    'Documento': '50607080',
    'Nombre': 'Laura Camila Ruiz',
    'Telefono': '3005291396',
    'Doctor': 'Dr. Alejandro Restrepo',
    'Especialidad': 'Dermatología',
    'Fecha': 'Martes 16 de Junio',
    'Hora': '02:15 PM',
    'Correo': 'laura.ruiz@example.com'
  },
  {
    'Documento': '90101112',
    'Nombre': 'Mateo Sebastián Sánchez',
    'Telefono': '3005291396',
    'Doctor': 'Dr. Manuel Cabrera',
    'Especialidad': 'Oftalmología',
    'Fecha': 'Miércoles 17 de Junio',
    'Hora': '09:00 AM',
    'Correo': 'mateo.sanchez@example.com'
  }
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, 'Citas');

// Guardar en el directorio del dashboard
const filePath = path.join(__dirname, 'Citas_Prueba_Rocita.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Excel creado con éxito en: ${filePath}`);
