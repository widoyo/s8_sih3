import { db } from './index'; // Sesuaikan path ke koneksi database Drizzle Anda
import { lembagas, users } from './schema';
import { scryptSync, randomBytes } from 'node:crypto';

// Fungsi pembantu sederhana untuk membuat password hash (scrypt)
function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const hashedPassword = scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hashedPassword}`;
}

async function seed() {
	console.log('🌱 Memulai proses seeding...');

	// 1. Seed Data Lembaga
	const [lembagaA] = await db
		.insert(lembagas)
		.values({
			nama: 'Balai Besar Wilayah Sungai Sumatera VIII',
			alamat: 'Jl. Sukarno Hatta No. 12',
			desaKelurahan: 'Kerten',
			kecamatan: 'Laweyan',
			kabupatenKota: 'Kota Palembang',
			telp: '0'
		})
		.returning();
	const [lembagaB] = await db
		.insert(lembagas)
		.values({
			nama: 'Dinas Pengelola Sumber Daya Air Prov Sumatera Selatan',
			alamat: 'Jl. Pemuda No. 12',
			desaKelurahan: 'Kerten',
			kecamatan: 'Laweyan',
			kabupatenKota: 'Kota Palembang',
			telp: '0'
		})
		.returning();

	console.log('✅ Data Lembaga berhasil dibuat.');

	// 2. Seed Data Users
	await db.insert(users).values([
		{
			username: 'superadmin',
			passwordHash: hashPassword('Admin123'),
			role: 'SUPER_ADMIN',
			lembagaId: null // Super Admin tidak terikat lembaga khusus
		},
        {
            username: 'admin_bbwss8',
            passwordHash: hashPassword('Admin123'),
            role: 'TENANT_ADMIN',
            lembagaId: lembagaA.id // Terhubung ke lembaga yang baru dibuat
        },
		{
			username: 'admin_dpsda',
			passwordHash: hashPassword('Tenant123'),
			role: 'TENANT_ADMIN',
			lembagaId: lembagaB.id // Terhubung ke lembaga yang baru dibuat
		}
	]);

	console.log('✅ Data User berhasil dibuat.');
	console.log('🚀 Seeding selesai!');
}

seed().catch((err) => {
	console.error('❌ Gagal melakukan seeding:', err);
	process.exit(1);
});