import React, {useEffect, useState} from "react";
import {useParams, Link, useLocation} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Users,
  Activity,
  Home,
  Briefcase,
  Trophy,
  CheckCircle,
  Clock,
} from "lucide-react";

// Interface Data Penduduk
interface PendudukData {
  _id: string;
  nama: string;
  gaji_pokok: number;
  usia: number;
  tanggungan: number;
  penyakit: string;
  kondisi_rumah: string;
  aset: string;
  createdAt: string;
  updatedAt: string;
}

const BantuanDetail: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const location = useLocation();

  // Menangkap data Score & Rank yang dikirim dari BantuanList (jika ada)
  const {rank, finalScore} = location.state || {};

  // Mengambil data detail penduduk
  const {getPendudukById} = useDataContext() as any;

  const [penduduk, setPenduduk] = useState<PendudukData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPendudukById(id || "");
        if (!data) {
          setError("Data tidak ditemukan.");
        } else {
          setPenduduk(data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data penerima bantuan");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, getPendudukById]);

  // Format Mata Uang IDR
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Helper Label Status
  const getStatusLabel = (score: number) => {
    if (!score) return null;
    if (score >= 0.8) return "Sangat Prioritas";
    if (score >= 0.6) return "Prioritas";
    return "Kurang Prioritas";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Memuat data penerima...</p>
      </div>
    );
  }

  if (error || !penduduk) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Data Tidak Ditemukan
        </h2>
        <p className="text-gray-500 mb-6">{error || "ID tidak valid."}</p>
        <Link
          to="/bantuan"
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Daftar Bantuan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER NAVIGASI */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link
            to="/bantuan"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Penerima Bantuan
            </h1>
            <p className="text-sm text-gray-500">
              Analisis kelayakan berdasarkan metode SAW
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: Profil & Skor */}
        <div className="lg:col-span-1 space-y-6">
          {/* Kartu Profil Singkat */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-center p-6">
            <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4 shadow-md">
              {penduduk.nama?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{penduduk.nama}</h2>
            <div className="flex items-center justify-center mt-2 text-gray-500 text-sm">
              <Clock size={14} className="mr-1.5" />
              <span>
                Data per:{" "}
                {new Date(
                  penduduk.updatedAt || penduduk.createdAt,
                ).toLocaleDateString("id-ID")}
              </span>
            </div>
          </div>

          {/* Kartu Skor SAW (Hanya muncul jika diakses dari list bantuan) */}
          {finalScore !== undefined && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                <Trophy size={120} />
              </div>

              <h3 className="text-blue-100 font-medium text-sm uppercase tracking-wider mb-4">
                Hasil Perhitungan SAW
              </h3>

              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-4xl font-bold">
                    {finalScore.toFixed(4)}
                  </span>
                  <span className="text-blue-200 text-sm block">
                    Nilai Preferensi (V)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">#{rank}</span>
                  <span className="text-blue-200 text-sm block">Peringkat</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center mt-2">
                <CheckCircle className="text-green-300 mr-2" size={20} />
                <span className="font-medium">
                  {getStatusLabel(finalScore)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: Detail Indikator */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center">
              <Activity className="text-blue-600 mr-2" size={20} />
              <h3 className="font-semibold text-gray-900">
                Indikator Penilaian
              </h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gaji */}
              <div className="p-4 rounded-lg border border-gray-100 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-1.5 bg-green-100 text-green-600 rounded">
                    <Banknote size={18} />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Gaji Pokok
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 pl-9">
                  {formatRupiah(penduduk.gaji_pokok)}
                </p>
              </div>

              {/* Usia */}
              <div className="p-4 rounded-lg border border-gray-100 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                    <Calendar size={18} />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Usia Kepala Keluarga
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 pl-9">
                  {penduduk.usia} Tahun
                </p>
              </div>

              {/* Tanggungan */}
              <div className="p-4 rounded-lg border border-gray-100 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-1.5 bg-orange-100 text-orange-600 rounded">
                    <Users size={18} />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Jumlah Tanggungan
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 pl-9">
                  {penduduk.tanggungan} Orang
                </p>
              </div>

              {/* Kesehatan */}
              <div className="p-4 rounded-lg border border-gray-100 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-1.5 bg-red-100 text-red-600 rounded">
                    <Activity size={18} />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Kondisi Kesehatan
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 pl-9">
                  {penduduk.penyakit}
                </p>
              </div>

              {/* Rumah */}
              <div className="p-4 rounded-lg border border-gray-100 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-1.5 bg-purple-100 text-purple-600 rounded">
                    <Home size={18} />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Kondisi Rumah
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 pl-9">
                  {penduduk.kondisi_rumah}
                </p>
              </div>

              {/* Aset */}
              <div className="p-4 rounded-lg border border-gray-100 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-1.5 bg-teal-100 text-teal-600 rounded">
                    <Briefcase size={18} />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Kepemilikan Aset
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 pl-9">
                  {penduduk.aset}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BantuanDetail;
