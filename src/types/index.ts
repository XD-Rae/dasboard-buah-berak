export interface ReportLocation {
  latitude?: number;
  longitude?: number;
}

export type ReportCategory =
  | "Infrastruktur"
  | "Keamanan"
  | "Kesehatan"
  | "Kebersihan"
  | "Sosial"
  | "Bencana"
  | "Lainnya";

export type ReportStatus =
  | "submitted"
  | "verified"
  | "in_progress"
  | "resolved"
  | "rejected";

// -------- User Types --------
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  idDusun?: string; // Tambahkan ini (tanda tanya artinya optional)
}

// -------- Surat Masuk Related Types --------
export interface SURAT_MASUK {
  _id?: string; // dari MongoDB

  IDSURATMASUK: string;
  TANGGAL_TERIMA: string; // biasanya dikirim API dalam bentuk ISO string
  TANGGAL_SURAT: string;
  NO_SURAT: string;
  PENGIRIM: string;
  PERIHAL: string;
  JENIS_SURAT: string;
  FILE_PATH: string;
  KETERANGAN?: string;

  CREATED_AT?: string;
  UPDATED_AT?: string;
}

export interface SURAT_KELUAR {
  _id?: string; // dari MongoDB

  IDSURATKELUAR: string;
  TANGGAL_SURAT: string; // Date dari MongoDB biasanya diterima frontend sebagai ISO string
  TANGGAL_KELUAR: string;
  NO_SURAT: string;
  TUJUAN: string;
  PERIHAL: string;
  ISI_SURAT: string;
  JENIS_SURAT: string;

  // File utama surat
  FILE_PATH: string;

  STATUS?: string; // default "FINAL" dari backend

  CREATED_AT?: string;
  UPDATED_AT?: string;
}

// -------- Users Related Types --------
export interface USER {
  _id?: string; // opsional, karena di API kamu sering disembunyikan
  IDUSER: string;
  NAMA: string;
  EMAIL: string;
  PASSWORD?: string; // biasanya tidak selalu dikirim dari API
  ROLE: string;
  REFRESH_TOKEN?: string;
  CREATED_AT?: string;
  UPDATED_AT?: string;
}

// -------- Bantuan Types --------
export interface Bantuan {
  _id: string;
  rank: number;
  nama: string;
  finalScore: number;
  raw: {
    gaji: number;
    usia: number;
    tanggungan: number;
    penyakit: string;
    rumah: string;
    aset: string;
  };
}

// -------- Penduduk Related Types --------
export interface Penduduk {
  _id: string;
  nama: string;
  gaji_pokok: number;
  usia: number;
  tanggungan: number;
  penyakit: string;
  kondisi_rumah: string;
  aset: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Dusun Related Types --------
export interface Dusun {
  idDusun: string; // UUID
  nama_dusun: string;
  kepala_dusun: string;
  jumlah_rt: number;
  keterangan: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Roles Related Types --------
export interface Role {
  _id: string;
  IDROLE: string;
  NAMA: string;
  CREATED_AT?: string;
  UPDATED_AT?: string;
}

// -------- Faculty Related Types --------

export interface Faculty {
  _id: string;
  name: string;
  nidn: string;
  fields: string[]; // e.g., ["AI", "IoT"]
  position: string;
  foto?: string;
  email: string;

  education?: Education[];
  courses?: string[];
  publications?: Publication[];
  hki?: HKI[];
  pengabdian?: CommunityService[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Education {
  _id?: string;
  degree: string; // e.g., "S1", "S2", "PhD"
  institution: string; // e.g., "Universitas ABC"
  year: string; // e.g., "2020"
  field?: string; // optional: "Computer Science"
}

export interface Publication {
  _id?: string;
  title: string;
  year: string;
  link?: string;
}

export interface HKI {
  _id?: string;
  judulHKI: string;
  tanggalHKI: string;
  nomorHKI: string;
  linkDriveHKI?: string;
}

export interface CommunityService {
  _id?: string;
  judulPengabdian: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi: string;
  gambarPengabdian: string[];
}

// -------- Achievement Type --------

export interface Achievement {
  _id: string;
  judul: string;
  tahun: string;
  mahasiswa: string[]; // array of names
  deskripsi: string;
  foto: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Event Type --------

export interface Event {
  _id: string;
  nama: string;
  foto: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  jenis: string; // e.g., "Seminar", "Workshop"
  createdAt?: string;
  updatedAt?: string;
}

// -------- Partner Type --------

export interface Partner {
  _id: string;
  name: string;
  logo: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Testimonial Type --------

export interface Testimonial {
  _id: string;
  name: string;
  tahunlulus: string;
  pekerjaan: string;
  perusahaan: string;
  image: string;
  testimoni: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Intellectual Property Types --------

export interface IntellectualProperty {
  _id: string;
  title: string;
  date: string;
  number: string;
  authors: string[];
  driveUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Report Property Types --------

export interface Report {
  _id: string;
  name: string;
  phone: string;
  dusun: string;
  rt: string;
  title: string;
  description: string;
  category: ReportCategory;
  location?: ReportLocation;
  image: string;
  status: ReportStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface HKI extends IntellectualProperty {}
export interface Patent extends IntellectualProperty {}
export interface IndustrialDesign extends IntellectualProperty {}
