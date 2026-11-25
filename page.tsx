"use client";

import React, { useState, useEffect } from "react";

interface Task {
  id: number;
  judul: string;
  kategori: "Produktif PPLG" | "Projek" | "Umum";
  deadline: string;
  status: "Belum Selesai" | "Selesai";
}

interface Jadwal {
  id: number;
  hari: string;
  jam: string;
  mapel: string;
}

type ActivePage = "dashboard" | "tasks" | "schedule" | "focus";

export default function Dashboard() {
  // Navigasi Halaman
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");

  // State Tema Gelap / Terang
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // State Data Tugas & Jadwal
  const [tasks, setTasks] = useState<Task[]>([]);
  const [jadwals, setJadwals] = useState<Jadwal[]>([]);

  // State Input Form Tugas
  const [judulInput, setJudulInput] = useState("");
  const [kategoriInput, setKategoriInput] = useState<"Produktif PPLG" | "Projek" | "Umum">("Produktif PPLG");
  const [deadlineInput, setDeadlineInput] = useState("");

  // State Input Form Jadwal
  const [hariInput, setHariInput] = useState("Senin");
  const [jamInput, setJamInput] = useState("07:30 - 10:00");
  const [mapelInput, setMapelInput] = useState("");

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"Semua" | "Belum Selesai" | "Selesai">("Semua");

  // State Pomodoro Timer (Mode Fokus)
  const [focusMode, setFocusMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFocusTaskId, setSelectedFocusTaskId] = useState<number | "">("");

  // 1. Load data dari LocalStorage saat pertama kali dibuka
  useEffect(() => {
    const savedTasks = localStorage.getItem("study_tasks_v2");
    const savedJadwals = localStorage.getItem("study_jadwals_v2");
    const savedTheme = localStorage.getItem("study_theme");

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks([
        { id: 1, judul: "Pemrograman Web: Selesaikan CRUD Next.js", kategori: "Produktif PPLG", deadline: "2026-11-27", status: "Belum Selesai" },
        { id: 2, judul: "Matematika: Kerjakan Latihan Halaman 45", kategori: "Umum", deadline: "2026-11-26", status: "Belum Selesai" },
        { id: 3, judul: "Bahasa Indonesia: Revisi Proposal Projek", kategori: "Projek", deadline: "2026-11-22", status: "Selesai" },
      ]);
    }

    if (savedJadwals) {
      setJadwals(JSON.parse(savedJadwals));
    } else {
      setJadwals([
        { id: 1, hari: "Senin", jam: "07:30 - 11:30", mapel: "Pemrograman Web & Perangkat Bergerak" },
        { id: 2, hari: "Selasa", jam: "07:30 - 10:30", mapel: "Matematika & Bahasa Inggris" },
        { id: 3, hari: "Rabu", jam: "08:00 - 12:00", mapel: "Basis Data (Database)" },
        { id: 4, hari: "Kamis", jam: "07:30 - 11:00", mapel: "Pemrograman Berorientasi Objek (PBO)" },
        { id: 5, hari: "Jumat", jam: "07:30 - 10:30", mapel: "Produk Kreatif & Kewirausahaan" },
      ]);
    }

    if (savedTheme === "dark") setDarkMode(true);
    setIsLoaded(true);
  }, []);

  // 2. Simpan otomatis ke LocalStorage
  useEffect(() => {
    if (isLoaded) localStorage.setItem("study_tasks_v2", JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("study_jadwals_v2", JSON.stringify(jadwals));
  }, [jadwals, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("study_theme", darkMode ? "dark" : "light");
  }, [darkMode, isLoaded]);

  // 3. Logika Timer Pomodoro
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const switchTimerMode = (mode: "focus" | "break") => {
    setIsRunning(false);
    setFocusMode(mode);
    setSecondsLeft(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Fungsi Hitung Mundur Deadline
  const getCountdown = (deadlineStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(deadlineStr);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Terlewat ${Math.abs(diffDays)} hari`, color: "bg-red-100 text-red-700" };
    if (diffDays === 0) return { text: "Hari Ini!", color: "bg-orange-100 text-orange-700" };
    if (diffDays === 1) return { text: "Besok (H-1)", color: "bg-amber-100 text-amber-700" };
    return { text: `H-${diffDays} Hari lagi`, color: "bg-emerald-100 text-emerald-700" };
  };

  // CRUD Tugas
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulInput || !deadlineInput) return;

    const newTask: Task = {
      id: Date.now(),
      judul: judulInput,
      kategori: kategoriInput,
      deadline: deadlineInput,
      status: "Belum Selesai",
    };

    setTasks([newTask, ...tasks]);
    setJudulInput("");
    setDeadlineInput("");
  };

  const toggleStatus = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "Selesai" ? "Belum Selesai" : "Selesai" }
          : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
    if (selectedFocusTaskId === id) setSelectedFocusTaskId("");
  };

  // CRUD Jadwal
  const handleAddJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapelInput) return;

    const newJadwal: Jadwal = {
      id: Date.now(),
      hari: hariInput,
      jam: jamInput || "07:30 - 10:00",
      mapel: mapelInput,
    };

    setJadwals([...jadwals, newJadwal]);
    setMapelInput("");
  };

  const deleteJadwal = (id: number) => {
    setJadwals(jadwals.filter((j) => j.id !== id));
  };

  // Filter, Search & Sorting Tugas (Deadline terdekat di atas)
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.judul.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "Semua" || task.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Statistik
  const totalTugas = tasks.length;
  const tugasSelesai = tasks.filter((t) => t.status === "Selesai").length;
  const tugasBelumSelesai = totalTugas - tugasSelesai;
  const progressPercent = totalTugas === 0 ? 0 : Math.round((tugasSelesai / totalTugas) * 100);

  // Nama Hari Ini
  const hariList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const hariIni = hariList[new Date().getDay()];
  const jadwalHariIni = jadwals.filter((j) => j.hari === hariIni);

  // Styling Tema (Matcha Light vs Cozy Forest Dark)
  const bgMain = darkMode ? "bg-[#141E1A]" : "bg-[#F4F7F4]";
  const bgSidebar = darkMode ? "bg-[#192621] border-[#2E4039]" : "bg-white border-[#D8E2DC]";
  const bgCard = darkMode ? "bg-[#1E2B26] border-[#2E4039]" : "bg-white border-[#D8E2DC]";
  const textTitle = darkMode ? "text-[#E2ECE9]" : "text-[#2D4A3E]";
  const textSub = darkMode ? "text-[#9BB5AA]" : "text-[#5A7467]";
  const inputStyle = darkMode
    ? "bg-[#141E1A] border-[#2E4039] text-[#E2ECE9] placeholder-[#6B857B]"
    : "bg-white border-[#D8E2DC] text-slate-700 placeholder-slate-400";
  const itemCard = darkMode ? "bg-[#17231E] border-[#2E4039]" : "bg-[#FAFDFB] border-[#D8E2DC]";

  const navItems: { id: ActivePage; label: string; icon: string }[] = [
    { id: "dashboard", label: "Ringkasan", icon: "📊" },
    { id: "tasks", label: "Tugas & Deadline", icon: "📝" },
    { id: "schedule", label: "Jadwal Pelajaran", icon: "📅" },
    { id: "focus", label: "Mode Fokus", icon: "⏱️" },
  ];

  if (!isLoaded) return null;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${bgMain}`}>
      
      {/* SIDEBAR DESKTOP */}
      <aside className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r p-6 justify-between ${bgSidebar}`}>
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h1 className={`text-xl font-bold tracking-tight ${textTitle}`}>StudyPlanner</h1>
            </div>
            <p className={`text-xs mt-1 ${textSub}`}>XII D PPLG • SMKS Al Ittihad</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-[#52796F] text-white shadow-sm"
                      : `${textSub} hover:bg-[#52796F]/10`
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${itemCard}`}>
            <p className={`text-xs font-medium ${textSub}`}>Siswa Aktif</p>
            <p className={`text-sm font-bold mt-0.5 ${textTitle}`}>Afra Humaira</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full px-4 py-2.5 rounded-xl font-medium text-xs border transition flex items-center justify-center gap-2 ${
              darkMode
                ? "bg-[#2E4039] text-[#E2ECE9] border-[#3F574E] hover:bg-[#3A5248]"
                : "bg-[#E2ECE9] text-[#2D4A3E] border-[#C5D6CD] hover:bg-[#D2E2DA]"
            }`}
          >
            {darkMode ? "☀️ Mode Terang" : "🌙 Mode Gelap"}
          </button>
        </div>
      </aside>

      {/* HEADER MOBILE */}
      <header className={`md:hidden sticky top-0 z-20 px-5 py-4 border-b flex justify-between items-center ${bgSidebar}`}>
        <div>
          <h1 className={`text-lg font-bold ${textTitle}`}>StudyPlanner 🌱</h1>
          <p className={`text-xs ${textSub}`}>Afra Humaira • XII D PPLG</p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
            darkMode
              ? "bg-[#2E4039] text-[#E2ECE9] border-[#3F574E]"
              : "bg-[#E2ECE9] text-[#2D4A3E] border-[#C5D6CD]"
          }`}
        >
          {darkMode ? "☀️ Terang" : "🌙 Gelap"}
        </button>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 md:pl-64 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto p-5 md:p-10 space-y-8">

          {/* HALAMAN 1: RINGKASAN (DASHBOARD) */}
          {activePage === "dashboard" && (
            <>
              <div className={`p-6 md:p-8 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${bgCard}`}>
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#E2ECE9] text-[#2D4A3E] mb-2">
                    Hari {hariIni}
                  </span>
                  <h2 className={`text-2xl md:text-3xl font-bold ${textTitle}`}>Halo, Afra Humaira! 👋</h2>
                  <p className={`text-sm mt-1 ${textSub}`}>
                    Tetap semangat menyelesaikan target belajar dan projek PPLG hari ini.
                  </p>
                </div>
                <button
                  onClick={() => setActivePage("tasks")}
                  className="bg-[#52796F] hover:bg-[#3F5D53] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-sm"
                >
                  + Kelola Tugas
                </button>
              </div>

              {/* Statistik & Progress Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border shadow-sm ${bgCard}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${textSub}`}>Total Tugas</p>
                  <p className={`text-3xl font-bold mt-2 ${textTitle}`}>{totalTugas}</p>
                  <div className="w-full bg-slate-200/50 h-2 rounded-full mt-4 overflow-hidden">
                    <div
                      className="bg-[#3B7A57] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1.5 ${textSub}`}>{progressPercent}% tugas selesai</p>
                </div>

                <div className={`p-5 rounded-2xl border shadow-sm ${bgCard}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${textSub}`}>Belum Selesai</p>
                  <p className="text-3xl font-bold text-[#D97706] mt-2">{tugasBelumSelesai}</p>
                  <p className={`text-xs mt-4 ${textSub}`}>Perlu segera dikerjakan</p>
                </div>

                <div className={`p-5 rounded-2xl border shadow-sm ${bgCard}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${textSub}`}>Selesai</p>
                  <p className="text-3xl font-bold text-[#3B7A57] mt-2">{tugasSelesai}</p>
                  <p className={`text-xs mt-4 ${textSub}`}>Kerja bagus, pertahankan!</p>
                </div>
              </div>

              {/* Preview Tugas Mendesak & Jadwal Hari Ini */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tugas Mendesak */}
                <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${bgCard}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-bold ${textTitle}`}>Tugas Prioritas 🔥</h3>
                    <button
                      onClick={() => setActivePage("tasks")}
                      className="text-xs font-semibold text-[#52796F] hover:underline"
                    >
                      Lihat Semua →
                    </button>
                  </div>

                  {tasks.filter((t) => t.status === "Belum Selesai").length === 0 ? (
                    <p className={`text-sm py-6 text-center ${textSub}`}>Semua tugas sudah selesai! 🎉</p>
                  ) : (
                    <div className="space-y-3">
                      {tasks
                        .filter((t) => t.status === "Belum Selesai")
                        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                        .slice(0, 3)
                        .map((task) => {
                          const countdown = getCountdown(task.deadline);
                          return (
                            <div key={task.id} className={`p-3.5 rounded-xl border flex justify-between items-center gap-3 ${itemCard}`}>
                              <div>
                                <p className={`font-semibold text-sm ${textTitle}`}>{task.judul}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold rounded ${countdown.color}`}>
                                  {countdown.text}
                                </span>
                              </div>
                              <button
                                onClick={() => toggleStatus(task.id)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E2ECE9] text-[#3B7A57] hover:bg-[#D0E2DC] transition shrink-0"
                              >
                                Selesai ✓
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Jadwal Hari Ini */}
                <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${bgCard}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-bold ${textTitle}`}>Jadwal Hari {hariIni} 📚</h3>
                    <button
                      onClick={() => setActivePage("schedule")}
                      className="text-xs font-semibold text-[#52796F] hover:underline"
                    >
                      Atur Jadwal →
                    </button>
                  </div>

                  {jadwalHariIni.length === 0 ? (
                    <p className={`text-sm py-6 text-center ${textSub}`}>
                      Tidak ada jadwal pelajaran terdaftar untuk hari {hariIni}.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {jadwalHariIni.map((j) => (
                        <div key={j.id} className={`p-3.5 rounded-xl border ${itemCard}`}>
                          <span className="text-xs font-semibold text-[#52796F]">{j.jam}</span>
                          <p className={`font-semibold text-sm mt-0.5 ${textTitle}`}>{j.mapel}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* HALAMAN 2: TUGAS & DEADLINE */}
          {activePage === "tasks" && (
            <>
              <div>
                <h2 className={`text-2xl font-bold ${textTitle}`}>Tugas & Deadline 📝</h2>
                <p className={`text-sm mt-1 ${textSub}`}>Catat, saring, dan pantau tenggat waktu tugas sekolahmu.</p>
              </div>

              {/* Form Tambah Tugas */}
              <section className={`p-6 rounded-2xl shadow-sm border ${bgCard}`}>
                <h3 className={`text-base font-semibold mb-4 ${textTitle}`}>Tambah Tugas Baru</h3>
                <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <input
                    type="text"
                    placeholder="Nama tugas atau mata pelajaran..."
                    value={judulInput}
                    onChange={(e) => setJudulInput(e.target.value)}
                    className={`md:col-span-5 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  />
                  <select
                    value={kategoriInput}
                    onChange={(e) => setKategoriInput(e.target.value as "Produktif PPLG" | "Projek" | "Umum")}
                    className={`md:col-span-3 px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  >
                    <option value="Produktif PPLG">Produktif PPLG</option>
                    <option value="Projek">Projek</option>
                    <option value="Umum">Umum</option>
                  </select>
                  <input
                    type="date"
                    value={deadlineInput}
                    onChange={(e) => setDeadlineInput(e.target.value)}
                    className={`md:col-span-2 px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  />
                  <button
                    type="submit"
                    className="md:col-span-2 bg-[#52796F] hover:bg-[#3F5D53] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
                  >
                    Simpan
                  </button>
                </form>
              </section>

              {/* Daftar Tugas */}
              <section className={`p-6 rounded-2xl shadow-sm border ${bgCard}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                  <div className="flex gap-2">
                    {(["Semua", "Belum Selesai", "Selesai"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          filterStatus === status
                            ? "bg-[#52796F] text-white"
                            : darkMode
                            ? "bg-[#141E1A] text-[#9BB5AA] hover:bg-[#253630]"
                            : "bg-[#F0F5F1] text-[#5A7467] hover:bg-[#E2ECE6]"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="🔍 Cari tugas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full md:w-64 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  />
                </div>

                {filteredTasks.length === 0 ? (
                  <p className={`text-center py-10 text-sm ${textSub}`}>Tidak ada tugas yang ditemukan.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => {
                      const countdown = getCountdown(task.deadline);
                      return (
                        <div
                          key={task.id}
                          className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-xl border gap-4 ${itemCard}`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#52796F]/15 text-[#52796F]">
                                {task.kategori}
                              </span>
                              {task.status === "Belum Selesai" && (
                                <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md ${countdown.color}`}>
                                  {countdown.text}
                                </span>
                              )}
                            </div>
                            <h4 className={`font-semibold text-base ${task.status === "Selesai" ? "line-through opacity-50" : ""} ${textTitle}`}>
                              {task.judul}
                            </h4>
                            <p className={`text-xs ${textSub}`}>Deadline: {task.deadline}</p>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                            <button
                              onClick={() => toggleStatus(task.id)}
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition ${
                                task.status === "Selesai"
                                  ? "bg-[#E2ECE9] text-[#3B7A57] hover:bg-[#D0E2DC]"
                                  : "bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]"
                              }`}
                            >
                              {task.status}
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {/* HALAMAN 3: JADWAL PELAJARAN */}
          {activePage === "schedule" && (
            <>
              <div>
                <h2 className={`text-2xl font-bold ${textTitle}`}>Jadwal Pelajaran 📅</h2>
                <p className={`text-sm mt-1 ${textSub}`}>Jadwal mata pelajaran mingguan kelas XII D PPLG.</p>
              </div>

              {/* Form Tambah Jadwal */}
              <section className={`p-6 rounded-2xl shadow-sm border ${bgCard}`}>
                <h3 className={`text-base font-semibold mb-4 ${textTitle}`}>Tambah Jadwal Baru</h3>
                <form onSubmit={handleAddJadwal} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <select
                    value={hariInput}
                    onChange={(e) => setHariInput(e.target.value)}
                    className={`md:col-span-3 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Jam (cth: 07:30 - 10:00)"
                    value={jamInput}
                    onChange={(e) => setJamInput(e.target.value)}
                    className={`md:col-span-3 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  />
                  <input
                    type="text"
                    placeholder="Nama Mata Pelajaran..."
                    value={mapelInput}
                    onChange={(e) => setMapelInput(e.target.value)}
                    className={`md:col-span-4 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  />
                  <button
                    type="submit"
                    className="md:col-span-2 bg-[#3B7A57] hover:bg-[#2C5E42] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
                  >
                    Tambah
                  </button>
                </form>
              </section>

              {/* Grid Jadwal Per Hari */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((hari) => {
                  const listMapel = jadwals.filter((j) => j.hari === hari);
                  const isToday = hari === hariIni;
                  return (
                    <div
                      key={hari}
                      className={`p-5 rounded-2xl border shadow-sm ${bgCard} ${
                        isToday ? "ring-2 ring-[#52796F]" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-lg font-bold ${textTitle}`}>{hari}</h3>
                        {isToday && (
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#52796F] text-white">
                            Hari Ini
                          </span>
                        )}
                      </div>

                      {listMapel.length === 0 ? (
                        <p className={`text-xs py-4 ${textSub}`}>Belum ada mata pelajaran.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {listMapel.map((item) => (
                            <div key={item.id} className={`p-3.5 rounded-xl border flex justify-between items-center gap-3 ${itemCard}`}>
                              <div>
                                <p className="text-xs font-semibold text-[#52796F]">{item.jam}</p>
                                <p className={`text-sm font-medium mt-0.5 ${textTitle}`}>{item.mapel}</p>
                              </div>
                              <button
                                onClick={() => deleteJadwal(item.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1"
                              >
                                Hapus
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* HALAMAN 4: MODE FOKUS (POMODORO) */}
          {activePage === "focus" && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center">
                <h2 className={`text-2xl font-bold ${textTitle}`}>Mode Fokus Belajar ⏱️</h2>
                <p className={`text-sm mt-1 ${textSub}`}>
                  Gunakan teknik Pomodoro: 25 menit fokus penuh, lalu 5 menit istirahat sejenak.
                </p>
              </div>

              <div className={`p-8 rounded-3xl border shadow-sm text-center space-y-6 ${bgCard}`}>
                {/* Switch Mode */}
                <div className="inline-flex p-1 rounded-xl bg-[#52796F]/10">
                  <button
                    onClick={() => switchTimerMode("focus")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                      focusMode === "focus" ? "bg-[#52796F] text-white" : textSub
                    }`}
                  >
                    Fokus (25 Menit)
                  </button>
                  <button
                    onClick={() => switchTimerMode("break")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                      focusMode === "break" ? "bg-[#3B7A57] text-white" : textSub
                    }`}
                  >
                    Istirahat (5 Menit)
                  </button>
                </div>

                {/* Angka Timer */}
                <div className={`text-6xl md:text-7xl font-extrabold tracking-wider font-mono py-4 ${textTitle}`}>
                  {formatTime(secondsLeft)}
                </div>

                {/* Pilih Tugas yang Sedang Dikerjakan */}
                <div className="text-left space-y-2">
                  <label className={`block text-xs font-semibold ${textSub}`}>
                    Target Tugas Sesi Ini:
                  </label>
                  <select
                    value={selectedFocusTaskId}
                    onChange={(e) => setSelectedFocusTaskId(e.target.value ? Number(e.target.value) : "")}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  >
                    <option value="">-- Pilih tugas yang ingin dikerjakan --</option>
                    {tasks
                      .filter((t) => t.status === "Belum Selesai")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.judul} ({t.kategori})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Tombol Kontrol */}
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="bg-[#52796F] hover:bg-[#3F5D53] text-white font-semibold px-8 py-3 rounded-xl transition shadow-sm"
                  >
                    {isRunning ? "Jeda Timer" : "Mulai Fokus"}
                  </button>
                  <button
                    onClick={() => switchTimerMode(focusMode)}
                    className={`px-5 py-3 rounded-xl font-semibold text-sm border transition ${
                      darkMode
                        ? "border-[#2E4039] text-[#E2ECE9] hover:bg-[#2E4039]"
                        : "border-[#D8E2DC] text-[#2D4A3E] hover:bg-[#F0F5F1]"
                    }`}
                  >
                    Reset
                  </button>
                </div>

                {/* Tombol Tandai Selesai jika memilih tugas */}
                {selectedFocusTaskId !== "" && (
                  <div className="pt-2 border-t border-dashed border-[#52796F]/30">
                    <button
                      onClick={() => {
                        toggleStatus(Number(selectedFocusTaskId));
                        setSelectedFocusTaskId("");
                      }}
                      className="text-xs font-semibold text-[#3B7A57] hover:underline"
                    >
                      ✓ Tandai tugas terpilih sudah selesai
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* BOTTOM NAVIGATION MOBILE */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-20 border-t grid grid-cols-4 py-2 ${bgSidebar}`}>
        {navItems.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium transition ${
                active ? "text-[#52796F] font-bold" : textSub
              }`}
            >
              <span className="text-lg mb-0.5">{item.icon}</span>
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}