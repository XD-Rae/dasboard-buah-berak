import React, {useState, useEffect, useRef} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {ArrowLeft, Upload} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog";
import {useDataContext} from "../../contexts/DataContext";

const emptyReport = {
  _id: "",
  title: "",
  name: "",
  category: "",
  status: "pending",
  image: "",
};

const ReportForm: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {addReport, updateReport, getReportById} = useDataContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [report, setReport] = useState(emptyReport);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existing = await getReportById(id);
          if (existing) {
            setReport(existing);
            setImagePreview(existing.image);
          } else {
            toast.error("Laporan tidak ditemukan");
            navigate("/reports");
          }
        } catch (error) {
          toast.error("Gagal mengambil data laporan");
          navigate("/reports");
        }
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setReport((prev) => ({...prev, image: base64}));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!report.title.trim()) newErrors.title = "Judul wajib diisi";
    if (!report.name.trim()) newErrors.name = "Nama pelapor wajib diisi";
    if (!report.category.trim()) newErrors.category = "Kategori wajib diisi";
    if (!report.image) newErrors.image = "Gambar wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const {name, value} = e.target;
    setReport((prev) => ({...prev, [name]: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Periksa kembali inputan!");
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      if (isEditing && id) {
        console.log(report);
        await updateReport(id, report);
        toast.success("Laporan berhasil diperbarui");
      } else {
        await addReport(report);
        toast.success("Laporan berhasil ditambahkan");
      }
      navigate("/reports");
    } catch (err) {
      toast.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/reports" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Laporan" : "Tambah Laporan Baru"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium">Foto Laporan</label>
            <div className="mt-2 flex items-center gap-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="h-32 w-32 rounded-md object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-md bg-gray-200 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-500" />
                </div>
              )}

              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-md bg-gray-100 text-sm"
              >
                Pilih Gambar
              </button>
            </div>
            {errors.image && (
              <p className="text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium">Judul</label>
            <input
              type="text"
              name="title"
              value={report.title}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium">Nama Pelapor</label>
            <input
              type="text"
              name="name"
              value={report.name}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium">Kategori</label>
            <input
              type="text"
              name="category"
              value={report.category}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={report.status}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Link to="/reports" className="px-4 py-2 border rounded-md">
              Batal
            </Link>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">
              {isEditing ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${
          isEditing ? "memperbarui" : "menyimpan"
        } laporan ini?`}
        confirmLabel={isEditing ? "Perbarui" : "Simpan"}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default ReportForm;
