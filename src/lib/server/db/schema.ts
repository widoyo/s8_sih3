import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Stasiun Hidrologi (Pos Duga Air / TMA, Pos Curah Hujan, Bendungan)
export const hydrologyStations = sqliteTable('hydrology_stations', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	code: text('code').notNull().unique(),
	name: text('name').notNull(),
	type: text('type').notNull(), // 'TMA' | 'CH' | 'BENDUNGAN'
	riverBasin: text('river_basin').default('BBWS Sumatera VIII'),
	location: text('location').notNull(),
	latitude: real('latitude'),
	longitude: real('longitude'),
	alertStatus: text('alert_status').default('NORMAL'), // 'NORMAL' | 'WASPADA' | 'SIAGA' | 'AWAS'
	lastValue: real('last_value'),
	unit: text('unit').default('m'),
	lastUpdated: text('last_updated')
});

// Log Data Hidrologi Real-Time
export const hydrologyLogs = sqliteTable('hydrology_logs', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	stationId: text('station_id')
		.notNull()
		.references(() => hydrologyStations.id),
	value: real('value').notNull(),
	unit: text('unit').notNull(),
	status: text('status').default('NORMAL'),
	recordedAt: text('recorded_at').notNull()
});

// Peringatan Dini Cuaca Ekstrem BMKG (Scraped)
export const bmkgWarnings = sqliteTable('bmkg_warnings', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
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
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	source: text('source').notNull(), // 'BMKG_CUACA' | 'BMKG_GEMPA' | 'PUPR_API'
	status: text('status').notNull(), // 'SUCCESS' | 'WARNING' | 'FAILED'
	itemsScraped: integer('items_scraped').default(0),
	errorMessage: text('error_message'),
	executedAt: text('executed_at').notNull()
});
