export const conversionSteps = [
  { step: "01", title: "Unggah", description: "Unggah Resource Pack Java dalam format ZIP." },
  { step: "02", title: "Konversi", description: "JvsB memproses Resource Pack sesuai opsi konversi yang tersedia." },
  { step: "03", title: "Unduh", description: "Setelah selesai, unduh Resource Pack Bedrock kamu." },
];

export const coinPackages = [
  { name: "Starter", coins: "Konfigurasi", description: "Paket awal untuk mencoba satu atau beberapa Conversion kecil." },
  { name: "Builder", coins: "Konfigurasi", description: "Paket fleksibel untuk Resource Pack ukuran sedang." },
  { name: "Creator", coins: "Konfigurasi", description: "Paket lebih besar untuk creator yang sering melakukan Conversion." },
];

export const features = [
  { title: "Alur Conversion terpandu", description: "Unggah ZIP, pilih opsi, lalu pantau status dari dasbor akun yang aman." },
  { title: "Siap untuk sistem Coin", description: "Arsitektur order dan payment yang ada dipertahankan sebagai dasar transaksi berbayar." },
  { title: "Riwayat tersimpan", description: "Pesanan, pembayaran, invoice, notifikasi, dan tiket bantuan tetap berada dalam portal pengguna." },
  { title: "Fokus Resource Pack", description: "UI disiapkan khusus untuk workflow Java Edition ke Bedrock Edition." },
];

export const compatibility = [
  ["Texture", "Disiapkan untuk pemetaan asset Resource Pack dari Java ke Bedrock."],
  ["Model", "Opsi Conversion model akan ditambahkan bertahap sesuai engine."],
  ["Animation", "Dukungan Animation disiapkan sebagai kemampuan lanjutan."],
  ["ZIP validation", "Fondasi UI menekankan upload ZIP sebelum proses berbayar."],
];

export const faqs = [
  ["Fitur apa yang sudah didukung sekarang?", "Saat ini sistem mendukung validasi ZIP, analisis Resource Pack, antrean job, packaging Texture PNG ke .mcpack, dan download terotorisasi. Model dan Animation belum dikonversi penuh."],
  ["Apakah harus login untuk mulai Conversion?", "Ya. Pengunjung bisa melihat informasi dan Harga Coin, tetapi proses Conversion berbayar akan membutuhkan akun."],
  ["Berapa harga Coin final?", "Harga final belum dikonfigurasi. Kartu harga saat ini adalah placeholder yang jelas untuk tahap konfigurasi bisnis berikutnya."],
  ["Apakah data akun lama dihapus?", "Tidak. Authentication, database, session, order, payment, ticket, dan admin foundation tetap dipertahankan."],
];
