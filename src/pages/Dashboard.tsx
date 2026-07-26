import React from "react";
import { useDataContext } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Users,
  Calendar,
  UserCheck,
  Plus,
  ArrowRight,
  Wallet,
  Home,
  ShieldAlert,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";

// Definisi Interface sesuai PendudukList
interface Penduduk {
  _id: string;
  nama: string;
  dusun: string;
  gaji_pokok: number;
  usia: number;
  tanggungan: number;
  penyakit: string;
  kondisi_rumah: string;
  aset: string;
}

const Dashboard: React.FC = () => {
  const { aparatur = [], events = [], penduduk = [], dusun = [] } = useDataContext() as any;
  const { user } = useAuth();

  // --- Kumpulan Kalkulasi Data Penduduk Real-time ---
  const totalPenduduk = penduduk.length;
  
  // Total Tanggungan Keluarga
  const totalTanggungan = penduduk.reduce((acc: number, p: Penduduk) => acc + (p.tanggungan || 0), 0);
  
  // Rata-rata Gaji Pokok Penduduk
  const avgGaji = totalPenduduk > 0 
    ? Math.round(penduduk.reduce((acc: number, p: Penduduk) => acc + (p.gaji_pokok || 0), 0) / totalPenduduk) 
    : 0;

  // Penduduk Berisiko / Butuh Perhatian (memiliki penyakit kronis/berat atau kondisi rumah non-permanen)
  const wargaRentan = penduduk.filter((p: Penduduk) => 
    (p.penyakit && p.penyakit !== "-" && p.penyakit.toLowerCase() !== "tidak ada") ||
    (p.kondisi_rumah && p.kondisi_rumah.toLowerCase().includes("papan")) ||
    (p.kondisi_rumah && p.kondisi_rumah.toLowerCase().includes("bambu"))
  ).length;

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const StatCard = ({
    title,
    value,
    icon,
    bgColor,
    linkTo,
    subText,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    linkTo?: string;
    subText?: string;
  }) => {
    const CardContent = (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-md ${bgColor}`}>{icon}</div>
        </div>
        {subText && (
          <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">{subText}</p>
        )}
      </div>
    );

    return linkTo ? (
      <Link to={linkTo} className="block h-full">
        {CardContent}
      </Link>
    ) : (
      CardContent
    );
  };

  // Tampilan Khusus Kepala Dusun (KDUS) / User Sederhana
  if (user?.role === "KDUS") {
    const dusunUser = dusun.find((d: any) => d.idDusun === user?.idDusun);
    const pendudukDusun = penduduk.filter((p: Penduduk) => p.dusun === user?.idDusun);

    return (
      <div className="space-y-6">
        <div className="bg-blue-600 rounded-lg p-6 text-white shadow-sm">
          <h1 className="text-2xl font-bold">Dashboard Kepala Dusun</h1>
          <p className="text-blue-100 text-sm mt-1">
            Wilayah Tugas: <span className="font-semibold">{dusunUser?.nama_dusun || "Dusun Anda"}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Penduduk Dusun Ini"
            value={pendudukDusun.length}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            bgColor="bg-blue-100"
            linkTo="/penduduk"
            subText="Data wilayah terdaftar"
          />
          <StatCard
            title="Total Tanggungan"
            value={pendudukDusun.reduce((acc: number, p: Penduduk) => acc + (p.tanggungan || 0), 0)}
            icon={<Home className="h-6 w-6 text-emerald-600" />}
            bgColor="bg-emerald-100"
            subText="Jiwa dalam tanggungan"
          />
          <StatCard
            title="Warga Butuh Perhatian"
            value={pendudukDusun.filter((p: Penduduk) => p.penyakit && p.penyakit !== "-").length}
            icon={<ShieldAlert className="h-6 w-6 text-amber-600" />}
            bgColor="bg-amber-100"
            subText="Kategori lansia/sakit"
          />
        </div>
      </div>
    );
  }

  // Tampilan Dashboard Administrator / Kepala Desa
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Utama Desa</h1>
          <p className="text-xs text-gray-500">Ringkasan terpadu kependudukan, aparatur, dan agenda desa.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/penduduk/new"
            className="inline-flex items-center gap-1 text-xs font-medium text-white bg-blue-600 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Data Penduduk
          </Link>
        </div>
      </div>

      {/* Grid Ringkasan Atas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Penduduk"
          value={totalPenduduk.toLocaleString("id-ID")}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          bgColor="bg-blue-100"
          linkTo="/penduduk"
          subText={`Total Tanggungan: ${totalTanggungan} Jiwa`}
        />
        <StatCard
          title="Rata-Rata Penghasilan"
          value={formatRupiah(avgGaji)}
          icon={<Wallet className="h-6 w-6 text-emerald-600" />}
          bgColor="bg-emerald-100"
          linkTo="/penduduk"
          subText="Berdasarkan Gaji Pokok"
        />
        <StatCard
          title="Warga Rentan/Bantuan"
          value={wargaRentan}
          icon={<ShieldAlert className="h-6 w-6 text-amber-600" />}
          bgColor="bg-amber-100"
          linkTo="/penduduk"
          subText="Indikasi kesehatan/rumah"
        />
        <StatCard
          title="Total Aparatur Desa"
          value={aparatur.length}
          icon={<UserCheck className="h-6 w-6 text-purple-600" />}
          bgColor="bg-purple-100"
          linkTo="/aparatur"
          subText="Aparatur Aktif"
        />
      </div>

      {/* Widget Distribusi Dusun */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-500" />
            Distribusi Penduduk Per Dusun
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {dusun.map((d: any) => {
            const count = penduduk.filter((p: Penduduk) => p.dusun === d.idDusun).length;
            const percentage = totalPenduduk > 0 ? Math.round((count / totalPenduduk) * 100) : 0;

            return (
              <div key={d.idDusun} className="p-3 border border-gray-100 rounded-md bg-gray-50/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-700">{d.nama_dusun}</span>
                  <span className="text-xs font-bold text-blue-600">{count} Jiwa</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">{percentage}% dari total warga</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid 2 Kolom: Data Aparatur & Agenda Kegiatan Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aparatur Desa */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900">Aparatur Desa</h2>
            <Link to="/aparatur" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-100">
              {aparatur.slice(0, 4).map((a: any) => (
                <li key={a._id} className="py-2.5">
                  <Link
                    to={`/aparatur/${a._id}`}
                    className="flex items-center hover:bg-gray-50 p-2 rounded-md transition-colors"
                  >
                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {a.name ? a.name.charAt(0) : "A"}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-500">{Array.isArray(a.fields) ? a.fields.join(", ") : "-"}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Informasi & agenda kegiatan */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900">Informasi & Kegiatan Desa</h2>
            <Link to="/events" className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4">
            {events && events.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {events.slice(0, 4).map((e: any, idx: number) => (
                  <li key={e._id || idx} className="py-2.5">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-purple-100 text-purple-600">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {e.title || e.nama || "Informasi Desa"}
                          </p>
                          <p className="text-xs text-gray-400">{e.date || e.tanggal || "Terbaru"}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-xs text-gray-400">
                Belum ada agenda kegiatan yang terdaftar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;