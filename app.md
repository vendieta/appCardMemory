# Prompt — Flash Card App en Expo

Crea una app móvil de flash cards en Expo (React Native) con las siguientes especificaciones completas:

---

## STACK

- Expo (React Native) con TypeScript
- expo-sqlite para almacenamiento local
- expo-speech para Text-to-Speech
- expo-document-picker para importar JSON
- expo-sharing para exportar JSON
- React Navigation (Stack + Bottom Tabs)
- Animated API nativa para animaciones

---

## ESTRUCTURA DE CARPETAS

```
src/
  db/
    database.ts         # inicialización SQLite y migraciones
    subjects.ts         # queries de materias
    sections.ts         # queries de secciones
    cards.ts            # queries de cartas
    progress.ts         # queries de card_progress
    streak.ts           # queries de racha
  screens/
    HomeScreen.tsx
    SubjectScreen.tsx
    SectionScreen.tsx
    StudyScreen.tsx
    StatsScreen.tsx
  components/
    FlipCard.tsx
    StreakBanner.tsx
    SubjectCard.tsx
    ProgressBar.tsx
  utils/
    leitner.ts          # lógica de spaced repetition
    streak.ts           # lógica de racha
    importExport.ts     # lógica import/export JSON
  navigation/
    AppNavigator.tsx
```

---

## SCHEMA SQLite

```sql
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#4F46E5',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS card_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL UNIQUE,
  box INTEGER NOT NULL DEFAULT 1,
  next_review TEXT DEFAULT (date('now')),
  last_reviewed TEXT,
  total_correct INTEGER DEFAULT 0,
  total_incorrect INTEGER DEFAULT 0,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS streak (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_study_date TEXT,
  cards_correct_today INTEGER DEFAULT 0
);
```

---

## SISTEMA LEITNER (5 cajas)

Intervalos de revisión por caja:

- Box 1: revisar en 1 día
- Box 2: revisar en 2 días
- Box 3: revisar en 4 días
- Box 4: revisar en 8 días
- Box 5: revisar en 16 días

Lógica:

- Si el usuario acierta → box++ (máximo 5), next_review = hoy + intervalo[box]
- Si el usuario falla → box = 1, next_review = mañana
- Al iniciar sesión de estudio, cargar solo cartas donde next_review <= hoy
- Si una carta no tiene card_progress, crearla automáticamente con box=1

---

## LÓGICA DE RACHA

- Racha válida: acertar un mínimo de 10 cartas en el día
- Al acertar una carta: cards_correct_today++
- Cuando cards_correct_today llega a 10:
  - Si last_study_date == ayer → current_streak++
  - Si last_study_date == hoy → ya contó, no hacer nada
  - Si last_study_date < ayer o null → current_streak = 1
  - Actualizar last_study_date = hoy
  - best_streak = MAX(current_streak, best_streak)
- Al abrir la app, si last_study_date < ayer → resetear current_streak a 0 y cards_correct_today a 0

---

## SCREENS

### HomeScreen

- Mostrar banner de racha: "🔥 X días" (current_streak) y "Mejor racha: X"
- Si cards_correct_today < 10, mostrar progreso: "X/10 cartas para mantener racha"
- Lista de materias como cards con su color
- Badge en cada materia mostrando cuántas cartas están due hoy
- Botón flotante (+) para crear nueva materia
- Al crear materia: modal con campo nombre + selector de color (mínimo 6 colores predefinidos)

### SubjectScreen

- Header con nombre y color de la materia
- Lista de secciones
- Botón "Estudiar todo" (abre StudyScreen con todas las cartas due de esa materia)
- Botón "📥 Importar JSON"
- Botón "📤 Exportar JSON"
- Botón (+) para crear nueva sección
- Al tocar una sección → SectionScreen

### SectionScreen

- Lista de cartas (frente visible)
- Botón "Estudiar sección" (solo cartas due de esta sección)
- Botón (+) para agregar carta (modal con campo frente y reverso)
- Swipe to delete en cada carta
- Mostrar badge de box Leitner en cada carta (Box 1-5)

### StudyScreen

