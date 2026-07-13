import React, {useEffect, useState} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  User,
  Home,
  Info,
  Clock,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

// Interface Dusun
interface Dusun {
  idDusun: string;
  nama_dusun: string;
  kepala_dusun: string;
  jumlah_rt: number;
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

const DusunDetail: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();

  // Mengambil fungsi dari Context
  const {getDusunById, deleteDusun} = useDataContext() as any;

  const [dusun, setDusun] = useState<Dusun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDusun = async () => {
      try {
        setLoading(true);
        // ID yang dikirim di URL adalah UUID (idDusun)
        const data = await getDusunById(id || "");

        if (!data) {
          setError("Data Dusun tidak ditemukan");
        } else {
          setDusun(data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching dusun:", err);
        setError("Gagal memuat data dusun");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDusun();
    }
  }, [id, getDusunById]);

  // Handler Hapus
  const handleDelete = async () => {
    if (
      window.confirm(
        `Anda yakin ingin menghapus ${dusun?.nama_dusun}? Data RT yang terkait mungkin akan terpengaruh.`,
      )
    ) {
      try {
        if (dusun?.idDusun) {
          await deleteDusun(dusun.idDusun);
          toast.success("Data dusun berhasil dihapus");
          navigate("/dusun");
        }
      } catch (error) {
        console.error("Error deleting dusun:", error);
        toast.error("Gagal menghapus data dusun");
      }
    }
  };

  // Loading View
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Memuat data dusun...</p>
      </div>
    );
  }

  // Error View
  if (error || !dusun) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto mt-8">
        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Data Tidak Ditemukan
        </h2>
        <p className="text-gray-500 mb-6">{error || "ID Dusun tidak valid."}</p>
        <Link
          to="/dusun"
          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Daftar Dusun
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* HEADER NAVIGASI */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link
            to="/dusun"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Wilayah</h1>
        </div>

        <div className="flex space-x-3">
          <Link
            to={`/dusun/edit/${dusun.idDusun}`}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Edit size={16} className="mr-2" />
            Edit Data
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center rounded-md bg-white border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
          >
            <Trash2 size={16} className="mr-2" />
            Hapus
          </button>
        </div>
      </div>

      {/* KARTU UTAMA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Banner / Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-inner">
              <MapPin size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{dusun.nama_dusun}</h2>
              <p className="text-blue-100 mt-1 opacity-90">
                ID Wilayah: {dusun.idDusun}
              </p>
            </div>
          </div>
        </div>

        {/* Informasi Detail */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">
            Informasi Administratif
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            {/* Kepala Dusun */}
            <div className="flex items-start">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600 mr-4">
                <User size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Kepala Dusun
                </p>
                <p className="text-lg font-medium text-gray-900">
                  {dusun.kepala_dusun}
                </p>
              </div>
            </div>

            {/* Jumlah RT */}
            <div className="flex items-start">
              <div className="p-3 bg-green-50 rounded-lg text-green-600 mr-4">
                <Home size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Jumlah Rukun Tetangga (RT)
                </p>
                <p className="text-lg font-medium text-gray-900">
                  {dusun.jumlah_rt} RT
                </p>
              </div>
            </div>

            {/* Keterangan */}
            <div className="flex items-start md:col-span-2">
              <div className="p-3 bg-gray-50 rounded-lg text-gray-600 mr-4">
                <Info size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Keterangan / Wilayah
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {dusun.keterangan || "Tidak ada keterangan tambahan."}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex items-center text-sm text-gray-400 mt-4 md:col-span-2 border-t pt-6">
              <Clock size={14} className="mr-1" />
              <span className="mr-4">
                Dibuat: {new Date(dusun.createdAt).toLocaleDateString("id-ID")}
              </span>
              <Calendar size={14} className="mr-1" />
              <span>
                Diperbarui:{" "}
                {new Date(dusun.updatedAt).toLocaleDateString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DusunDetail;
