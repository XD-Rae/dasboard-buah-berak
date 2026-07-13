import React, {useState, useEffect, useRef} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {ArrowLeft, Upload} from "lucide-react";
import toast from "react-hot-toast";
import {Event} from "../../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog";

const emptyEvent: Event = {
  _id: "",
  nama: "",
  foto: "",
  deskripsi: "",
  tanggal: "",
  lokasi: "",
  jenis: "",
};

const eventTypes = [
  "Gotong Royong",
  "Kerja Bakti",
  "Rapat",
  "Pelatihan",
  "Senam",
  "Posyandu",
  "PKK",
  "Lainnya",
];

const EventForm: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {addEvent, updateEvent, getEventById} = useDataContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<Event>(emptyEvent);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isOtherType, setIsOtherType] = useState(false);
  const [customType, setCustomType] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existingEvent = await getEventById(id);
          if (existingEvent) {
            setEvent(existingEvent);
            setImagePreview(existingEvent.foto);

            // Check if the existing event type is not in predefined types
            const isCustomType = !eventTypes.includes(existingEvent.jenis);
            setIsOtherType(isCustomType);
            if (isCustomType) {
              setCustomType(existingEvent.jenis);
            }

            // Parse the date string to Date object
            const dateParts = existingEvent.tanggal.split(" ");
            if (dateParts.length === 3) {
              const months = {
                Jan: 0,
                Feb: 1,
                Mar: 2,
                Apr: 3,
                May: 4,
                Jun: 5,
                Jul: 6,
                Aug: 7,
                Sep: 8,
                Oct: 9,
                Nov: 10,
                Dec: 11,
              };
              const day = parseInt(dateParts[0]);
              const month = months[dateParts[1] as keyof typeof months];
              const year = parseInt(dateParts[2]);
              setSelectedDate(new Date(year, month, day));
            }
          } else {
            navigate("/events");
            toast.error("Kegiatan tidak ditemukan");
          }
        } catch (error) {
          console.error("Error fetching event:", error);
          toast.error("Gagal mengambil data kegiatan");
          navigate("/events");
        }
      }
    };

    fetchData();
  }, [id, getEventById, navigate, isEditing]);

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
        setEvent((prev) => ({...prev, foto: base64}));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (date: Date): string => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!event.nama.trim()) newErrors.nama = "Nama kegiatan wajib diisi";
    if (!selectedDate) newErrors.tanggal = "Tanggal kegiatan wajib diisi";
    if (!event.lokasi.trim()) newErrors.lokasi = "Lokasi kegiatan wajib diisi";
    if (!event.deskripsi.trim())
      newErrors.deskripsi = "Deskripsi kegiatan wajib diisi";
    if (isOtherType && !customType.trim()) {
      newErrors.jenis = "Jenis kegiatan wajib diisi";
    } else if (!isOtherType && !event.jenis) {
      newErrors.jenis = "Jenis kegiatan wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const {name, value} = e.target;

    if (name === "jenis") {
      if (value === "Lainnya") {
        setIsOtherType(true);
        setEvent((prev) => ({...prev, jenis: ""}));
      } else {
        setIsOtherType(false);
        setEvent((prev) => ({...prev, jenis: value}));
      }
    } else {
      setEvent((prev) => ({...prev, [name]: value}));
    }
  };

  const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomType(value);
    setEvent((prev) => ({...prev, jenis: value}));
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setEvent((prev) => ({
        ...prev,
        tanggal: formatDate(date),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        await updateEvent(id, event);
        toast.success("Kegiatan berhasil diperbarui");
      } else {
        await addEvent(event);
        toast.success("Kegiatan berhasil ditambahkan");
      }
      navigate("/events");
    } catch (err) {
      toast.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/events" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Event Image */}
            <div>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <div className="relative h-48 w-48">
                    {imagePreview ? (
                      <img
                        className="h-48 w-48 object-cover rounded-lg"
                        src={imagePreview}
                        alt="Event preview"
                      />
                    ) : (
                      <div className="h-48 w-48 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Foto Kegiatan
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Pilih Foto
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-700"
              >
                Nama Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={event.nama}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.nama ? "border-red-300" : "border-gray-300"
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.nama && (
                <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="jenis"
                className="block text-sm font-medium text-gray-700"
              >
                Jenis Kegiatan <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="jenis"
                  name="jenis"
                  value={isOtherType ? "Lainnya" : event.jenis}
                  onChange={handleChange}
                  className={`block w-full rounded-md border ${
                    errors.jenis ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Jenis Kegiatan</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {isOtherType && (
                  <input
                    type="text"
                    value={customType}
                    onChange={handleCustomTypeChange}
                    placeholder="Masukkan jenis kegiatan lainnya"
                    className={`mt-2 block w-full rounded-md border ${
                      errors.jenis ? "border-red-300" : "border-gray-300"
                    } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  />
                )}

                {errors.jenis && (
                  <p className="mt-1 text-sm text-red-600">{errors.jenis}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="tanggal"
                className="block text-sm font-medium text-gray-700"
              >
                Tanggal <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="d MMM yyyy"
                className={`mt-1 block w-full rounded-md border ${
                  errors.tanggal ? "border-red-300" : "border-gray-300"
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                placeholderText="Pilih tanggal"
              />
              {errors.tanggal && (
                <p className="mt-1 text-sm text-red-600">{errors.tanggal}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lokasi"
                className="block text-sm font-medium text-gray-700"
              >
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lokasi"
                name="lokasi"
                value={event.lokasi}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.lokasi ? "border-red-300" : "border-gray-300"
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.lokasi && (
                <p className="mt-1 text-sm text-red-600">{errors.lokasi}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="deskripsi"
                className="block text-sm font-medium text-gray-700"
              >
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows={4}
                value={event.deskripsi}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.deskripsi ? "border-red-300" : "border-gray-300"
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.deskripsi && (
                <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>
              )}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to="/events"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? "Perbarui Kegiatan" : "Simpan Kegiatan"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${
          isEditing ? "memperbarui" : "menyimpan"
        } kegiatan ini?`}
        confirmLabel={isEditing ? "Perbarui" : "Simpan"}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default EventForm;
