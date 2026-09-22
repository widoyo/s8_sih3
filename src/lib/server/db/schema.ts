import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';


export const lembagas = sqliteTable('lembagas', {
	id: integer('id').primaryKey({ autoIncrement: true }), // ID Auto-increment yang efisien
	nama: text('nama').notNull(),
	alamat: text('alamat'),
	desaKelurahan: text('desa_kelurahan'),
	kecamatan: text('kecamatan'),
	kabupatenKota: text('kabupaten_kota'),
	telp: text('telp'),
	picSih3: text('pic_sih3'), // nama orang yang bertanggung jawab terhadap SIH3 di lembaga ini
	picTelp: text('pic_telp'), // nomor telp/WhatsApp orang yang bertanggung jawab terhadap SIH3 di lembaga ini
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// 1. Tabel User
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash'),
	role: text('role', { enum: ['SUPER_ADMIN', 'TENANT_ADMIN'] })
		.notNull()
		.default('TENANT_ADMIN'),
	lembagaId: integer('lembaga_id').references(() => lembagas.id, { onDelete: 'set null' }),
	lastLogin: integer('last_login', { mode: 'timestamp' }), // Nullable (berisi timestamp saat berhasil login)
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// 2. Tabel Session
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// 3. Tabel UserLog (Log Aktivitas)
export const userLogs = sqliteTable('user_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }), // Auto-increment integer sangat ideal & efisien untuk log
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	action: text('action').notNull(), // Contoh: 'LOGIN', 'CREATE_DEVICE', 'DELETE_ITEM'
	details: text('details'), // Informasi tambahan (opsional), bisa berupa catatan teks atau string JSON
	ipAddress: text('ip_address'), // Catatan IP pengguna (opsional)
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Type definitions untuk TypeScript
export type User = typeof users.$inferSelect;
export type UserLog = typeof userLogs.$inferSelect;
export type NewUserLog = typeof userLogs.$inferInsert;

export const das = sqliteTable('das', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	nama: text('nama').notNull(),
	kode: text('kode').unique(),
	luasKm2: integer('luas_km2'), // Opsional: Luas DAS dalam Km2
	
	// Menyimpan data polygon peta (format GeoJSON Geometry atau Array Koordinat)
	// Contoh format isi: {"type":"Polygon","coordinates":[[[104.1,-3.4],[104.2,-3.4],[104.2,-3.5],[104.1,-3.4]]]}
	geometry: text('geometry', { mode: 'json' }).$type<{
		type: 'Polygon' | 'MultiPolygon';
		coordinates: number[][][] | number[][][][];
	}>(),

	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export type Das = typeof das.$inferSelect;
export type NewDas = typeof das.$inferInsert;

// Stasiun Hidrologi (Pos Duga Air / TMA, Pos Curah Hujan, Bendungan)
export const posHidrologi = sqliteTable('pos_hidrologi', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	kode: text('code'), // kode unik oleh pengelola 
	nama: text('nama').notNull(),
	tipe: text('tipe').notNull(), // 'TMA' | 'CH' | 'BENDUNGAN'
	dasId: text('das_id').references(() => das.id),
	sungai: text('sungai'),
	desa: text('desa'),
	kecamatan: text('kecamatan'),
	kabupaten: text('kabupaten'),
	provinsi: text('provinsi'),
	latitude: real('latitude'),
	longitude: real('longitude'),
	elevasi: real('elevasi'),
	alertStatus: text('alert_status').default('NORMAL'), // 'NORMAL' | 'WASPADA' | 'SIAGA' | 'AWAS'
	lastValue: real('last_value'),
	unit: text('unit').default('m'),
	lembagaId: integer('lembaga_id')
		.references(() => lembagas.id, { onDelete: 'set null' }),
	isShow: integer('is_show').default(1), // 1 = tampil di peta, 0 = tidak tampil
	lastUpdated: text('last_updated')
});

// Log Data Hidrologi Real-Time
export const hidrologiLogs = sqliteTable('hidrologi_logs', {
	id: integer('id')
		.primaryKey({ autoIncrement: true }),
	posId: text('pos_id')
		.notNull()
		.references(() => posHidrologi.id),
	value: real('value').notNull(),
	unit: text('unit').notNull(),
	status: text('status').default('NORMAL'),
	recordedAt: text('recorded_at').notNull()
});

// Peringatan Dini Cuaca Ekstrem BMKG (Scraped)
export const bmkgWarnings = sqliteTable('bmkg_warnings', {
	id: integer('id')
		.primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	region: text('region').notNull(),
	severity: text('severity').notNull(), // 'Waspada' | 'Siaga' | 'Awas'
	category: text('category').notNull(), // 'Cuaca Ekstrem' | 'Gelombang Tinggi' | 'Banjir'
	description: text('description'),
	issuedAt: text('issued_at').notNull(),
	expiresAt: text('expires_at')
});

// Log Aktivitas Scraper & API Sync
export const scraperLogs = sqliteTable('scraper_logs', {
	id: integer('id')
		.primaryKey({ autoIncrement: true }),
	source: text('source').notNull(), // 'BMKG_CUACA' | 'BMKG_GEMPA' | 'PUPR_API'
	status: text('status').notNull(), // 'SUCCESS' | 'WARNING' | 'FAILED'
	itemsScraped: integer('items_scraped').default(0),
	errorMessage: text('error_message'),
	executedAt: text('executed_at').notNull()
});
