import React, {useEffect, useState, useRef} from "react";
import {useParams, Link} from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  FileText,
  Image as ImageIcon,
  ClipboardCheck,
  CheckCircle,
  Camera,
  RefreshCcw,
  X,
  Maximize2, // Icon untuk zoom
} from "lucide-react";
import toast from "react-hot-toast";
import {reportAPI} from "../../services/api";
import {useDataContext} from "../../contexts/DataContext";
import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet";
import L from "leaflet";
import {useAuth} from "../../contexts/AuthContext";

const DefaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

const MAX_IMAGES = 5;

const ReportDetail: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const {user} = useAuth() as any;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Image Lightbox (Zoom)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // State Form Admin
  const [tindakLanjutInput, setTindakLanjutInput] = useState("");

  // State Form KDUS
  const [imagesComplete, setImagesComplete] = useState<File[]>([]);
  const [keteranganPenyelesaianInput, setKeteranganPenyelesaianInput] =
    useState("");

  // State Kamera
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // ============================================
  // FETCH DATA
  // ============================================
  useEffect(() => {
    const initReport = async () => {
      try {
        setLoading(true);
        const data = await reportAPI.getById(id || "");
        setReport(data);

        if (data.tindak_lanjut && data.tindak_lanjut !== "-") {
          setTindakLanjutInput(data.tindak_lanjut);
        }

        if (
          data.keterangan_penyelesaian &&
          data.keterangan_penyelesaian !== "-"
        ) {
          setKeteranganPenyelesaianInput(data.keterangan_penyelesaian);
        }

        if (data && data.status === "submitted" && user?.role !== "KDUS") {
          await reportAPI.updateStatus(id!, "Reading");
          setReport((prev: any) => ({...prev, status: "Reading"}));
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat laporan");
      } finally {
        setLoading(false);
      }
    };

    if (id) initReport();
  }, [id, user?.role]);

  // ============================================
  // KAMERA FUNCTIONS
  // ============================================
  const openCamera = async () => {
    if (imagesComplete.length >= MAX_IMAGES) {
      toast.error(`Maksimal ${MAX_IMAGES} foto.`);
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {facingMode},
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      toast.error("Kamera tidak bisa diakses");
      console.error(err);
    }
  };

  const switchCamera = async () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(() => openCamera(), 200);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (imagesComplete.length >= MAX_IMAGES) {
      closeCamera();
      return;
    }
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `complete-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setImagesComplete((prev) => [...prev, file]);
        closeCamera();
      }
    }, "image/jpeg");
  };

  // ============================================
  // SUBMIT HANDLERS
  // ============================================
  const handleSubmitTindakLanjut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tindakLanjutInput.trim()) return toast.error("Isi tidak boleh kosong");

    try {
      setIsSubmitting(true);
      const payload = {
        tindak_lanjut: tindakLanjutInput,
        status: "in_progress",
      };
      await reportAPI.addTindakLanjut(id!, payload);
      setReport((prev: any) => ({
        ...prev,
        tindak_lanjut: tindakLanjutInput,
        status: "in_progress",
      }));
      toast.success("Tindak lanjut berhasil disimpan");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelesaikanLaporan = async () => {
    if (!keteranganPenyelesaianInput.trim()) {
      return toast.error("Harap isi keterangan penyelesaian!");
    }
    if (imagesComplete.length === 0) {
      return toast.error("Harap lampirkan minimal 1 foto bukti penyelesaian!");
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("status", "resolved");
      formData.append("keterangan_penyelesaian", keteranganPenyelesaianInput);

      imagesComplete.forEach((img) => {
        formData.append("imagesComplete", img);
      });

      await reportAPI.update(id!, formData);

      setReport((prev: any) => ({
        ...prev,
        status: "resolved",
        keterangan_penyelesaian: keteranganPenyelesaianInput,
      }));

      toast.success("Laporan berhasil diselesaikan!");
      setIsModalOpen(false);
      setImagesComplete([]);
    } catch (error) {
      console.error("Error completing report:", error);
      toast.error("Gagal menyelesaikan laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Helpers ---
  const lat = report?.location?.latitude ?? null;
  const lng = report?.location?.longitude ?? null;
  const googleMapsUrl =
    lat && lng ? `http://maps.google.com/?q=${lat},${lng}` : null;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted":
        return "Baru Masuk";
      case "Reading":
        return "Sedang Dibaca";
      case "in_progress":
        return "Dalam Penanganan";
      case "resolved":
        return "Selesai";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reading":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="py-12 text-center">Loading...</div>;
  if (!report)
    return <div className="py-12 text-center">Laporan tidak ditemukan</div>;

  const isKDUS = user?.role === "KDUS";

  return (
    <div className="relative pb-20">
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Link
            to="/reports"
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Laporan</h1>
            <span
              className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(report.status)}`}
            >
              {getStatusLabel(report.status)}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          {isKDUS ? (
            report.status !== "resolved" && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 shadow-sm"
              >
                <CheckCircle size={18} className="mr-2" /> Selesaikan Laporan
              </button>
            )
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm"
            >
              <ClipboardCheck size={18} className="mr-2" /> Tindak Lanjut
            </button>
          )}
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div
            className="relative h-80 w-full bg-gray-100 group cursor-pointer"
            onClick={() => setSelectedImage(report.images?.[0])}
          >
            {report.images?.[0] ? (
              <>
                <img
                  src={report.images[0]}
                  alt="Bukti Awal"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Maximize2
                    className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md"
                    size={32}
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div className="h-80 w-full relative z-0">
            {lat && lng ? (
              <MapContainer
                center={[lat, lng]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]}>
                  <Popup>Lokasi Kejadian</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500">
                Lokasi Kosong
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Pelapor</p>
              <p className="font-semibold text-gray-900">{report.name}</p>
              <p className="text-sm text-gray-600">{report.phone}</p>
              <p className="text-xs bg-gray-100 px-2 py-1 rounded inline-block mt-1">
                🏡{" "}
                {report.dusun_detail
                  ? report.dusun_detail.nama_dusun
                  : report.dusun}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Lokasi</p>
              <p className="text-gray-900">{report.location?.address || "-"}</p>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 underline"
                >
                  Buka Google Maps
                </a>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Kronologi</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-1">{report.title}</h4>
              <p className="text-gray-700 whitespace-pre-line">
                {report.description}
              </p>
            </div>
          </div>

          {/* GALERI BUKTI LAPORAN (AWAL) */}
          {report.images && report.images.length > 0 && (
            <div>
              <h3 className="font-medium text-indigo-700 mb-2 flex items-center">
                <ImageIcon size={18} className="mr-2" /> Foto Bukti Laporan
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {report.images.map((img: string, i: number) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group cursor-pointer"
                    onClick={() => setSelectedImage(img)} // Trigger Lightbox
                  >
                    <img
                      src={img}
                      alt={`Bukti Awal ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2
                        className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md"
                        size={24}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* HASIL TINDAK LANJUT ADMIN */}
          {report.tindak_lanjut && report.tindak_lanjut !== "-" && (
            <div>
              <h3 className="font-medium text-indigo-900 mb-2 flex items-center">
                <ClipboardCheck size={18} className="mr-2" /> Arahan Admin /
                Tindak Lanjut
              </h3>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <p className="text-indigo-900 whitespace-pre-line">
                  {report.tindak_lanjut}
                </p>
              </div>
            </div>
          )}

          {/* HASIL PENYELESAIAN (Resolved) */}
          {report.status === "resolved" && (
            <div className="animate-in fade-in space-y-4">
              {report.keterangan_penyelesaian &&
                report.keterangan_penyelesaian !== "-" && (
                  <div>
                    <h3 className="font-medium text-green-700 mb-2 flex items-center">
                      <FileText size={18} className="mr-2" /> Keterangan
                      Penyelesaian
                    </h3>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-900 whitespace-pre-line">
                      {report.keterangan_penyelesaian}
                    </div>
                  </div>
                )}

              {/* GALERI PENYELESAIAN */}
              {report.imagesComplete && report.imagesComplete.length > 0 && (
                <div>
                  <h3 className="font-medium text-green-700 mb-2 flex items-center">
                    <CheckCircle size={18} className="mr-2" /> Bukti Foto
                    Penyelesaian
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {report.imagesComplete.map((img: string, i: number) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden border border-green-200 shadow-sm relative group cursor-pointer"
                        onClick={() => setSelectedImage(img)} // Trigger Lightbox
                      >
                        <img
                          src={img}
                          alt="Bukti Selesai"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Maximize2
                            className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md"
                            size={24}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================================== */}
      {/* MODAL FORM INPUT */}
      {/* ==================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                {isKDUS ? (
                  <>
                    <CheckCircle className="mr-2 text-green-600" size={20} />{" "}
                    Penyelesaian Laporan
                  </>
                ) : (
                  <>
                    <ClipboardCheck
                      className="mr-2 text-indigo-600"
                      size={20}
                    />{" "}
                    Form Tindak Lanjut
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {isKDUS ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keterangan Penyelesaian
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                      rows={3}
                      placeholder="Jelaskan bagaimana laporan ini diselesaikan..."
                      value={keteranganPenyelesaianInput}
                      onChange={(e) =>
                        setKeteranganPenyelesaianInput(e.target.value)
                      }
                    />
                  </div>

                  <div className="border-t pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto Bukti Penyelesaian (Maks 5)
                    </label>
                    {imagesComplete.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={openCamera}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-colors"
                      >
                        <Camera size={24} className="mr-2" /> Buka Kamera /
                        Ambil Foto
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {imagesComplete.map((file, i) => (
                      <div
                        key={i}
                        className="relative group aspect-square rounded-md overflow-hidden border"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setImagesComplete((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form id="adminForm" onSubmit={handleSubmitTindakLanjut}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Tindak Lanjut
                  </label>
                  <textarea
                    rows={5}
                    className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Tuliskan arahan atau status penanganan..."
                    value={tindakLanjutInput}
                    onChange={(e) => setTindakLanjutInput(e.target.value)}
                    required
                  />
                </form>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Batal
              </button>
              {isKDUS ? (
                <button
                  onClick={handleSelesaikanLaporan}
                  disabled={
                    isSubmitting ||
                    imagesComplete.length === 0 ||
                    !keteranganPenyelesaianInput.trim()
                  }
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Mengupload..." : "Selesaikan & Upload"}
                </button>
              ) : (
                <button
                  type="submit"
                  form="adminForm"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Tindak Lanjut"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* POPUP VIEW KAMERA (Overlay)          */}
      {/* ==================================== */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col justify-center">
          <div className="relative w-full h-full flex flex-col">
            <video
              ref={videoRef}
              className={`flex-1 w-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              playsInline
              muted
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
              <button
                onClick={closeCamera}
                className="p-4 bg-white/20 rounded-full text-white backdrop-blur-md"
              >
                <X size={24} />
              </button>
              <button
                onClick={capturePhoto}
                className="p-1 rounded-full border-4 border-white"
              >
                <div className="w-16 h-16 bg-white rounded-full active:scale-90 transition-transform"></div>
              </button>
              <button
                onClick={switchCamera}
                className="p-4 bg-white/20 rounded-full text-white backdrop-blur-md"
              >
                <RefreshCcw size={24} />
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* ==================================== */}
      {/* 🔥 IMAGE LIGHTBOX (ZOOM POPUP)        */}
      {/* ==================================== */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 cursor-pointer backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-white/10"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Zoomed"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
          />
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
