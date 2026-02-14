
import React, { useState } from 'react';
import { Competency, Indicator } from '../types';
import { appStore } from '../services/store';
import { Book, Plus, Trash2, ListTree, ChevronRight, GraduationCap, ArrowRight, Layers } from 'lucide-react';

export default function CompetencyLibrary() {
  const [grade, setGrade] = useState('6to Grado');
  const [subject, setSubject] = useState('Lenguaje');
  
  // Selection State
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  
  // Create State
  const [isCreatingComp, setIsCreatingComp] = useState(false);
  const [newCompDesc, setNewCompDesc] = useState('');
  const [newCompType, setNewCompType] = useState<'Concept' | 'Procedural' | 'Attitude'>('Concept');

  const [isCreatingInd, setIsCreatingInd] = useState(false);
  const [newIndDesc, setNewIndDesc] = useState('');
  const [newIndType, setNewIndType] = useState<'Cognitive' | 'Procedural' | 'Attitudinal'>('Cognitive');

  // Computed Data
  const competencies = appStore.getCompetencies(grade, subject);
  const selectedCompetency = competencies.find(c => c.id === selectedCompId);
  const indicators = selectedCompId ? appStore.getIndicators(selectedCompId) : [];

  const handleAddCompetency = () => {
    if(!newCompDesc.trim()) return;
    const newComp: Competency = {
        id: crypto.randomUUID(),
        gradeLevel: grade,
        subject: subject,
        description: newCompDesc,
        type: newCompType
    };
    appStore.addCompetency(newComp);
    setNewCompDesc('');
    setIsCreatingComp(false);
    setSelectedCompId(newComp.id); // Auto select
  };

  const handleDeleteCompetency = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(window.confirm('¿Eliminar competencia y sus indicadores?')) {
          appStore.deleteCompetency(id);
          if(selectedCompId === id) setSelectedCompId(null);
      }
  };

  const handleAddIndicator = () => {
      if(!newIndDesc.trim() || !selectedCompId) return;
      const newInd: Indicator = {
          id: crypto.randomUUID(),
          competencyId: selectedCompId,
          description: newIndDesc,
          type: newIndType
      };
      appStore.addIndicator(newInd);
      setNewIndDesc('');
      setIsCreatingInd(false);
  };

  const handleDeleteIndicator = (id: string) => {
      appStore.deleteIndicator(id);
  };

  const getTypeLabel = (type: string) => {
      const map: Record<string, string> = {
          'Concept': 'Conceptual',
          'Procedural': 'Procedimental',
          'Attitude': 'Actitudinal',
          'Cognitive': 'Cognitivo',
          'Attitudinal': 'Actitudinal'
      };
      return map[type] || type;
  };

  const getTypeColor = (type: string) => {
    if(type.includes('Concept') || type.includes('Cognitive')) return 'bg-blue-100 text-blue-700';
    if(type.includes('Procedural')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-purple-100 text-purple-700';
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      
      {/* 1. Header & Context */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-sm shrink-0">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                      <div className="bg-indigo-600 p-2 rounded-lg text-white">
                          <ListTree className="w-6 h-6" />
                      </div>
                      Malla Curricular
                  </h2>
                  <p className="text-slate-500 mt-1">Gestión de Competencias e Indicadores de Desempeño</p>
              </div>
              <div className="flex gap-3">
                  <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-400 uppercase">Total Competencias</p>
                      <p className="text-xl font-bold text-indigo-600">{competencies.length}</p>
                  </div>
              </div>
          </div>

          <div className="flex gap-4">
              <select 
                  value={grade} onChange={(e) => { setGrade(e.target.value); setSelectedCompId(null); }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                  <option value="1er Grado">1er Grado</option>
                  <option value="2do Grado">2do Grado</option>
                  <option value="3er Grado">3er Grado</option>
                  <option value="4to Grado">4to Grado</option>
                  <option value="5to Grado">5to Grado</option>
                  <option value="6to Grado">6to Grado</option>
              </select>
              <select 
                  value={subject} onChange={(e) => { setSubject(e.target.value); setSelectedCompId(null); }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                  <option value="Lenguaje">Lenguaje</option>
                  <option value="Matemáticas">Matemáticas</option>
                  <option value="Inglés">Inglés</option>
              </select>
          </div>
      </div>

      {/* 2. Main Content - Split View */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50 p-6 gap-6">
          
          {/* LEFT: Competencies List */}
          <div className="w-full md:w-1/3 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <Book className="w-4 h-4 text-slate-400" /> Competencias
                  </h3>
                  <button 
                    onClick={() => setIsCreatingComp(true)}
                    className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-md transition-colors"
                  >
                      <Plus className="w-5 h-5" />
                  </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {isCreatingComp && (
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-2 animate-in slide-in-from-top-2">
                          <textarea 
                             autoFocus
                             className="w-full text-sm border-slate-300 rounded-md p-2 mb-2 focus:ring-indigo-500 focus:border-indigo-500"
                             placeholder="Descripción de la competencia..."
                             rows={2}
                             value={newCompDesc}
                             onChange={e => setNewCompDesc(e.target.value)}
                          />
                          <div className="flex gap-2 mb-2">
                               <select 
                                  value={newCompType} 
                                  onChange={(e: any) => setNewCompType(e.target.value)}
                                  className="text-xs border-slate-300 rounded px-2 py-1"
                               >
                                   <option value="Concept">Conceptual</option>
                                   <option value="Procedural">Procedimental</option>
                                   <option value="Attitude">Actitudinal</option>
                               </select>
                          </div>
                          <div className="flex justify-end gap-2">
                              <button onClick={() => setIsCreatingComp(false)} className="text-xs text-slate-500 hover:text-slate-800">Cancelar</button>
                              <button onClick={handleAddCompetency} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Guardar</button>
                          </div>
                      </div>
                  )}

                  {competencies.length === 0 && !isCreatingComp && (
                      <div className="text-center py-10 text-slate-400">
                          <p>No hay competencias registradas.</p>
                      </div>
                  )}

                  {competencies.map(comp => (
                      <div 
                        key={comp.id}
                        onClick={() => setSelectedCompId(comp.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md relative group
                            ${selectedCompId === comp.id 
                                ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-100' 
                                : 'bg-white border-slate-100 hover:border-indigo-200'
                            }`}
                      >
                          <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${getTypeColor(comp.type)}`}>
                                  {getTypeLabel(comp.type)}
                              </span>
                              {selectedCompId === comp.id && (
                                  <button 
                                    onClick={(e) => handleDeleteCompetency(comp.id, e)}
                                    className="text-slate-300 hover:text-rose-500 transition-colors"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              )}
                          </div>
                          <p className={`text-sm font-medium leading-relaxed ${selectedCompId === comp.id ? 'text-slate-800' : 'text-slate-600'}`}>
                              {comp.description}
                          </p>
                          {selectedCompId === comp.id && (
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-indigo-600 rounded-full p-1 shadow-lg hidden md:block z-10">
                                  <ChevronRight className="w-4 h-4 text-white" />
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* RIGHT: Indicators List (Detail) */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
              {!selectedCompetency ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                      <div className="bg-slate-50 p-6 rounded-full mb-4">
                          <Layers className="w-12 h-12 text-slate-300" />
                      </div>
                      <p className="font-medium">Selecciona una competencia para gestionar sus indicadores</p>
                  </div>
              ) : (
                  <>
                      <div className="p-6 bg-indigo-50 border-b border-indigo-100">
                           <h3 className="text-lg font-bold text-indigo-900 mb-2">Detalle de Competencia</h3>
                           <p className="text-indigo-700/80 leading-relaxed text-sm bg-white/50 p-3 rounded-lg border border-indigo-100">
                               {selectedCompetency.description}
                           </p>
                      </div>

                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                          <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                              <ArrowRight className="w-4 h-4 text-slate-400" /> Indicadores de Desempeño ({indicators.length})
                          </h4>
                          <button 
                            onClick={() => setIsCreatingInd(true)}
                            className="flex items-center gap-2 text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                              <Plus className="w-4 h-4" /> Agregar Indicador
                          </button>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                           {isCreatingInd && (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 animate-in slide-in-from-top-2">
                                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Nuevo Indicador</h5>
                                    <textarea 
                                        autoFocus
                                        className="w-full text-sm border-slate-300 rounded-md p-3 mb-3 focus:ring-slate-500 focus:border-slate-500"
                                        placeholder="Descripción del indicador observable..."
                                        rows={2}
                                        value={newIndDesc}
                                        onChange={e => setNewIndDesc(e.target.value)}
                                    />
                                    <div className="flex justify-between items-center">
                                         <div className="flex gap-2">
                                            {['Cognitive', 'Procedural', 'Attitudinal'].map(t => (
                                                <button
                                                   key={t}
                                                   onClick={() => setNewIndType(t as any)}
                                                   className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                                                       newIndType === t 
                                                       ? 'bg-slate-700 text-white border-slate-700' 
                                                       : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                                                   }`}
                                                >
                                                    {getTypeLabel(t)}
                                                </button>
                                            ))}
                                         </div>
                                         <div className="flex gap-2">
                                            <button onClick={() => setIsCreatingInd(false)} className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5">Cancelar</button>
                                            <button onClick={handleAddIndicator} className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded font-bold hover:bg-indigo-700">Guardar Indicador</button>
                                         </div>
                                    </div>
                                </div>
                           )}

                           {indicators.length === 0 && !isCreatingInd && (
                                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                                    <p>Esta competencia no tiene indicadores asignados aún.</p>
                                </div>
                           )}

                           <div className="space-y-3">
                               {indicators.map(ind => (
                                   <div key={ind.id} className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm group">
                                       <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                           ind.type === 'Cognitive' ? 'bg-blue-400' : 
                                           ind.type === 'Procedural' ? 'bg-emerald-400' : 'bg-purple-400'
                                       }`}></div>
                                       <div className="flex-1">
                                           <p className="text-sm text-slate-700">{ind.description}</p>
                                           <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{getTypeLabel(ind.type)}</p>
                                       </div>
                                       <button 
                                          onClick={() => handleDeleteIndicator(ind.id)}
                                          className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                       >
                                           <Trash2 className="w-4 h-4" />
                                       </button>
                                   </div>
                               ))}
                           </div>
                      </div>
                  </>
              )}
          </div>

      </div>
    </div>
  );
}
