# 🌸 Proyecto Rocita

> **Agente Inteligente de Gestión de Citas para 100Digital.**
> Rocita es una solución SaaS diseñada para reducir el ausentismo en instituciones de salud mediante la automatización de notificaciones y recordatorios omnicanal.

---

## 🏗️ Arquitectura del Sistema
El proyecto utiliza una estructura de **Monorepo** para garantizar la independencia entre la cara comercial y la herramienta operativa:

- **`/apps/landing`**: Landing Page de alto impacto visual enfocada en la conversión y el storytelling del producto.
- **`/apps/dashboard`**: Panel administrativo donde ocurre la carga masiva de datos y la personalización de la inteligencia de Rocita.
- **`/apps/backend`**: (En desarrollo) Basado en NestJS para orquestar la comunicación con el motor RPA.

---

## 🎨 Identidad Visual (Look & Feel)
- **Paleta de Colores**:
  - `Azul Cielo`: Confianza y Salud.
  - `Rojo Rocita (#EF4444)`: Energía, vitalidad y urgencia.
- **Estética**: Glassmorphism, tipografía de alto contraste y animaciones fluidas con Framer Motion.

---

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 14+ (App Router), TypeScript.
- **Estilos**: Tailwind CSS, Shadcn/UI.
- **Animaciones**: Framer Motion.
- **Iconografía**: Lucide React.
- **Despliegue**: Optimizado para **Dokploy** (VPS propia) mediante contenedores independientes.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
- Node.js 18+
- npm o pnpm

### Instalación
Desde la raíz del proyecto:
```bash
# Instalar dependencias en todo el monorepo
npm install
```

### Desarrollo
Para correr las aplicaciones de forma local:

**Landing Page:**
```bash
cd apps/landing
npm run dev
```

**Dashboard:**
```bash
cd apps/dashboard
npm run dev
```

---

## 📈 Roadmap del Proyecto
- [x] Fase 1: Definición de marca y arquitectura Monorepo.
- [x] Fase 2: Implementación de Landing Page con animaciones premium.
- [x] Fase 3: Dashboard funcional (Carga de Excel y Editor de Mensajes).
- [ ] Fase 4: Integración con NestJS y motor RPA Rocketbot.
- [ ] Fase 5: Pruebas de campo en 100Digital.

---

## 🛡️ Estándares de Código
- **UTF-8**: Siempre respetar la codificación para caracteres especiales.
- **Client vs Server**: Mantener la pureza de los Server Components, delegando animaciones a componentes de cliente dedicados.
- **Atomicidad**: Componentes pequeños, reutilizables y tipados.

---
