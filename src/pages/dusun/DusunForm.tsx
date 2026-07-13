import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {ArrowLeft, Save} from "lucide-react";
import toast from "react-hot-toast";

// Interface untuk State Form Dusun
interface DusunFormData {
  nama_dusun: string;
  kepala_dusun: string; // Ini nanti akan berisi ID User
  jumlah_rt: number | "";
  keterangan: string;
}

const emptyDusun: DusunFormData = {
  nama_dusun: "",
  kepala_dusun: "",
  jumlah_rt: "",
  keterangan: "",
};

const DusunForm: React.FC = () => {
  const {id} = useParams<{id: string}>(); // ID ini adalah idDusun (UUID)
  const navigate = useNavigate();

  // Ambil fungsi CRUD dan data users dari context
  const {addDusun, updateDusun, getDusunById, users} = useDataContext() as any;

  const [formData, setFormData] = useState<DusunFormData>(emptyDusun);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!id;

  // Filter user yang memiliki role "KDUS"
  const listKepalaDusun = (users || []).filter(
    (user: any) => user.ROLE === "KDUS",
  );

  // Fetch Data jika mode Edit
  useEffect(() => {
    const fetchDusunData = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const existingData = await getDusunById(id);

          if (existingData) {
            // Cek apakah kepala_dusun berbentuk object (populated) atau string (ID)
            // Agar form terisi dengan benar saat mode edit
            const kdusId =
              typeof existingData.kepala_dusun === "object" &&
              existingData.kepala_dusun !== null
                ? existingData.kepala_dusun._id ||
                  existingData.kepala_dusun.IDUSER
                : existingData.kepala_dusun;

            setFormData({
              nama_dusun: existingData.nama_dusun,
              kepala_dusun: kdusId || "", // Set ID ke state
              jumlah_rt: existingData.jumlah_rt,
              keterangan: existingData.keterangan || "",
            });
          } else {
            navigate("/dusun");
            toast.error("Data Dusun tidak ditemukan");
          }
        } catch (error) {
          console.error("Error fetching dusun:", error);
          toast.error("Gagal memuat data Dusun");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDusunData();
  }, [id, getDusunById, navigate, isEditing]);

  // Handle Perubahan Input (Text & Select)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const {name, value, type} = e.target;

    // Handle konversi angka untuk jumlah_rt
    const finalValue =
      type === "number" ? (value === "" ? "" : Number(value)) : value;

    setFormData((prev) => ({...prev, [name]: finalValue}));

    // Hapus error realtime
    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: undefined}));
    }
  };

  // Validasi Form
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama_dusun.trim())
      newErrors.nama_dusun = "Nama Dusun wajib diisi";
    if (!formData.kepala_dusun.trim())
      newErrors.kepala_dusun = "Kepala Dusun wajib dipilih";

    // Jumlah RT boleh kosong (optional), tapi kalau diisi tidak boleh negatif
    if (formData.jumlah_rt !== "" && Number(formData.jumlah_rt) < 0) {
      newErrors.jumlah_rt = "Jumlah RT tidak boleh negatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Harap lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      setLoading(true);
      if (isEditing && id) {
        await updateDusun(id, formData);
        toast.success("Data Dusun berhasil diperbarui");
      } else {
        await addDusun(formData);
        toast.success("Data Dusun berhasil ditambahkan");
      }
      navigate("/dusun");
    } catch (error) {
      console.error("Error saving dusun:", error);
      toast.error("Gagal menyimpan data Dusun");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/dusun"
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Data Dusun" : "Tambah Dusun Baru"}
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Nama Dusun */}
            <div className="md:col-span-2">
              <label
                htmlFor="nama_dusun"
                className="block text-sm font-medium text-gray-700"
              >
                Nama Dusun <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama_dusun"
                name="nama_dusun"
                value={formData.nama_dusun}
                onChange={handleChange}
                disabled={loading}
                placeholder="Contoh: Dusun I, Dusun Melati"
                className={`mt-1 block w-full rounded-md border ${
                  errors.nama_dusun
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
              />
              {errors.nama_dusun && (
                <p className="mt-1 text-sm text-red-600">{errors.nama_dusun}</p>
              )}
            </div>

            {/* Kepala Dusun (Select Option) */}
            <div>
              <label
                htmlFor="kepala_dusun"
                className="block text-sm font-medium text-gray-700"
              >
                Kepala Dusun <span className="text-red-500">*</span>
              </label>
              <select
                id="kepala_dusun"
                name="kepala_dusun"
                value={formData.kepala_dusun}
                onChange={handleChange}
                disabled={loading}
                className={`mt-1 block w-full rounded-md border ${
                  errors.kepala_dusun
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
              >
                <option value="">-- Pilih Kepala Dusun --</option>
                {listKepalaDusun.length > 0 ? (
                  listKepalaDusun.map((user: any) => (
                    // PERUBAHAN DISINI: value menggunakan user._id / user.IDUSER
                    <option
                      key={user._id || user.IDUSER}
                      value={user._id || user.IDUSER}
                    >
                      {user.NAMA}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Tidak ada user dengan role KDUS
                  </option>
                )}
              </select>
              {errors.kepala_dusun && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.kepala_dusun}
                </p>
              )}
            </div>

            {/* Jumlah RT */}
            <div>
              <label
                htmlFor="jumlah_rt"
                className="block text-sm font-medium text-gray-700"
              >
                Jumlah RT
              </label>
              <input
                type="number"
                id="jumlah_rt"
                name="jumlah_rt"
                value={formData.jumlah_rt}
                onChange={handleChange}
                disabled={loading}
                placeholder="0"
                className={`mt-1 block w-full rounded-md border ${
                  errors.jumlah_rt ? "border-red-300" : "border-gray-300"
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {errors.jumlah_rt && (
                <p className="mt-1 text-sm text-red-600">{errors.jumlah_rt}</p>
              )}
            </div>

            {/* Keterangan */}
            <div className="md:col-span-2">
              <label
                htmlFor="keterangan"
                className="block text-sm font-medium text-gray-700"
              >
                Keterangan / Wilayah
              </label>
              <textarea
                id="keterangan"
                name="keterangan"
                rows={3}
                value={formData.keterangan}
                onChange={handleChange}
                disabled={loading}
                placeholder="Deskripsi tambahan mengenai wilayah dusun..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
            <Link
              to="/dusun"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default DusunForm;
