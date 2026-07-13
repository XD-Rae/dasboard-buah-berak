import React, {useState, useEffect, useRef} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {ArrowLeft, Plus, Trash2, Upload} from "lucide-react";
import toast from "react-hot-toast";
import {Aparatur} from "../../types";

// Interface for Education based on your Schema mapping:
// degree -> Jenjang
// institution -> Agama
// year -> Jenis Kelamin
// field -> Tempat, Tanggal Lahir
interface Education {
  degree: string;
  institution: string;
  year: string;
  field: string;
}

const emptyAparatur: Aparatur = {
  _id: "",
  name: "",
  nidn: "", // NIK
  fields: [], // Jabatan
  position: "Aparatur",
  email: "",
  foto: "",
  education: [], // [Jenjang, Agama, JK, TTL]
  courses: [], // Alamat
  // Removed publications, hki, pengabdian
};

const AparaturForm: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {addAparatur, updateAparatur, getAparaturById, aparatur} =
    useDataContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aparaturData, setAparaturData] = useState<Aparatur>(emptyAparatur);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for Jabatan (fields)
  const [newField, setNewField] = useState("");
  const [showFieldSuggestions, setShowFieldSuggestions] = useState(false);

  // State for Alamat (courses)
  const [newCourse, setNewCourse] = useState("");
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);

  // State for Education (Data Lain-lain)
  const [tempEducation, setTempEducation] = useState<Education>({
    degree: "",
    institution: "",
    year: "",
    field: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  // Suggestions logic
  const existingFields = Array.from(new Set(aparatur.flatMap((a) => a.fields)));
  // Although courses are addresses now, suggestions might still be useful for shared addresses
  const existingCourses = Array.from(
    new Set(aparatur.flatMap((a) => a.courses || [])),
  );

  const filteredFields = existingFields.filter(
    (field) =>
      field.toLowerCase().includes(newField.toLowerCase()) &&
      !aparaturData.fields?.includes(field),
  );

  const filteredCourses = existingCourses.filter(
    (course) =>
      course.toLowerCase().includes(newCourse.toLowerCase()) &&
      !aparaturData.courses?.includes(course),
  );

  const isEditing = !!id;

  useEffect(() => {
    const fetchAparaturData = async () => {
      if (isEditing && id) {
        try {
          const existingAparatur = await getAparaturById(id);
          if (existingAparatur) {
            setAparaturData({...existingAparatur, position: "Aparatur"});
            if (existingAparatur.foto) {
              setImagePreview(existingAparatur.foto);
            }
          } else {
            navigate("/aparatur");
            toast.error("Aparatur tidak ditemukan");
          }
        } catch (error) {
          console.error("Error fetching aparatur:", error);
          toast.error("Gagal memuat data Aparatur");
        }
      }
    };

    fetchAparaturData();
  }, [id, getAparaturById, navigate, isEditing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar. Maksimal 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setAparaturData((prev) => ({...prev, foto: base64String}));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Logic for Jabatan (fields) ---
  const handleAddField = (field: string = newField.trim()) => {
    if (field && !aparaturData.fields?.includes(field)) {
      setAparaturData((prev) => ({
        ...prev,
        fields: [...(prev.fields || []), field],
      }));
      setNewField("");
      setShowFieldSuggestions(false);
      setErrors((prev) => ({...prev, fields: undefined}));
    }
  };

  const handleRemoveField = (index: number) => {
    setAparaturData((prev) => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== index),
    }));
  };

  // --- Logic for Alamat (courses) ---
  const handleAddCourse = (course: string = newCourse.trim()) => {
    if (course && !aparaturData.courses?.includes(course)) {
      setAparaturData((prev) => ({
        ...prev,
        courses: [...(prev.courses || []), course],
      }));
      setNewCourse("");
      setShowCourseSuggestions(false);
      setErrors((prev) => ({...prev, courses: undefined}));
    }
  };

  const handleRemoveCourse = (index: number) => {
    setAparaturData((prev) => ({
      ...prev,
      courses: prev.courses?.filter((_, i) => i !== index),
    }));
  };

  // --- Logic for Education (Data Lain-lain) ---
  const handleAddEducation = () => {
    if (
      tempEducation.degree.trim() !== "" &&
      tempEducation.institution.trim() !== "" &&
      tempEducation.year.trim() !== "" &&
      tempEducation.field.trim() !== ""
    ) {
      setAparaturData((prev) => ({
        ...prev,
        education: [...(prev.education || []), {...tempEducation}],
      }));
      setTempEducation({degree: "", institution: "", year: "", field: ""});
      setErrors((prev) => ({...prev, education: undefined}));
    } else {
      toast.error("Semua field data lain-lain harus diisi");
    }
  };

  const handleRemoveEducation = (index: number) => {
    setAparaturData((prev) => ({
      ...prev,
      education: prev.education?.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const {name, value} = e.target;
    setAparaturData((prev) => ({...prev, [name]: value}));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!aparaturData.name.trim()) newErrors.name = "Nama Aparatur wajib diisi";
    if (!aparaturData.nidn.trim()) newErrors.nidn = "NIK wajib diisi";
    if (!aparaturData.fields || aparaturData.fields.length === 0)
      newErrors.fields = "Jabatan wajib diisi";
    if (!aparaturData.education || aparaturData.education.length === 0)
      newErrors.education = "Data Lain-lain wajib diisi";
    if (!aparaturData.courses || aparaturData.courses.length === 0)
      newErrors.courses = "Alamat wajib diisi";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!aparaturData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(aparaturData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Harap perbaiki semua error pada form");
      return;
    }

    const submittedData = {...aparaturData, position: "Aparatur"};

    try {
      if (isEditing && id) {
        await updateAparatur(id, submittedData);
        toast.success("Data Aparatur berhasil diperbarui");
      } else {
        await addAparatur(submittedData);
        toast.success("Data Aparatur berhasil ditambahkan");
      }
      navigate("/aparatur");
    } catch (error) {
      console.error("Error saving aparatur:", error);
      toast.error("Gagal menyimpan data Aparatur");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/aparatur" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Data Aparatur" : "Tambah Aparatur Baru"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Profile Image */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <div className="relative h-32 w-32">
                    {imagePreview ? (
                      <img
                        className="h-32 w-32 object-cover rounded-full"
                        src={imagePreview}
                        alt="Profile preview"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Foto Profil
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

            {/* Personal Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Informasi Pribadi
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={aparaturData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="nidn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    NIK <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nidn"
                    name="nidn"
                    value={aparaturData.nidn}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.nidn ? "border-red-300" : "border-gray-300"
                    } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.nidn && (
                    <p className="mt-1 text-sm text-red-600">{errors.nidn}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={aparaturData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value="AKTIF" // Default value based on schema/logic
                    readOnly
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Jabatan (Fields) */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Jabatan <span className="text-red-500">*</span>
              </h2>
              <div className="mb-4">
                {aparaturData.fields && aparaturData.fields.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {aparaturData.fields.map((field, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1"
                      >
                        <span className="text-sm font-medium text-blue-800">
                          {field}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(index)}
                          className="ml-1 rounded-full p-1 text-blue-700 hover:bg-blue-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newField}
                      onChange={(e) => {
                        setNewField(e.target.value);
                        setShowFieldSuggestions(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddField();
                        }
                      }}
                      placeholder="Ketik Jabatan (contoh: Kepala Desa)"
                      className={`block w-full rounded-md border ${
                        errors.fields ? "border-red-300" : "border-gray-300"
                      } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />

                    {showFieldSuggestions &&
                      newField &&
                      filteredFields.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                          <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                            {filteredFields.map((field, index) => (
                              <li
                                key={index}
                                className="cursor-pointer px-3 py-2 hover:bg-blue-50"
                                onClick={() => handleAddField(field)}
                              >
                                {field}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddField()}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus size={16} className="mr-2" />
                    Tambah
                  </button>
                </div>
                {errors.fields && (
                  <p className="mt-1 text-sm text-red-600">{errors.fields}</p>
                )}
              </div>
            </div>

            {/* Alamat (Courses) */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Alamat <span className="text-red-500">*</span>
              </h2>
              <div className="mb-4">
                {aparaturData.courses && aparaturData.courses.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {aparaturData.courses.map((course, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center rounded-full bg-green-100 px-3 py-1"
                      >
                        <span className="text-sm font-medium text-green-800">
                          {course}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(index)}
                          className="ml-1 rounded-full p-1 text-green-700 hover:bg-green-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newCourse}
                      onChange={(e) => {
                        setNewCourse(e.target.value);
                        setShowCourseSuggestions(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCourse();
                        }
                      }}
                      placeholder="Masukkan Alamat Lengkap"
                      className={`block w-full rounded-md border ${
                        errors.courses ? "border-red-300" : "border-gray-300"
                      } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />

                    {showCourseSuggestions &&
                      newCourse &&
                      filteredCourses.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                          <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                            {filteredCourses.map((course, index) => (
                              <li
                                key={index}
                                className="cursor-pointer px-3 py-2 hover:bg-blue-50"
                                onClick={() => handleAddCourse(course)}
                              >
                                {course}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddCourse()}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus size={16} className="mr-2" />
                    Tambah
                  </button>
                </div>
                {errors.courses && (
                  <p className="mt-1 text-sm text-red-600">{errors.courses}</p>
                )}
              </div>
            </div>

            {/* Education (Lain-lain) */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Data Lain-lain <span className="text-red-500">*</span>
              </h2>

              {/* List of Added Data */}
              <div className="mb-4">
                {aparaturData.education &&
                  aparaturData.education.length > 0 && (
                    <div className="mb-4 space-y-3">
                      {aparaturData.education.map((edu, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md bg-gray-50 p-3 border border-gray-200"
                        >
                          <div className="grid grid-cols-2 gap-4 w-full mr-4">
                            <div>
                              <span className="text-xs text-gray-500 block">
                                Jenjang
                              </span>
                              <span className="font-medium text-sm">
                                {edu.degree}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">
                                Agama
                              </span>
                              <span className="font-medium text-sm">
                                {edu.institution}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">
                                Jenis Kelamin
                              </span>
                              <span className="font-medium text-sm">
                                {edu.year}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">
                                TTL
                              </span>
                              <span className="font-medium text-sm">
                                {edu.field}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(index)}
                            className="rounded-full p-2 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Form to Add New Data */}
                <div className="rounded-md border border-gray-300 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Degree -> Jenjang */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Jenjang Pendidikan
                      </label>
                      <select
                        value={tempEducation.degree}
                        onChange={(e) =>
                          setTempEducation((prev) => ({
                            ...prev,
                            degree: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Pilih Jenjang</option>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="D3">D3</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    </div>

                    {/* Institution -> Agama */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Agama
                      </label>
                      <select
                        value={tempEducation.institution}
                        onChange={(e) =>
                          setTempEducation({
                            ...tempEducation,
                            institution: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Pilih Agama</option>
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Konghucu">Konghucu</option>
                      </select>
                    </div>

                    {/* Year -> Jenis Kelamin */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Jenis Kelamin
                      </label>
                      <select
                        value={tempEducation.year}
                        onChange={(e) =>
                          setTempEducation({
                            ...tempEducation,
                            year: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    {/* Field -> Tempat, Tanggal Lahir */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tempat, Tanggal Lahir
                      </label>
                      <input
                        type="text"
                        value={tempEducation.field}
                        onChange={(e) =>
                          setTempEducation({
                            ...tempEducation,
                            field: e.target.value,
                          })
                        }
                        placeholder="Contoh: Jakarta, 01-01-1990"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      <Plus size={16} className="mr-2" />
                      Tambah Data Lain-lain
                    </button>
                  </div>
                </div>
                {errors.education && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.education}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to="/aparatur"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? "Perbarui Data" : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AparaturForm;
