# Widget de Chat – React + TypeScript + Vite

Un widget flotante y ligero que se puede integrar en cualquier aplicación React.  
Se conecta a un backend compatible con Poe (o al API que configures) y ofrece:

* Un botón FAB que abre/cierra la ventana del chat.
* Renderizado de Markdown para las respuestas del asistente.
* Indicador de “escribiendo” mientras el asistente genera una respuesta.
* Desplazamiento automático al último mensaje.
* Conversación persistente almacenada en `localStorage`.
* Tematización sencilla mediante `POE_CONFIG.widget.accentColor`.

## Inicio rápido

```bash
# 1️⃣ Clona el repositorio
git clone https://github.com/your-username/chat-widget.git
cd chat-widget

# 2️⃣ Instala las dependencias
npm install   # o: yarn install / pnpm i

# 3️⃣ Configura el widget
```

### Configuración requerida

Edita **`src/components/Poe.config.ts`** y proporciona tus propios valores:

```ts
export const POE_CONFIG = {
  /** Identificador del bot con el que deseas conversar */
  botName: "mi‑bot",

  /** API key o token requerido por tu backend */
  accessKey: "TU_API_KEY_AQUI",

  /** Personalización de la UI */
  widget: {
    title: "MiChat",               // se muestra en el encabezado y como iniciales del avatar
    placeholder: "Pregúntame lo que quieras…",
    accentColor: "#4f46e5",        // color principal usado en todo el widget
  },
};
```

> **Consejo:** Si utilizas un backend diferente, adapta `src/components/UsePoe.ts` para que coincida con su formato de solicitud.

### Ejecutar el servidor de desarrollo

```bash
npm run dev   # Vite arranca en http://localhost:5173
```

Abre la URL en tu navegador; deberías ver el botón FAB en la esquina inferior derecha. Haz clic para abrir la ventana del chat y comenzar a interactuar.

## Compilación para producción

```bash
npm run build   # genera la carpeta `dist/`
npm preview     # (opcional) previsualiza la aplicación compilada localmente
```

Despliega el contenido de `dist/` en cualquier proveedor de hosting estático (Netlify, Vercel, GitHub Pages, etc.).

## Estructura del proyecto – a grandes rasgos

```
src/
 ├─ components/
 │   ├─ Chatwidget.tsx   ← Componente UI (FAB + ventana de chat)
 │   ├─ UsePoe.ts        ← Hook que gestiona llamadas al API y el estado
 │   └─ Poe.config.ts    ← Configuración (nombre del bot, clave, colores)
 ├─ App.tsx              ← Renderiza <ChatWidget />
 └─ main.tsx             ← Punto de entrada de React
public/                   ← Recursos estáticos (iconos, imágenes)
vite.config.ts            ← Configuración de Vite + plugin React
eslint.config.js          ← Reglas ESLint (ver README para extensiones)
```

## Personalización del aspecto

Todos los colores se derivan de `POE_CONFIG.widget.accentColor`.  
Si necesitas cambios más profundos, edita los objetos de estilo en **`Chatwidget.tsx`** (`btnBase`, `sendBtn`, etc.) o sustitúyelos por módulos CSS / clases Tailwind según prefieras.

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| No hay respuesta tras enviar un mensaje | Falta la API key, es inválida o el backend no responde | Verifica `accessKey` y que el endpoint en `UsePoe.ts` sea correcto. |
| El widget no se abre | Conflicto de CSS o error JavaScript | Abre la consola del navegador, busca errores y asegura que React está montado correctamente (`<App />`). |
| La conversación desaparece al recargar | `localStorage` deshabilitado o borrado | Asegúrate de que el navegador permite `localStorage`; el hook guarda bajo la clave `"conversation"`. |

