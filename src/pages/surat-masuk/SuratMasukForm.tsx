import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {ArrowLeft, Save} from "lucide-react";
import toast from "react-hot-toast";

type SuratMasukFormData = {
  TANGGAL_TERIMA: string;
  TANGGAL_SURAT: string;
  NO_SURAT: string;
  PENGIRIM: string;
  PERIHAL: string;
  JENIS_SURAT: string;
  KETERANGAN: string;
};

const emptyForm: SuratMasukFormData = {
  TANGGAL_TERIMA: "",
  TANGGAL_SURAT: "",
  NO_SURAT: "",
  PENGIRIM: "",
  PERIHAL: "",
  JENIS_SURAT: "",
  KETERANGAN: "",
};

const SuratMasukForm: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();

  const {addSuratMasuk, updateSuratMasuk, getSuratMasukById} = useDataContext();

  const [formData, setFormData] = useState<SuratMasukFormData>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const data = await getSuratMasukById(id);
          if (!data) {
            toast.error("Data tidak ditemukan");
            navigate("/surat-masuk");
            return;
          }

          console.log(data);

          setFormData({
            TANGGAL_TERIMA: data.TANGGAL_TERIMA?.slice(0, 10),
            TANGGAL_SURAT: data.TANGGAL_SURAT?.slice(0, 10),
            NO_SURAT: data.NO_SURAT,
            PENGIRIM: data.PENGIRIM,
            PERIHAL: data.PERIHAL,
            JENIS_SURAT: data.JENIS_SURAT,
            KETERANGAN: data.KETERANGAN || "",
          });
        } catch (e) {
          toast.error("Gagal memuat data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id, isEditing, getSuratMasukById, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const {name, value} = e.target;
    setFormData((p) => ({...p, [name]: value}));
    if (errors[name]) setErrors((p) => ({...p, [name]: undefined}));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.TANGGAL_TERIMA) e.TANGGAL_TERIMA = "Wajib diisi";
    if (!formData.TANGGAL_SURAT) e.TANGGAL_SURAT = "Wajib diisi";
    if (!formData.NO_SURAT) e.NO_SURAT = "Wajib diisi";
    if (!formData.PENGIRIM) e.PENGIRIM = "Wajib diisi";
    if (!formData.PERIHAL) e.PERIHAL = "Wajib diisi";
    if (!formData.JENIS_SURAT) e.JENIS_SURAT = "Wajib diisi";
    if (!isEditing && !file) e.FILE = "File wajib diupload";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Lengkapi field wajib");
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      // console.log(fd);
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("file", file);

      if (isEditing && id) {
        await updateSuratMasuk(id, fd);
        toast.success("Berhasil diperbarui");
      } else {
        console.log("ini masuk");
        await addSuratMasuk(fd);
        toast.success("Berhasil ditambahkan");
      }

      navigate("/surat-masuk");
    } catch (e) {
      toast.error("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link
          to="/surat-masuk"
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Surat Masuk" : "Tambah Surat Masuk"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 grid gap-4">
          {[
            ["NO_SURAT", "No Surat"],
            ["PENGIRIM", "Pengirim"],
            ["PERIHAL", "Perihal"],
            ["JENIS_SURAT", "Jenis Surat"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm">{label} *</label>
              <input
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
              />
              {errors[name] && (
                <p className="text-sm text-red-600">{errors[name]}</p>
              )}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Tanggal Terima *</label>
              <input
                type="date"
                name="TANGGAL_TERIMA"
                value={formData.TANGGAL_TERIMA}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm">Tanggal Surat *</label>
              <input
                type="date"
                name="TANGGAL_SURAT"
                value={formData.TANGGAL_SURAT}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">Keterangan</label>
            <textarea
              name="KETERANGAN"
              value={formData.KETERANGAN}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm">File Surat *</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {errors.FILE && (
              <p className="text-sm text-red-600">{errors.FILE}</p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-4 border-t pt-4">
            <Link to="/surat-masuk" className="px-4 py-2 border rounded">
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded"
            >
              <Save size={16} />
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuratMasukForm;
