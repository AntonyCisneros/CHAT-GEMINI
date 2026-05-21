# Resumen de Configuraciones Implementadas

## 1. Diseño Glass-morphism (Dark Theme)
**Archivos modificados:**
- `src/features/chat/presentation/screens/ChatScreen.tsx`
- `src/features/chat/presentation/components/MessageBubble.tsx`

**Cambios:**
- Fondo oscuro `#0e0e0e` con glows simulando mesh gradient
- Header tipo glass con ícono de menú + título "Gemini"
- Burbujas de mensaje con fondo translúcido y bordes sutiles (glass effect)
- Input bar tipo glass con `borderRadius: 36` y efecto de glow al enfocar
- Paleta de colores: primary `#cebdff`, secondary `#7cd0ff`, tertiary `#f6be41`
- Encabezado "Gemini Intelligence" con ícono sparkle en mensajes de la IA
- Disclaimer al pie

## 2. Renderizado de Markdown en respuestas de la IA
**Librería instalada:** `react-native-markdown-display`
**Archivo modificado:** `src/features/chat/presentation/components/MessageBubble.tsx`

**Cambios:**
- Los mensajes del usuario siguen como `Text` plano
- Los mensajes de la IA se renderizan con `<Markdown>`
- Estilos personalizados para: headings, bold, italic, código inline, bloques de código, links, blockquotes, listas
- Código inline con fondo `rgba(206, 189, 255, 0.1)` y color `#cebdff`
- Bloques de código con fondo semitransparente y `borderRadius: 8`

## 3. Reconocimiento de Voz (Speech-to-Text)
**Librería instalada:** `expo-speech-recognition`
**Archivos creados/modificados:**
- `src/features/chat/presentation/hooks/useSpeechRecognition.ts`
- `src/features/chat/presentation/screens/ChatScreen.tsx`
- `app.json` (plugin registrado)

**Comportamiento:**
- Botón de micrófono en el input
- **En development build** (`expo run:android` / `expo run:ios`): usa `expo-speech-recognition` nativo
- **En web:** usa Web Speech API como fallback
- **En Expo Go mobile:** no soportado (no hay módulo nativo ni Web Speech API)
- Idioma: `es-EC`, resultados parciales, puntuación automática
- El transcript se streamnea en tiempo real al TextInput

## 4. Lectura en Voz Alta de respuestas (Text-to-Speech)
**Librería instalada:** `expo-speech`
**Archivo modificado:** `src/features/chat/presentation/components/MessageBubble.tsx`

**Comportamiento:**
- Ícono de altavoz en cada mensaje de la IA
- Tap → lee el mensaje en español (`es-EC`)
- Tap durante reproducción → detiene
- Funciona en Expo Go (Android, iOS y web)

---

## Pregunta: ¿Qué ocurriría si mañana queremos cambiar Gemini por la API de OpenAI?

### Archivos que se deberían modificar:

| Archivo | Razón |
|---|---|
| `src/features/chat/domain/repositories/ChatRepository.ts` | Interfaz abstracta del repositorio. Probablemente no necesita cambios porque la interfaz `sendMessage(userMessage, history)` es genérica. |
| `src/features/chat/data/datasources/GeminiDataSource.ts` | **Archivo principal a cambiar.** Contiene toda la lógica de conexión con la API de Gemini (modelo, safety settings, construcción del historial). Habría que reemplazarlo por un `OpenAIDataSource.ts` que use `openai` npm package y llame a `chat.completions.create()`. |
| `src/features/chat/data/repositories/ChatRepositoryImpl.ts` | Inyecta el DataSource. Cambiaría la instancia de `GeminiDataSource` por `OpenAIDataSource`. |
| `src/features/chat/presentation/hooks/useChat.ts` | Crea el caso de uso con el repositorio. No necesita cambios si el repositorio mantiene la misma interfaz. |
| `.env` | Se cambiaría `EXPO_PUBLIC_GEMINI_API_KEY` por `EXPO_PUBLIC_OPENAI_API_KEY` (u otra variable). |

### ¿Por qué estos archivos específicos?

La aplicación sigue una **arquitectura limpia** con tres capas:

```
Presentation (UI) → Domain (reglas de negocio) → Data (fuentes externas)
```

- **Domain** (`ChatRepository.ts`) define el *contrato* — solo dice qué se puede hacer (enviar mensaje y obtener respuesta). No sabe quién implementa eso. No cambia.
- **Data/DataSource** (`GeminiDataSource.ts`) es la *implementación concreta* de la conexión HTTP a un proveedor de IA. Al cambiar de Gemini a OpenAI, solo esta capa se reemplaza completamente.
- **Data/Repository** (`ChatRepositoryImpl.ts`) es un *adaptador* que conecta el datasource con el dominio. Requiere un cambio mínimo (instanciar el nuevo datasource).
- **Presentation** (hooks, screens) solo habla con el dominio a través de la interfaz abstracta. No necesita saber si el backend es Gemini, OpenAI, o un mock. **No se modifica.**

Este diseño permite cambiar de proveedor de IA modificando solo **2 archivos** (el datasource y su instanciación en el repositorio), sin tocar nada de la interfaz de usuario ni la lógica de negocio.
