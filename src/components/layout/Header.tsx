import React, {useEffect, useState, useRef} from "react";
import {
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
  FileText,
  AlertCircle,
} from "lucide-react";
import {useAuth} from "../../contexts/AuthContext";
import {useNavigate, Link} from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import {useDataContext} from "../../contexts/DataContext";
import {reportAPI} from "../../services/api"; // Pastikan import reportAPI

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({toggleSidebar}) => {
  const {user, logout} = useAuth();
  const {roles, reports} = useDataContext();
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  // --- STATE ---
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Dropdown States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Notification Data
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs untuk click outside
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || user?.email || "";
  const avatarChar = displayName ? displayName.charAt(0).toUpperCase() : "?";

  // ==============================
  // 1. FETCH NOTIFICATIONS LOGIC
  // ==============================
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // const response = await reportAPI.getAll();
      const allReports = reports || [];

      let filteredReports: any[] = [];

      if (user.role === "ADM") {
        // ADMIN: Hanya menerima notifikasi laporan yang BARU MASUK (submitted)
        filteredReports = allReports.filter(
          (r: any) => r.status === "submitted",
        );
      } else if (user.role === "KDUS") {
        // KDUS: Hanya menerima notifikasi laporan yang SEDANG DIPROSES (in_progress)
        // Dan harus sesuai dengan wilayah dusunnya
        filteredReports = allReports.filter(
          (r: any) =>
            r.status === "in_progress" &&
            (user.idDusun ? r.dusun === user.idDusun : true),
        );
      }
      // Opsional: Tambahkan blok else if untuk KDES jika Kades perlu notif juga

      // Sort by terbaru (descending)
      filteredReports.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setNotifications(filteredReports);
      setUnreadCount(filteredReports.length);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    }
  };

  // Fetch saat component mount atau user berubah
  useEffect(() => {
    fetchNotifications();

    // Opsional: Polling setiap 30 detik agar realtime sederhana
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ==============================
  // 2. CLICK OUTSIDE HANDLER
  // ==============================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close Profile Dropdown
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      // Close Notif Dropdown
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set Role Label
  useEffect(() => {
    const userRole = user?.role;
    const filterRoleData = roles.find((data) => data.IDROLE === userRole);
    setRole(filterRoleData ? filterRoleData.NAMA : userRole || "");
  }, [user, roles]);

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil logout");
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm">
        <button
          onClick={toggleSidebar}
          className="rounded p-1 text-gray-700 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="ml-auto flex items-center space-x-4">
          {/* ======================= */}
          {/* NOTIFICATION BELL AREA  */}
          {/* ======================= */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false); // Tutup profile jika notif dibuka
              }}
              className="relative rounded-full p-1.5 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
            >
              <Bell size={20} />
              {/* Badge Merah */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Notifikasi */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 overflow-hidden z-50">
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <span className="font-semibold text-gray-700 text-sm">
                    Notifikasi
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {unreadCount} Baru
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <Link
                        to={`/reports/${item._id}`}
                        key={item._id}
                        onClick={() => setIsNotifOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div
                            className={`mt-1 p-2 rounded-full h-fit ${user?.role === "KDUS" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"}`}
                          >
                            {user?.role === "KDUS" ? (
                              <AlertCircle size={16} />
                            ) : (
                              <FileText size={16} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {user?.role === "KDUS"
                                ? "Perlu Diselesaikan"
                                : "Laporan Baru Masuk"}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(item.createdAt).toLocaleDateString(
                                "id-ID",
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <Link
                    to="/reports"
                    onClick={() => setIsNotifOpen(false)}
                    className="block text-center text-xs text-blue-600 hover:text-blue-800 py-2 border-t border-gray-100 font-medium"
                  >
                    Lihat Semua Laporan
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ======================= */}
          {/* USER PROFILE AREA       */}
          {/* ======================= */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false); // Tutup notif jika profile dibuka
              }}
              className="flex items-center space-x-3 rounded-full border border-transparent p-1 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                {avatarChar}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-800 leading-none">
                  {role}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-none">
                  {displayName}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 hidden md:block ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 z-50">
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-medium text-gray-900">{role}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {displayName}
                  </p>
                </div>

                <div className="p-1">
                  <Link
                    to="/profile"
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} className="mr-3" />
                    Profile Saya
                  </Link>
                </div>

                <div className="border-t border-gray-100 p-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari aplikasi?"
        confirmLabel="Keluar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Header;
