# SecurOps · Frontend

Suite de operaciones en campo para seguridad electrónica: **cercos eléctricos, CCTV y portones automatizados**.

## Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (tema propio en `src/index.css`)
- Zustand + IndexedDB (`idb-keyval`) → offline-first con cola de sincronización
- PWA (vite-plugin-pwa) → instalable y usable sin internet
- React Router (code-splitting por módulo) · lucide-react

## Scripts
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build de producción con service worker
npm run lint
```

## Estructura
```
src/
  types.ts                 Modelo de dominio (contrato para el backend)
  lib/                     Lógica pura: fence.ts, cctv.ts, gate.ts, quote.ts, whatsapp.ts, domain.ts…
  store/useStore.ts        Estado persistido en IndexedDB + cola `queue` de cambios (flushQueue = punto de integración API)
  components/ui/           Kit de componentes (Button, Stepper, Modal, Segmented…)
  components/layout/       Shell, sidebar, paleta de comandos (Ctrl+K), indicador de sincronización
  features/                Formularios y piezas por dominio (bitácora, agenda, campañas…)
  pages/                   Pantallas (cargadas de forma diferida)
```

## Integración con el backend (siguiente fase)
- `useStore.flushQueue()` → enviar `queue` a `POST /sync` y resolver conflictos.
- Campañas: el envío "ahora"/programado debe ejecutarlo el backend vía WhatsApp Business API; el "Envío manual" ya funciona con enlaces `wa.me`.
- Precios y catálogo (`settings`) pasarán a ser recursos del servidor.
