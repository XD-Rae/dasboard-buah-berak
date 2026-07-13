import React from "react";
import {useNavigate} from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  MapPin,
  Key,
  Edit,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import {useAuth} from "../../contexts/AuthContext";
import {useDataContext} from "../../contexts/DataContext";

export default function ProfilePage() {
  const {user} = useAuth();
  const {roles, dusun} = useDataContext();
  const navigate = useNavigate();

  // Helper
  const getRoleName = (roleCode?: string) => {
    const found = roles.find((r) => r.IDROLE === roleCode);
    return found ? found.NAMA : roleCode || "-";
  };

  const getDusunName = (idDusun?: string) => {
    const found = dusun.find((d) => d.idDusun === idDusun);
    return found ? found.nama_dusun : "-";
  };

  const displayName = user?.name || "User";
  const avatarChar = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 1. Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center text-white/80 hover:text-white transition-colors bg-black/10 hover:bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft size={18} className="mr-2" />
          <span>Kembali</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* === KOLOM KIRI: IDENTITAS & AKSI === */}
          <div className="lg:col-span-1 flex flex-col">
            {" "}
            {/* Tambahkan flex flex-col */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="p-6 flex flex-col items-center text-center flex-1">
                {" "}
                {/* Tambahkan flex-1 agar isi merenggang jika perlu */}
                {/* Avatar Besar */}
                <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-lg mt-10 mb-4 relative z-10">
                  <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-5xl font-bold text-white shadow-inner">
                    {avatarChar}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.name}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                {/* Status Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 mb-6">
                  <CheckCircle2 size={14} className="mr-1.5" />
                  Akun Aktif
                </div>
                {/* Tombol Aksi (Full Width) - Posisikan di bawah jika diinginkan atau biarkan di tengah */}
                <div className="w-full space-y-3 mt-auto">
                  {" "}
                  {/* mt-auto akan mendorong tombol ke bawah jika container tinggi */}
                  <button
                    onClick={() => navigate(`/profile/change-name`)}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                  >
                    <Edit size={16} className="mr-2" />
                    Ubah Nama
                  </button>
                  <button
                    onClick={() => navigate(`/profile/change-password`)}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm"
                  >
                    <Key size={16} className="mr-2" />
                    Ganti Password
                  </button>
                </div>
              </div>
              {/* Footer kecil di kartu kiri - Tetap di bawah */}
              {/* <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center mt-auto">
                <p className="text-xs text-gray-400">Terdaftar sejak 2024</p>
              </div> */}
            </div>
          </div>

          {/* === KOLOM KANAN: DATA DETAIL === */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kartu 1: Informasi Umum */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <User className="mr-2 text-blue-600" size={20} />
                Informasi Pribadi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Nama Lengkap
                  </span>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {user?.name}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email
                  </span>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Kartu 2: Jabatan & Wilayah */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Briefcase className="mr-2 text-indigo-600" size={20} />
                Jabatan & Akses
              </h3>

              <div className="space-y-4">
                {/* Role */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Role Sistem
                      </p>
                      <p className="text-xs text-gray-500">
                        Tingkat akses aplikasi
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold bg-indigo-50 text-indigo-700">
                    {getRoleName(user?.role)}
                  </span>
                </div>

                {/* Dusun (Khusus KDUS) */}
                {user?.role === "KDUS" && (
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-red-300 transition-colors">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Wilayah Tugas
                        </p>
                        <p className="text-xs text-gray-500">
                          Lokasi tanggung jawab
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                      {getDusunName(user?.idDusun)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
