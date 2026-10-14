// Todo el contenido del portafolio vive acá. Editá este archivo para actualizar la web.
// Los textos marcados con "revisar" son una propuesta inicial: ajustalos a tu realidad.

export const profile = {
  name: "Nicolás Reinoso",
  shortName: "Nicolás",
  role: "Estudiante de Sistemas de Información",
  location: "Buenos Aires, Argentina",
  email: "nicoereinoso5@gmail.com",
  github: "niicoreinoso",
  linkedin: "", // ej: "https://www.linkedin.com/in/tu-usuario"
  cvUrl: "", // ej: "/cv-nicolas-reinoso.pdf" (poné el PDF en /public)
  photo: "", // ej: "/foto.jpg" (poné la imagen en /public). Si está vacío se muestran tus iniciales.

  // Tarjeta "Ahora mismo" del inicio. Actualizala cada tanto: muestra que el sitio está vivo. (revisar)
  now: {
    studying: "Lic. en Sistemas · FCE-UBA",
    learning: "React, SQL y análisis de datos",
    seeking: "Mi primera pasantía en IT",
  },

  headline:
    "Uno la tecnología y la gestión para diseñar sistemas que ayuden a las organizaciones a trabajar mejor.",
  // Palabras del titular que se destacan en cursiva
  headlineHighlights: ["tecnología", "gestión"],

  education: {
    degree: "Licenciatura en Sistemas de Información de las Organizaciones",
    faculty: "Facultad de Ciencias Económicas", // revisar
    university: "Universidad de Buenos Aires", // revisar
    status: "En curso",
    // Qué cubre la carrera (lista de Formación)
    topics: ["Análisis y diseño de sistemas", "Bases de datos", "Gestión de proyectos", "Procesos de negocio"],
    description:
      "Una carrera que combina tecnología, datos y administración: análisis y diseño de sistemas, bases de datos, gestión de proyectos y procesos de negocio, siempre con foco en cómo la información genera valor en una organización.",
  },

  // Frase grande de "Sobre mí" (revisar)
  aboutLead: "Me interesa el punto donde se cruzan la tecnología y las personas.",

  // revisar
  about: [
    "Soy Nicolás, estudiante de la Licenciatura en Sistemas de Información de las Organizaciones. Me gusta entender cómo funciona una organización, detectar qué se puede mejorar y construir la herramienta que lo resuelva.",
    "Me gusta aprender haciendo. Cada materia la complemento con proyectos propios, donde pruebo tecnologías nuevas y pongo en práctica lo que veo en la facultad. Valoro el trabajo ordenado, la comunicación clara y el código que otra persona puede entender.",
  ],

  // Mis reglas de trabajo, en "Sobre mí" (revisar)
  principles: [
    "Primero entiendo, después construyo.",
    "Si no está documentado, no está terminado.",
    "Escribo código para que otra persona lo entienda.",
  ],

  // Datos rápidos debajo de la foto. Los que quedan vacíos no se muestran. (completar)
  facts: [
    { label: "Base", value: "Buenos Aires" },
    { label: "Carrera", value: "Lic. en Sistemas, FCE-UBA" },
    { label: "Idiomas", value: "" },
    { label: "Fuera de la facu", value: "" },
  ],

  // Herramientas que usás. `icon` es la clave del logo (ver src/components/site/ToolIcon.tsx).
  // `group` las agrupa por para qué las usás. Dejá solo las que realmente manejás. (revisar)
  tools: [
    { name: "Python", icon: "python", group: "data" },
    { name: "SQL", icon: "sql", group: "data" },
    { name: "Excel", icon: "excel", group: "data" },
    { name: "Power BI", icon: "powerbi", group: "data" },
    { name: "JavaScript", icon: "javascript", group: "build" },
    { name: "TypeScript", icon: "typescript", group: "build" },
    { name: "React", icon: "react", group: "build" },
    { name: "Next.js", icon: "nextjs", group: "build" },
    { name: "HTML", icon: "html", group: "build" },
    { name: "CSS", icon: "css", group: "build" },
    { name: "Git", icon: "git", group: "team" },
    { name: "GitHub", icon: "github", group: "team" },
  ],

  // Competencias por área. `icon`: "process" | "data" | "people" | "build". (revisar)
  competencies: [
    {
      group: "Análisis y procesos",
      icon: "process",
      items: ["Análisis de sistemas", "Relevamiento de requerimientos", "Modelado de procesos (BPMN)", "Diagramas UML", "Metodologías ágiles (Scrum)"],
    },
    {
      group: "Datos",
      icon: "data",
      items: ["Modelado de bases de datos", "Consultas y reportes en SQL", "Dashboards e indicadores", "Limpieza y análisis de datos"],
    },
    {
      group: "Cómo trabajo",
      icon: "people",
      items: ["Traduzco necesidades en requisitos claros", "Documento lo que hago", "Aprendo rápido y por mi cuenta", "Me sumo bien a equipos"],
    },
  ],

  // `glyph`: dibujo de la tarjeta ("paper" | "bars" | "nodes" | "cursor"). (revisar)
  interests: [
    { title: "Transformación digital", text: "Cómo la tecnología cambia la forma de trabajar de las empresas.", glyph: "paper" },
    { title: "Análisis de datos", text: "Convertir datos en decisiones claras y medibles.", glyph: "bars" },
    { title: "Inteligencia artificial", text: "Aplicaciones prácticas de la IA en procesos de negocio.", glyph: "nodes" },
    { title: "Producto y experiencia", text: "Diseñar soluciones simples para problemas reales.", glyph: "cursor" },
  ],

  // revisar
  growth: {
    intro:
      "Busco dar mis primeros pasos profesionales en roles donde pueda aportar desde el análisis y la tecnología, y seguir creciendo con equipos que valoren el aprendizaje.",
    // Un camino: hoy, próximo paso y meta
    goals: [
      { stage: "Hoy", title: "Aprendo haciendo", text: "Complemento la carrera con proyectos propios, cursos y certificaciones, y documento todo en GitHub." },
      { stage: "Próximo", title: "Mi primera pasantía", text: "Pasantías o posiciones junior en análisis funcional, análisis de datos o desarrollo." },
      { stage: "Meta", title: "Un perfil híbrido", text: "Alguien que entiende el negocio y también sabe construir la solución." },
    ],
  },

  // Repos a destacar primero (nombre exacto en GitHub, pueden ser forks como "caruflo-server").
  // Si está vacío, se muestran tus repos propios más recientes.
  featuredRepos: ["portafolio"] as string[],
};

