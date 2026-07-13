import React, {useEffect, useState} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
// Sesuaikan dengan nama context yang Anda pakai (misal: useCampusData atau useDataContext)
import {useDataContext} from "../../contexts/DataContext";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Banknote,
  Calendar,
  Users,
  Activity,
  Home,
  Briefcase,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const PendudukDetail: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();

  // Ambil fungsi khusus penduduk dari Context
  const {getPendudukById, deletePenduduk} = useDataContext() as any;

  const [penduduk, setPenduduk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Panggil API getPendudukById
        const data = await getPendudukById(id || "");
        setPenduduk(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data penduduk");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, getPendudukById]);

  // Format Mata Uang
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Loading State
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat data penduduk...</p>
      </div>
    );
  }

  // Error State
  if (error || !penduduk) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Data tidak ditemukan
        </h2>
        <p className="mt-2 text-gray-600">
          {error || "Data penduduk dengan ID tersebut tidak ditemukan."}
        </p>
        <Link
          to="/penduduk"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke daftar Penduduk
        </Link>
      </div>
    );
  }

  // Delete Handler
  const handleDelete = async () => {
    if (
      window.confirm(
        `Anda yakin ingin menghapus data atas nama ${penduduk.nama}?`,
      )
    ) {
      try {
        await deletePenduduk(penduduk._id);
        toast.success("Data penduduk berhasil dihapus");
        navigate("/penduduk");
      } catch (error) {
        console.error("Error deleting data:", error);
        toast.error("Gagal menghapus data");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/penduduk"
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Penduduk</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/penduduk/edit/${penduduk._id}`}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center rounded-md bg-white border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors shadow-sm"
          >
            <Trash2 size={16} className="mr-2" />
            Hapus
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-8 border-b border-gray-100">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {penduduk.nama?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {penduduk.nama}
              </h3>
              <p className="text-gray-500 flex items-center mt-1">
                <Clock size={14} className="mr-1" />
                Diupdate pada:{" "}
                {new Date(
                  penduduk.updatedAt || penduduk.createdAt,
                ).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="p-8">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
            Data Kriteria & Indikator
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Gaji Pokok */}
            <div className="flex flex-col p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <Banknote className="h-5 w-5 mr-2 text-green-600" />
                Gaji Pokok
              </div>
              <p className="text-lg font-semibold text-gray-900 pl-7">
                {formatRupiah(penduduk.gaji_pokok)}
              </p>
            </div>

            {/* Usia */}
            <div className="flex flex-col p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Usia Kepala Keluarga
              </div>
              <p className="text-lg font-semibold text-gray-900 pl-7">
                {penduduk.usia} Tahun
              </p>
            </div>

            {/* Tanggungan */}
            <div className="flex flex-col p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                Jumlah Tanggungan
              </div>
              <p className="text-lg font-semibold text-gray-900 pl-7">
                {penduduk.tanggungan} Orang
              </p>
            </div>

            {/* Penyakit */}
            <div className="flex flex-col p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <Activity className="h-5 w-5 mr-2 text-red-600" />
                Kondisi Kesehatan
              </div>
              <p className="text-lg font-semibold text-gray-900 pl-7">
                {penduduk.penyakit}
              </p>
            </div>

            {/* Kondisi Rumah */}
            <div className="flex flex-col p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <Home className="h-5 w-5 mr-2 text-purple-600" />
                Kondisi Rumah
              </div>
              <p className="text-lg font-semibold text-gray-900 pl-7">
                {penduduk.kondisi_rumah}
              </p>
            </div>

            {/* Aset */}
            <div className="flex flex-col p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <Briefcase className="h-5 w-5 mr-2 text-teal-600" />
                Kepemilikan Aset
              </div>
              <p className="text-lg font-semibold text-gray-900 pl-7">
                {penduduk.aset}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendudukDetail;
