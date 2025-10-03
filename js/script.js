// script.js - Logika Peminjaman Loker

document.addEventListener('DOMContentLoaded', () => {
    // Mengubah ID elemen sesuai dengan HTML baru
    const lokerForm = document.getElementById('loker-form');
    const lokerNomorInput = document.getElementById('loker-nomor');
    const peminjamNamaInput = document.getElementById('peminjam-nama');
    const tanggalKembaliInput = document.getElementById('tanggal-kembali'); // Mengacu pada TGL KEMBALI dari form
    const lokerList = document.getElementById('loker-list');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const filterBtn = document.getElementById('filter-btn');

    let peminjaman = []; // Array untuk menyimpan semua objek Peminjaman

    // Fungsi utilitas untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD (untuk TGL PINJAM otomatis)
    const getTodayDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Fungsi untuk memuat data dari LocalStorage
    const loadPeminjaman = () => {
        const storedPeminjaman = localStorage.getItem('peminjaman_loker');
        if (storedPeminjaman) {
            peminjaman = JSON.parse(storedPeminjaman);
        }
        renderPeminjaman();
    };

    // Fungsi untuk menyimpan data ke LocalStorage
    const savePeminjaman = () => {
        localStorage.setItem('peminjaman_loker', JSON.stringify(peminjaman));
    };
    
    // Fungsi untuk mengubah status pengembalian
    const toggleReturnStatus = (id) => {
        const itemIndex = peminjaman.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            peminjaman[itemIndex].isReturned = !peminjaman[itemIndex].isReturned;
            savePeminjaman();
            renderPeminjaman();
        }
    };

    // Fungsi untuk menghapus satu data peminjaman
    const deletePeminjaman = (id) => {
        peminjaman = peminjaman.filter(item => item.id !== id);
        savePeminjaman();
        renderPeminjaman();
    };


    // Fungsi untuk membuat dan menampilkan daftar peminjaman
    const renderPeminjaman = (filter = 'all') => {
        lokerList.innerHTML = ''; // Kosongkan daftar yang ada

        let filteredPeminjaman = peminjaman;
        
        // Logika Filter (Berdasarkan Status "Sudah Dikembalikan" atau "Belum")
        if (filter === 'returned') {
            filteredPeminjaman = peminjaman.filter(item => item.isReturned);
        } else if (filter === 'pending') {
            filteredPeminjaman = peminjaman.filter(item => !item.isReturned);
        }

        if (filteredPeminjaman.length === 0) {
            // Kolom 5: NOMOR LOKER, NAMA PEMINJAM, TGL PEMINJAMAN, STATUS, AKSI
            lokerList.innerHTML = '<tr><td colspan="5" class="no-task-found">Belum ada data peminjaman.</td></tr>';
            return;
        }

        filteredPeminjaman.forEach((item) => {
            const row = lokerList.insertRow();
            
            // Kolom 1: Nomor Loker
            row.insertCell(0).textContent = item.lokerNomor;

            // Kolom 2: Nama Peminjam
            row.insertCell(1).textContent = item.peminjamNama;

            // Kolom 3: Tanggal Peminjaman (Kita akan gunakan tanggal saat data ditambahkan)
            // item.tanggalPinjam digunakan, bukan item.tanggalKembali (dari input form)
            row.insertCell(2).textContent = item.tanggalPinjam; 

            // Kolom 4: Status
            const statusCell = row.insertCell(3);
            statusCell.textContent = item.isReturned ? 'DIKEMBALIKAN' : 'BELUM KEMBALI';
            statusCell.className = item.isReturned ? 'status-done' : 'status-pending';

            // Kolom 5: Aksi
            const actionsCell = row.insertCell(4);

            // Tombol Toggle (Kembalikan/Belum)
            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = item.isReturned ? 'Batal Kembalikan' : 'Sudah Kembali';
            toggleBtn.className = 'action-btn';
            toggleBtn.onclick = () => toggleReturnStatus(item.id);
            actionsCell.appendChild(toggleBtn);

            // Tombol Hapus
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Hapus';
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.onclick = () => deletePeminjaman(item.id);
            actionsCell.appendChild(deleteBtn);
        });
    };

    // Event Listener untuk Form (Tambah Peminjaman)
    lokerForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        // Input Validation
        const lokerNomor = lokerNomorInput.value.trim().toUpperCase();
        const peminjamNama = peminjamNamaInput.value.trim();
        const tanggalKembali = tanggalKembaliInput.value; // Ini adalah tanggal yang diinput pengguna (Tanggal Jatuh Tempo)

        if (lokerNomor === '' || peminjamNama === '' || tanggalKembali === '') {
            alert('Harap isi semua kolom data peminjaman!');
            return;
        }

        // Cek apakah nomor loker sudah dipinjam dan belum dikembalikan
        const isLockerPending = peminjaman.some(item => 
            item.lokerNomor === lokerNomor && !item.isReturned
        );
        
        if (isLockerPending) {
            alert(`Loker Nomor ${lokerNomor} saat ini sedang dipinjam dan belum dikembalikan.`);
            return;
        }

        const newPeminjaman = {
            id: Date.now(), 
            lokerNomor: lokerNomor,
            peminjamNama: peminjamNama,
            // Perhatian: Simpan TGL PINJAM otomatis (tanggal hari ini)
            tanggalPinjam: getTodayDate(), 
            // Meskipun ada input tgl kembali, kita fokus pada TGL PINJAM dan STATUS
            tanggalJatuhTempo: tanggalKembali, 
            isReturned: false // Status awal: Belum Kembali
        };

        peminjaman.push(newPeminjaman);
        savePeminjaman();
        renderPeminjaman();

        // Reset form
        lokerNomorInput.value = '';
        peminjamNamaInput.value = '';
        tanggalKembaliInput.value = '';
    });

    // Event Listener untuk Tombol HAPUS SEMUA DATA (Ini adalah kode yang Anda berikan)
    deleteAllBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua data peminjaman?')) {
            peminjaman = [];
            savePeminjaman();
            renderPeminjaman();
        }
    });

    // Event Listener untuk Tombol FILTER (Implementasi sederhana)
    let currentFilter = 'all';
    filterBtn.addEventListener('click', () => {
        if (currentFilter === 'all') {
            currentFilter = 'pending';
            filterBtn.textContent = 'FILTER (Belum Kembali)';
        } else if (currentFilter === 'pending') {
            currentFilter = 'returned';
            filterBtn.textContent = 'FILTER (Sudah Dikembalikan)';
        } else {
            currentFilter = 'all';
            filterBtn.textContent = 'FILTER (Semua Status)';
        }
        renderPeminjaman(currentFilter);
    });

    // Muat data saat aplikasi pertama kali berjalan
    loadPeminjaman();
});