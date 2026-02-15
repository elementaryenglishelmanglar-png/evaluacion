
import React, { useState, useRef, useEffect } from 'react';
import { appStore } from '../services/store';
import { Student } from '../types';
import { UserPlus, Camera, Upload, Users, Search, Phone, User, Save, Check } from 'lucide-react';

export default function StudentManager() {
    const [selectedGrade, setSelectedGrade] = useState('6to Grado');
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [motherPhone, setMotherPhone] = useState('');
    const [fatherPhone, setFatherPhone] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // List Data
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        const fetchStudents = async () => {
            const allStudents = await appStore.getStudentsByGrade(selectedGrade);
            setStudents(allStudents);
        };
        fetchStudents();
    }, [selectedGrade]);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoPreview(url);
        }
    };

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !lastName) return;

        const newStudent: Student = {
            id: crypto.randomUUID(),
            firstName,
            lastName,
            name: `${lastName}, ${firstName}`,
            grade: selectedGrade,
            status: 'Active',
            motherName,
            motherPhone,
            fatherName,
            fatherPhone,
            photoUrl: photoPreview || undefined
        };

        appStore.addStudent(newStudent);

        // Reset Form
        setFirstName('');
        setLastName('');
        setMotherName('');
        setFatherName('');
        setMotherPhone('');
        setFatherPhone('');
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-sm shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg text-white">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            Matrícula
                        </h2>
                        <p className="text-slate-500 mt-1">Gestión de datos personales y familiares del alumnado</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-slate-50 p-6 gap-6">

                {/* LEFT PANEL: Student List */}
                <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 mb-3"
                        >
                            <option value="1er Grado">1er Grado</option>
                            <option value="2do Grado">2do Grado</option>
                            <option value="3er Grado">3er Grado</option>
                            <option value="4to Grado">4to Grado</option>
                            <option value="5to Grado">5to Grado</option>
                            <option value="6to Grado">6to Grado</option>
                        </select>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar alumno..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {students.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No hay alumnos en este grado.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredStudents.map(s => (
                                    <div key={s.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-3">
                                        {s.photoUrl ? (
                                            <img src={s.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{s.lastName}, {s.firstName}</p>
                                            <p className="text-xs text-slate-400">ID: {s.id.substring(0, 8)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400 font-bold uppercase">
                        {filteredStudents.length} Estudiantes Inscritos
                    </div>
                </div>

                {/* RIGHT PANEL: Registration Form */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                            Ficha de Ingreso: {selectedGrade}
                        </h3>
                    </div>

                    <form onSubmit={handleAddStudent} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-8">

                            {/* 1. Photo & Basic Info */}
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex flex-col items-center gap-4 shrink-0 mx-auto md:mx-0">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-32 h-32 rounded-full border-4 border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-200 hover:text-indigo-500 transition-all overflow-hidden relative group shadow-inner"
                                    >
                                        {photoPreview ? (
                                            <>
                                                <img src={photoPreview} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Camera className="w-8 h-8 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="w-8 h-8 mb-1" />
                                                <span className="text-[10px] font-bold uppercase">Subir Foto</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                    />
                                </div>

                                <div className="flex-1 w-full space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase border-b border-slate-100 pb-2 mb-4">Datos del Estudiante</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Nombres</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-indigo-500"
                                                placeholder="Ej. Juan Andrés"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Apellidos</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-indigo-500"
                                                placeholder="Ej. Pérez García"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Grado Asignado</label>
                                        <input
                                            disabled
                                            value={selectedGrade}
                                            className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm text-slate-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Family Info */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase border-b border-slate-100 pb-2 mb-6 mt-2">Datos Familiares de Contacto</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Mother */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-rose-500 mb-2">
                                            <User className="w-4 h-4" />
                                            <span className="font-bold text-sm">Datos de la Madre</span>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Completo</label>
                                            <input
                                                type="text"
                                                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-indigo-500"
                                                placeholder="Nombre de la madre"
                                                value={motherName}
                                                onChange={(e) => setMotherName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono Móvil</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    className="w-full pl-9 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-indigo-500"
                                                    placeholder="0414-000-0000"
                                                    value={motherPhone}
                                                    onChange={(e) => setMotherPhone(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Father */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-blue-500 mb-2">
                                            <User className="w-4 h-4" />
                                            <span className="font-bold text-sm">Datos del Padre</span>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Completo</label>
                                            <input
                                                type="text"
                                                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-indigo-500"
                                                placeholder="Nombre del padre"
                                                value={fatherName}
                                                onChange={(e) => setFatherName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono Móvil</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    className="w-full pl-9 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-indigo-500"
                                                    placeholder="0414-000-0000"
                                                    value={fatherPhone}
                                                    onChange={(e) => setFatherPhone(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </form>

                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button
                            onClick={handleAddStudent}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Matricular Estudiante
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
