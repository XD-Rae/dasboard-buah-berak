import React from "react";
import {NavLink} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";
import {
  LayoutDashboard, // Dashboard
  Users, // Data Aparatur / Penduduk
  Map, // Data Dusun (MapPin/Map)
  HandHeart, // Bantuan (HandHeart/HeartHandshake)
  CalendarDays, // Data Kegiatan
  FileText, // Data Laporan
  Mail, // Surat Masuk (Mail/Inbox)
  Send, // Surat Keluar
  ShieldCheck, // Role
  UserCog, // User
  X, // Close button
  LogOut, // Opsional: Icon Logout di footer
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({isOpen, toggleSidebar}) => {
  const {user} = useAuth();

  const navLinkClass = ({isActive}: {isActive: boolean}) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    }`;

  // Helper untuk mengecek role
  const isAdmin = user?.role === "ADM";
  const isKdes = user?.role === "KDES";
  const isKdus = user?.role === "KDUS";

  // Grouping Logic: Admin & Kades punya akses luas, KDUS terbatas
  const hasFullAccess = isAdmin || isKdes;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:relative lg:shadow-none lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col border-r border-gray-100">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                A
              </div>
              <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                ADMIN DESA
              </h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
            {/* === 1. MAIN === */}
            <div className="pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
                Utama
              </p>
              <NavLink to="/" className={navLinkClass} end>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </div>

            {/* === 2. KEPENDUDUKAN & WILAYAH === */}
            {(hasFullAccess || isKdus) && (
              <div className="pb-2">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
                  Kependudukan & Wilayah
                </p>

                {hasFullAccess && (
                  <NavLink to="/aparatur" className={navLinkClass}>
                    <UserCog size={18} />
                    <span>Data Aparatur</span>
                  </NavLink>
                )}

                <NavLink to="/penduduk" className={navLinkClass}>
                  <Users size={18} />
                  <span>Data Penduduk</span>
                </NavLink>

                {hasFullAccess && (
                  <NavLink to="/dusun" className={navLinkClass}>
                    <Map size={18} />
                    <span>Data Dusun</span>
                  </NavLink>
                )}

                <NavLink to="/bantuan" className={navLinkClass}>
                  <HandHeart size={18} />
                  <span>Bantuan Sosial</span>
                </NavLink>
              </div>
            )}

            {/* === 3. ADMINISTRASI & LAYANAN === */}
            <div className="pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
                Layanan & Laporan
              </p>

              {(hasFullAccess || isKdus) && (
                <NavLink to="/reports" className={navLinkClass}>
                  <FileText size={18} />
                  <span>Pelaporan Warga</span>
                </NavLink>
              )}

              {hasFullAccess && (
                <>
                  <NavLink to="/events" className={navLinkClass}>
                    <CalendarDays size={18} />
                    <span>Agenda Kegiatan</span>
                  </NavLink>

                  <NavLink to="/surat-masuk" className={navLinkClass}>
                    <Mail size={18} />
                    <span>Surat Masuk</span>
                  </NavLink>

                  <NavLink to="/surat-keluar" className={navLinkClass}>
                    <Send size={18} />
                    <span>Surat Keluar</span>
                  </NavLink>
                </>
              )}
            </div>

            {/* === 4. PENGATURAN (KHUSUS ADMIN) === */}
            {isAdmin && (
              <div className="pb-2">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
                  Sistem
                </p>
                <NavLink to="/users" className={navLinkClass}>
                  <Users size={18} />
                  <span>Manajemen User</span>
                </NavLink>

                <NavLink to="/roles" className={navLinkClass}>
                  <ShieldCheck size={18} />
                  <span>Hak Akses (Role)</span>
                </NavLink>
              </div>
            )}
          </nav>

          {/* Footer User Info */}
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role === "ADM"
                    ? "Administrator"
                    : user?.role === "KDES"
                      ? "Kepala Desa"
                      : "Kepala Dusun"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
