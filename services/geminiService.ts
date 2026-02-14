import { GoogleGenAI } from "@google/genai";
import { EvaluationRecord, ClassAnalysisResult, AICluster } from "../types";
import { MOCK_AI_CLUSTERS } from "./mockData";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Simulate API call delay for better UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeClassPatterns = async (records: EvaluationRecord[]): Promise<ClassAnalysisResult> => {
  if (records.length === 0) return { clusters: [], summary: 'Sin datos para analizar' };

  try {
    const model = 'gemini-3-flash-preview'; 

    // Construct the prompt with all observations
    const observationsList = records.map(r => 
      `- Alumno: ${r.studentName}, Nota: ${r.grade}, Obs: "${r.teacherObservation}"`
    ).join('\n');

    const prompt = `
      Actúa como un Coordinador Pedagógico Experto. Analiza las siguientes observaciones de un grupo de estudiantes de 6to Grado en Lenguaje.
      
      DATOS:
      ${observationsList}

      TAREA:
      1. Agrupa a los estudiantes por "Patrones de Dificultad" similares (ej. Morfosintaxis, Comprensión Lectora, Conducta).
      2. Para cada grupo, define:
         - Dificultad Detectada (Título descriptivo).
         - Categoría (Académico, Conductual, Emocional).
         - Frecuencia (Cantidad de alumnos).
         - Lista exacta de nombres de estudiantes.
         - Acciones Sugeridas (Plan de intervención concreto).

      FORMATO JSON ESPERADO:
      {
        "clusters": [
          {
            "difficulty": "string",
            "category": "Académico" | "Conductual",
            "frequency": number,
            "students": ["string"],
            "suggestedActions": "string"
          }
        ],
        "summary": "string"
      }
    `;

    // FOR PROTOTYPE: Check if we have an API key. If not, return Mock Data to ensure the UI works for the user.
    if (!process.env.API_KEY) {
      await delay(1500); // Fake loading
      return {
        clusters: MOCK_AI_CLUSTERS,
        summary: "Análisis simulado generado exitosamente."
      };
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Batch Analysis Failed:", error);
    // Fallback to mock data on error
    return {
        clusters: MOCK_AI_CLUSTERS,
        summary: "Datos simulados por error de conexión."
    };
  }
};

export const analyzeObservation = async (observation: string) => {
    // Keeping existing single analysis for backward compatibility if needed
    return { sentiment: 'Neutral', programFlaws: [], summary: '' };
};