- Recibe por params: sectionId (opcional) o subjectId, para cargar las cartas due correspondientes
- Si no hay cartas due: mostrar mensaje "No hay cartas para revisar hoy 🎉" con fecha de próxima revisión
- Mostrar progress bar: "carta X de Y"
- FlipCard component:
  - Frente: texto de la carta + botón 🔊 que llama expo-speech para leer el frente
  - Reverso (al tocar): texto del reverso + botón 🔊 que lee el reverso
  - Animación flip 3D usando Animated.Value con rotateY
- Debajo de la carta (solo visible cuando está volteada):
  - Botón "✅ Lo supe" → llama leitner.correct(cardId), incrementa streak counter
  - Botón "❌ No lo supe" → llama leitner.incorrect(cardId)
- Al terminar todas las cartas: pantalla de resumen con:
  - Total correctas / incorrectas de la sesión
  - Si alcanzó las 10 para la racha: mostrar "🔥 ¡Racha mantenida!"

### StatsScreen (accesible desde HomeScreen)

- Racha actual y mejor racha
- Cards correct today (X/10)
- Por materia: mastery % (correctas / total intentos * 100)
- Lista de cartas más dominadas (top 5 por total_correct)
- Lista de cartas más falladas (top 5 por total_incorrect)

---

## IMPORT / EXPORT JSON

### Formato de IMPORT

```json
{
  "subject": "Inglés",
  "color": "#4F46E5",
  "sections": [
    {
      "name": "Palabras",
      "cards": [
        { "front": "Apple", "back": "Manzana" },
        { "front": "Run", "back": "Correr" }
      ]
    },
    {
      "name": "Frases",
      "cards": [
        { "front": "How are you?", "back": "¿Cómo estás?" }
      ]
    }
  ]
}
```

Lógica de import:

- Usar expo-document-picker para seleccionar el archivo JSON
- Parsear y validar que tenga la estructura correcta
- Si ya existe una materia con ese nombre: preguntar si sobreescribir o crear nueva
- Insertar materia, secciones y cartas en SQLite
- Usar transacciones SQLite para el insert masivo
- Crear card_progress automáticamente para cada carta con box=1

### Formato de EXPORT

```json
{
  "subject": "Inglés",
  "exported_at": "2026-06-14T12:00:00Z",
  "sections": [
    {
      "name": "Palabras",
      "cards": [
        {
          "front": "Apple",
          "back": "Manzana",
          "leitner_box": 3,
          "total_correct": 8,
          "total_incorrect": 2,
          "mastery_pct": 80,
          "last_reviewed": "2026-06-13"
        }
      ]
    }
  ],
  "stats": {
    "total_cards": 45,
    "most_mastered": { "front": "Apple", "mastery_pct": 80 },
    "hardest_card": { "front": "Ephemeral", "mastery_pct": 15 },
    "overall_mastery_pct": 67
  }
}
```

Lógica de export:

- Construir el JSON con todos los datos de SQLite para esa materia
- Usar expo-sharing para compartir el archivo .json
- Nombre del archivo: `flashcards_[nombre_materia]_[fecha].json`

---

## COMPONENTES CLAVE

### FlipCard.tsx

- Props: front (string), back (string), onSpeak (side: 'front' | 'back') => void
- Usar Animated.Value para rotación 3D (rotateY 0 → 180)
- Estado interno: isFlipped (boolean)
- Al tocar la carta → flip animation (duration: 300ms)
- Mostrar botones de resultado SOLO cuando isFlipped === true

### StreakBanner.tsx

- Props: currentStreak, bestStreak, cardsCorrectToday
- Si currentStreak > 0 → mostrar fuego 🔥 y número
- Progress bar de cardsCorrectToday / 10

---

## NOTAS IMPORTANTES

- Inicializar la tabla streak con una fila (id=1) al crear la DB si no existe
- Usar transacciones SQLite para el import masivo de cartas
- El TTS con expo-speech usar el idioma 'en-US' para inglés por defecto; si la materia no es inglés usar 'es-ES'
- Manejar el caso donde el usuario abre StudyScreen y no hay cartas due (mostrar mensaje amigable con fecha de próxima revisión)
- Al eliminar una materia, el CASCADE debe borrar secciones, cartas y card_progress en cadena
- Toda la navegación debe tener un botón de back claro
- Los colores predefinidos para materias: #4F46E5, #059669, #DC2626, #D97706, #7C3AED, #0891B2