export type Profile = typeof profile;

export const sections = [
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "habilidades", label: "Habilidades" },
  { id: "formacion", label: "Formación" },
  { id: "proyectos", label: "Proyectos" },
  { id: "contacto", label: "Contacto" },
] as const;

/** Resumen en texto plano para darle contexto a Gemini. */
export function profileAsText() {
  const p = profile;
  return [
    `Nombre: ${p.name}`,
    `Rol: ${p.role} - ${p.location}`,
    `Formación: ${p.education.degree}, ${p.education.faculty} (${p.education.university}). ${p.education.status}.`,
    `Titular: ${p.headline}`,
    `Sobre mí: ${p.aboutLead} ${p.about.join(" ")} Reglas de trabajo: ${p.principles.join(" ")}`,
    `Herramientas: ${p.tools.map((t) => t.name).join(", ")}`,
    `Competencias: ${p.competencies.map((s) => `${s.group}: ${s.items.join(", ")}`).join(" | ")}`,
    `Intereses: ${p.interests.map((i) => i.title).join(", ")}`,
    `Desarrollo profesional: ${p.growth.intro} ${p.growth.goals.map((g) => `${g.title}: ${g.text}`).join(" ")}`,
    `Contacto: ${p.email}. GitHub: github.com/${p.github}`,
  ].join("\n");
}
