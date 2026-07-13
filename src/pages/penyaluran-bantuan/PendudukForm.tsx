import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext"; // Pastikan path context benar
import {ArrowLeft, Save} from "lucide-react";
import toast from "react-hot-toast";

// Interface untuk Form State
interface PendudukFormData {
  nama: string;
  gaji_pokok: number | "";
  usia: number | "";
  tanggungan: number | "";
  penyakit: string;
  kondisi_rumah: string;
  aset: string;
}

const emptyPenduduk: PendudukFormData = {
  nama: "",
  gaji_pokok: "",
  usia: "",
  tanggungan: "",
  penyakit: "",
  kondisi_rumah: "",
  aset: "",
};

// Opsi untuk Dropdown sesuai Kriteria SPK
const OPTIONS = {
  penyakit: [
    "Sehat",
    "Sering sakit ringan",
    "Penyakit menahun ringan",
    "Penyakit kronis",
    "Penyakit kronis + disabilitas",
  ],
  kondisi_rumah: [
    "Permanen layak",
    "Permanen sederhana",
    "Semi permanen",
    "Semi permanen rusak",
    "Tidak layak huni",
  ],
  aset: [
    "Mobil / tanah / aset besar",
    "Motor + perhiasan",
    "Motor layak",
    "Punya 1 aset kecil (motor tua)",
    "Tidak punya aset",
  ],
};

const PendudukForm: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();

  // Pastikan function ini sudah di-expose di Context Anda
  const {addPenduduk, updatePenduduk, getPendudukById} =
    useDataContext() as any;

  const [formData, setFormData] = useState<PendudukFormData>(emptyPenduduk);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!id;

  useEffect(() => {
    const fetchPenduduk = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const existingData = await getPendudukById(id);
          if (existingData) {
            setFormData({
              nama: existingData.nama,
              gaji_pokok: existingData.gaji_pokok,
              usia: existingData.usia,
              tanggungan: existingData.tanggungan,
              penyakit: existingData.penyakit,
              kondisi_rumah: existingData.kondisi_rumah,
              aset: existingData.aset,
            });
          } else {
            navigate("/penduduk");
            toast.error("Data penduduk tidak ditemukan");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Gagal memuat data penduduk");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPenduduk();
  }, [id, getPendudukById, navigate, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const {name, value, type} = e.target;

    // Handle konversi angka
    const finalValue =
      type === "number" ? (value === "" ? "" : Number(value)) : value;

    setFormData((prev) => ({...prev, [name]: finalValue}));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: undefined}));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (formData.gaji_pokok === "")
      newErrors.gaji_pokok = "Gaji pokok wajib diisi";
    if (formData.usia === "") newErrors.usia = "Usia wajib diisi";
    if (formData.tanggungan === "")
      newErrors.tanggungan = "Jumlah tanggungan wajib diisi";
    if (!formData.penyakit)
      newErrors.penyakit = "Status kesehatan wajib dipilih";
    if (!formData.kondisi_rumah)
      newErrors.kondisi_rumah = "Kondisi rumah wajib dipilih";
    if (!formData.aset) newErrors.aset = "Kepemilikan aset wajib dipilih";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Harap lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      setLoading(true);
      if (isEditing && id) {
        await updatePenduduk(id, formData);
        toast.success("Data Penduduk berhasil diperbarui");
      } else {
        await addPenduduk(formData);
        toast.success("Data Penduduk berhasil ditambahkan");
      }
      navigate("/penduduk");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Gagal menyimpan data Penduduk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/penduduk" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Data Penduduk" : "Tambah Penduduk Baru"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                disabled={loading}
                placeholder="Contoh: Budi Santoso"
                className={`w-full rounded-md border px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nama ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.nama && (
                <p className="text-sm text-red-600 mt-1">{errors.nama}</p>
              )}
            </div>

            {/* Gaji Pokok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gaji Pokok (Rp) *
              </label>
              <input
                name="gaji_pokok"
                type="number"
                value={formData.gaji_pokok}
                onChange={handleChange}
                disabled={loading}
                placeholder="0"
                className={`w-full rounded-md border px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${errors.gaji_pokok ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.gaji_pokok && (
                <p className="text-sm text-red-600 mt-1">{errors.gaji_pokok}</p>
              )}
            </div>

            {/* Usia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usia Kepala Keluarga (Tahun) *
              </label>
              <input
                name="usia"
                type="number"
                value={formData.usia}
                onChange={handleChange}
                disabled={loading}
                placeholder="0"
                className={`w-full rounded-md border px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${errors.usia ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.usia && (
                <p className="text-sm text-red-600 mt-1">{errors.usia}</p>
              )}
            </div>

            {/* Tanggungan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Tanggungan (Orang) *
              </label>
              <input
                name="tanggungan"
                type="number"
                value={formData.tanggungan}
                onChange={handleChange}
                disabled={loading}
                placeholder="0"
                className={`w-full rounded-md border px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${errors.tanggungan ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.tanggungan && (
                <p className="text-sm text-red-600 mt-1">{errors.tanggungan}</p>
              )}
            </div>

            {/* Dropdown Penyakit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kondisi Kesehatan / Penyakit *
              </label>
              <select
                name="penyakit"
                value={formData.penyakit}
                onChange={handleChange}
                disabled={loading}
                className={`w-full rounded-md border px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 ${errors.penyakit ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">-- Pilih Kondisi --</option>
                {OPTIONS.penyakit.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.penyakit && (
                <p className="text-sm text-red-600 mt-1">{errors.penyakit}</p>
              )}
            </div>

            {/* Dropdown Rumah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kondisi Rumah *
              </label>
              <select
                name="kondisi_rumah"
                value={formData.kondisi_rumah}
                onChange={handleChange}
                disabled={loading}
                className={`w-full rounded-md border px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 ${errors.kondisi_rumah ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">-- Pilih Kondisi Rumah --</option>
                {OPTIONS.kondisi_rumah.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.kondisi_rumah && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.kondisi_rumah}
                </p>
              )}
            </div>

            {/* Dropdown Aset */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kepemilikan Aset *
              </label>
              <select
                name="aset"
                value={formData.aset}
                onChange={handleChange}
                disabled={loading}
                className={`w-full rounded-md border px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 ${errors.aset ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">-- Pilih Aset --</option>
                {OPTIONS.aset.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.aset && (
                <p className="text-sm text-red-600 mt-1">{errors.aset}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t pt-6">
            <Link
              to="/penduduk"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save size={16} className="mr-2" />
              {loading
                ? "Menyimpan..."
                : isEditing
                  ? "Perbarui Data"
                  : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PendudukForm;
