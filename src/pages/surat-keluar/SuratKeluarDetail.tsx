import React, {useEffect, useState} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {ArrowLeft, Edit, Trash2, FileText, Calendar, Send} from "lucide-react";
import toast from "react-hot-toast";
import {SURAT_KELUAR} from "../../types";

const SuratKeluarDetail: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {getSuratKeluarById, deleteSuratKeluar} = useDataContext();
  // console.log(getSuratKeluarById);

  const [surat, setSurat] = useState<SURAT_KELUAR | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurat = async () => {
      try {
        setLoading(true);
        const data = await getSuratKeluarById(id || "");
        console.log(data);
        setSurat(data || null);
        setError(null);
      } catch (err) {
        console.error("Error fetching surat:", err);
        setError("Gagal memuat data surat");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSurat();
  }, [id, getSuratKeluarById]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error || !surat) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Surat tidak ditemukan
        </h2>
        <p className="mt-2 text-gray-600">
          {error || "Data surat dengan ID tersebut tidak ditemukan."}
        </p>
        <Link
          to="/surat-keluar"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke daftar Surat Keluar
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Anda yakin ingin menghapus surat ini?`)) {
      try {
        await deleteSuratKeluar(surat._id!);
        toast.success("Surat berhasil dihapus");
        navigate("/surat-keluar");
      } catch (error) {
        console.error("Error deleting surat:", error);
        toast.error("Gagal menghapus surat");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/surat-keluar"
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Detail Surat Keluar
          </h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/surat-keluar/edit/${surat.IDSURATKELUAR}`}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 size={16} className="mr-2" />
            Hapus
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Informasi Surat</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {surat.PERIHAL}
            </h3>
            <p className="text-sm text-gray-600">
              Nomor Surat: {surat.NO_SURAT}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="flex items-center text-sm font-medium text-gray-500">
                <Send className="h-4 w-4 mr-2" />
                Tujuan
              </div>
              <p className="mt-1 text-gray-900">{surat.TUJUAN}</p>
            </div>

            <div>
              <div className="flex items-center text-sm font-medium text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                Tanggal Surat
              </div>
              <p className="mt-1 text-gray-900">
                {surat.TANGGAL_SURAT &&
                  new Date(surat.TANGGAL_SURAT).toLocaleDateString("id-ID")}
              </p>
            </div>

            <div>
              <div className="flex items-center text-sm font-medium text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                Tanggal Keluar
              </div>
              <p className="mt-1 text-gray-900">
                {surat.TANGGAL_KELUAR &&
                  new Date(surat.TANGGAL_KELUAR).toLocaleDateString("id-ID")}
              </p>
            </div>

            {surat.CREATED_AT && (
              <div>
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <FileText className="h-4 w-4 mr-2" />
                  Diinput Pada
                </div>
                <p className="mt-1 text-gray-900">
                  {new Date(surat.CREATED_AT).toLocaleString("id-ID")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuratKeluarDetail;
