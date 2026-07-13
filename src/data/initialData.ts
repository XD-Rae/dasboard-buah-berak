import { Faculty, Achievement, Event } from '../types';

export const initialFacultyData: Faculty[] = [
  {
    id: '',
    name: '',
    nidn: '',
    fields: [''],
    position: '',
    email: '',
    phone: '',
    address: '',
    education: [
      {
        degree: '',
        institution: '',
        year: '',
        field: ''
      },
      {
        degree: '',
        institution: '',
        year: '',
        field: ''
      }
    ],
    courses: [''],
    publications: [
      {
        title: '',
        link: '',
        year: ''
      },
      {
        title: '',
        link: '',
        year: ''
      }
    ]
  },
  
];

export const initialAchievementData: Achievement[] = [
  {
    id: '',
    judul: '',
    tahun: '',
    mahasiswa: [''],
    deskripsi: ''
    foto: '',  
  },
];

export const initialEventData: Event[] = [
  {
    id: '',
    nama: '',
    foto: '',
    deskripsi: '',
    tanggal: '',
    lokasi: '',
    jenis: ''
  },
];