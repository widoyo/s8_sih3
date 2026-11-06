// src/lib/index.ts

export interface ProcessedStationData {
	id: number;
	station_name: string;
	station_type: number; // 1=ARR, 2=AWLR, 3=AWS
	location: string;
	latestReading: { value: number | null; unit: string | null; label: string; time: string };
    chartLabels: string[];
	chartValues: number[];
	chartType: 'line' | 'bar';
	validation: {
		status: 'NORMAL' | 'WARNING' | 'ANOMALI' | 'MAINTENANCE';
		message: string;
	};
    warningLevels?: {
        siaga1: number | null;
        siaga2: number | null;
        siaga3: number | null;
    };
}

// Fungsi untuk memproses struktur kompleks [Meta, DataBlock, RunningBlock]
export function parseComplexPayload(payload: any[]): ProcessedStationData | null {
	if (!Array.isArray(payload) || payload.length < 3) return null;
	const meta = payload[0];
	const dataBlock = payload[1];
	const runningBlock = payload[2];
	if (
		!meta ||
		typeof meta !== 'object' ||
		!dataBlock ||
		typeof dataBlock !== 'object' ||
		!runningBlock ||
		typeof runningBlock !== 'object'
	) {
		return null;
	}

	const runningLabels = runningBlock?.running_label || [];
	let targetIndex = runningLabels.findIndex((label: string) => 
		label === 'TMA' || label === 'Tinggi Muka Air' || label === 'Curah Hujan'
	);
	if (targetIndex === -1) targetIndex = 0;

    const chartLabels = dataBlock.chart?.chart_label?.[targetIndex]?.[0] || [];

    const latestValue = runningBlock?.running_data?.[targetIndex] ?? dataBlock.table?.weather_data?.[targetIndex] ?? null;
	const latestUnit = runningBlock?.running_symbol?.[targetIndex] ?? dataBlock.table?.array_act_symbol?.[targetIndex] ?? '';
	const latestLabel = runningLabels[targetIndex] ?? dataBlock.table?.array_table_label?.[targetIndex] ?? 'Data';
	const latestTime = dataBlock.table?.date || '';

	const chartValues = dataBlock.chart?.chart_data?.[targetIndex]?.[0] || [];
	const apiChartType = dataBlock.chart?.array_act_chart_type?.[targetIndex]?.[0]?.[0] || 'LineChart';
	const chartType: 'line' | 'bar' = apiChartType.toLowerCase().includes('bar') ? 'bar' : 'line';

	let status: 'NORMAL' | 'WARNING' | 'ANOMALI' | 'MAINTENANCE' = 'NORMAL';
	let message = 'Data normal';

	if (meta.maintenance) {
		status = 'MAINTENANCE'; message = 'Dalam pemeliharaan';
	} else if (latestValue === null || isNaN(Number(latestValue))) {
		status = 'ANOMALI'; message = 'Data kosong/NULL';
	} else if (Number(latestValue) < 0) {
		status = 'ANOMALI'; message = `Nilai negatif tidak valid: ${latestValue}`;
	} else if (latestLabel === 'Curah Hujan' && Number(latestValue) > 100) {
		status = 'ANOMALI'; message = `Hujan ekstrem: ${latestValue} mm`;
	} else {
		const siaga3 = dataBlock.table?.array_act_warning_3?.[targetIndex] ?? null;
		const siaga2 = dataBlock.table?.array_act_warning_2?.[targetIndex] ?? null;
		if (siaga3 !== null && Number(latestValue) >= siaga3) {
			status = 'ANOMALI'; message = `Melebihi Siaga 3 (${siaga3})`;
		} else if (siaga2 !== null && Number(latestValue) >= siaga2) {
			status = 'WARNING'; message = `Mendekati Siaga 2 (${siaga2})`;
		}
	}

	return {
		id: meta.id,
		station_name: meta.station_name,
		station_type: meta.station_type,
		location: meta.location,
		latestReading: { value: Number(latestValue), unit: latestUnit, label: latestLabel, time: latestTime },
		chartLabels,
        chartValues,
		chartType,
		validation: { status, message },
        warningLevels: {   // <-- TAMBAHKAN INI untuk halaman detail
            siaga1: dataBlock.table?.array_act_warning_1?.[targetIndex] ?? null,
            siaga2: dataBlock.table?.array_act_warning_2?.[targetIndex] ?? null,
            siaga3: dataBlock.table?.array_act_warning_3?.[targetIndex] ?? null
        }
	};
}

export function parseStationTimeSeriesPayload(meta: any, response: any): ProcessedStationData | null {
	if (
		!meta ||
		typeof meta !== 'object' ||
		typeof meta.id !== 'number' ||
		typeof meta.station_name !== 'string'
	) {
		return null;
	}

	const blocks = Array.isArray(response) ? response.flat(Infinity) : [response];
	const dataBlock = blocks.find(
		(block: any) =>
			block &&
			typeof block === 'object' &&
			((block.table && typeof block.table === 'object') ||
				(block.chart && typeof block.chart === 'object'))
	);
	const table = dataBlock?.table ?? {};
	const chart = dataBlock?.chart ?? {};

	const latestValueRaw = table.weather_data?.[0]?.[0] ?? null;
	const latestValue =
		latestValueRaw === null || !Number.isFinite(Number(latestValueRaw))
			? null
			: Number(latestValueRaw);
	const chartLabels = chart.chart_label?.[0]?.[0] ?? [];
	const chartValues = chart.chart_data?.[0]?.[0] ?? [];
	const apiChartType = chart.array_act_chart_type?.[0]?.[0]?.[0] ?? 'LineChart';
	const chartType: 'line' | 'bar' = String(apiChartType).toLowerCase().includes('bar')
		? 'bar'
		: 'line';
	const latestLabel = table.array_table_label?.[0] ?? 'Data';
	const latestUnit = table.array_act_symbol?.[0]?.[0] ?? '';

	let status: 'NORMAL' | 'WARNING' | 'ANOMALI' | 'MAINTENANCE' = 'NORMAL';
	let message = 'Data normal';
	if (meta.maintenance) {
		status = 'MAINTENANCE';
		message = 'Dalam pemeliharaan';
	} else if (latestValue === null) {
		status = 'ANOMALI';
		message = 'Data kosong/NULL';
	}

	const warningLevel = (key: string) => {
		const value = table[key]?.[0];
		return value == null || !Number.isFinite(Number(value)) ? null : Number(value);
	};

	return {
		id: meta.id,
		station_name: meta.station_name,
		station_type: meta.station_type,
		location: meta.location ?? '',
		latestReading: {
			value: latestValue,
			unit: latestUnit,
			label: latestLabel,
			time: table.date?.[0] ?? ''
		},
		chartLabels: Array.isArray(chartLabels) ? chartLabels : [],
		chartValues: Array.isArray(chartValues) ? chartValues : [],
		chartType,
		validation: { status, message },
		warningLevels: {
			siaga1: warningLevel('array_act_warning_1'),
			siaga2: warningLevel('array_act_warning_2'),
			siaga3: warningLevel('array_act_warning_3')
		}
	};
}

// Fungsi Utama yang Resilien
export function parseDashboardResponse(responseData: any): ProcessedStationData[] {
	// Skenario 1: Array of Complex Payloads (seperti contoh JSON Anda sebelumnya)
	if (Array.isArray(responseData) && responseData.length > 0 && Array.isArray(responseData[0]) && responseData[0].length >= 3) {
		return responseData.map((payload: any[]) => parseComplexPayload(payload)).filter(Boolean) as ProcessedStationData[];
	}

	// Skenario 2: Wrapped in object like { data: [...] } atau { stations: [...] }
	if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
		const list = responseData.data || responseData.stations || responseData.items || [];
		if (Array.isArray(list)) {
			return parseDashboardResponse(list); // Recursive call
		}
	}

	// Skenario 3: Flat Array (jika API mengoptimalkan response dashboard)
	if (Array.isArray(responseData)) {
		return responseData.map((station: any) => ({
			id: station.id,
			station_name: station.station_name,
			station_type: station.station_type,
			location: station.location,
			latestReading: {
				value: station.latest_value ?? station.value ?? null,
				unit: station.unit ?? station.symbol ?? '',
				label: station.label ?? 'Data',
				time: station.time ?? station.date ?? ''
			},
			chartValues: Array.isArray(station.chart_data) ? station.chart_data : (Array.isArray(station.data) ? station.data : []),
			chartType: station.chart_type === 'BarChart' ? 'bar' : 'line',
			validation: {
				status: station.maintenance ? 'MAINTENANCE' : 'NORMAL',
				message: station.maintenance ? 'Maintenance' : 'Normal'
			}
		}));
	}

	return [];
}

export interface ProcessedStationData {
  meta?: any;
  latestReading: { value: number | null; unit: string | null; label: string; time: string };
  chartLabels?: string[];
  chartValues: number[];
  chartType: 'line' | 'bar'; // Dinamis berdasarkan API
  warningLevels?: { siaga1: number | null; siaga2: number | null; siaga3: number | null };
  validation: {
    status: 'NORMAL' | 'WARNING' | 'ANOMALI' | 'MAINTENANCE';
    message: string;
  };
}

export function parseAtabPayload(payload: any[]): ProcessedStationData | null {
  if (!payload || payload.length < 3) return null;

  const meta = payload[0];
  const dataBlock = payload[1];
  const runningBlock = payload[2];

  // 1. CARI INDEX TARGET SECARA DINAMIS (TMA atau Curah Hujan)
  const runningLabels = runningBlock?.running_label || [];
  let targetIndex = runningLabels.findIndex((label: string) => 
    label === "TMA" || label === "Tinggi Muka Air" || label === "Curah Hujan"
  );
  
  // Fallback ke index 0 jika tidak ditemukan (untuk jaga-jaga)
  if (targetIndex === -1) targetIndex = 0;

  // 2. EKSTRAK DATA TERKINI
  const latestValue = runningBlock?.running_data?.[targetIndex] ?? dataBlock.table.weather_data?.[targetIndex] ?? null;
  const latestUnit = runningBlock?.running_symbol?.[targetIndex] ?? dataBlock.table.array_act_symbol?.[targetIndex] ?? '';
  const latestLabel = runningLabels[targetIndex] ?? dataBlock.table.array_table_label?.[targetIndex] ?? 'Data';
  const latestTime = dataBlock.table.date;

  // 3. EKSTRAK DATA GRAFIK (Handle struktur 3D array API: chart_data[channel][0][time])
  const rawChartData = dataBlock.chart?.chart_data?.[targetIndex]?.[0] || [];
  const rawChartLabels = dataBlock.chart?.chart_label?.[targetIndex]?.[0] || [];

  // 4. DETEKSI JENIS GRAFIK DARI API (BarChart untuk Hujan, LineChart untuk TMA)
  const apiChartType = dataBlock.chart?.array_act_chart_type?.[targetIndex]?.[0]?.[0] || 'LineChart';
  const chartType: 'line' | 'bar' = apiChartType.toLowerCase().includes('bar') ? 'bar' : 'line';

  // 5. EKSTRAK BATAS PERINGATAN
  const warnings = dataBlock.table;
  const siaga1 = warnings?.array_act_warning_1?.[targetIndex] ?? null;
  const siaga2 = warnings?.array_act_warning_2?.[targetIndex] ?? null;
  const siaga3 = warnings?.array_act_warning_3?.[targetIndex] ?? null;

  // 6. LOGIKA VALIDASI DATA (Idiot-proof untuk tim Anda)
  let status: 'NORMAL' | 'WARNING' | 'ANOMALI' | 'MAINTENANCE' = 'NORMAL';
  let message = 'Data beroperasi dalam batas normal.';

  if (meta.maintenance) {
    status = 'MAINTENANCE';
    message = 'Stasiun sedang dalam masa pemeliharaan. Data mungkin tidak akurat.';
  } else if (latestValue === null || isNaN(Number(latestValue))) {
    status = 'ANOMALI';
    message = 'Data sensor kosong, rusak, atau tidak terkirim (NULL/NaN).';
  } else if (Number(latestValue) < 0) {
    status = 'ANOMALI';
    message = `Nilai fisik tidak mungkin negatif: ${latestValue} ${latestUnit}. Cek kalibrasi sensor.`;
  } else if (latestLabel === "Curah Hujan" && Number(latestValue) > 100) {
    status = 'ANOMALI';
    message = `Hujan ekstrem tidak masuk akal: ${latestValue} mm/jam. Kemungkinan sensor tersumbat atau error.`;
  } else if (siaga3 !== null && Number(latestValue) >= siaga3) {
    status = 'ANOMALI';
    message = `NILAI EKSTREM! Melebihi batas Siaga 3 (${siaga3} ${latestUnit}). Segera verifikasi lapangan!`;
  } else if (siaga2 !== null && Number(latestValue) >= siaga2) {
    status = 'WARNING';
    message = `Waspada: Nilai mendekati batas Siaga 2 (${siaga2} ${latestUnit}).`;
  }

  return {
    meta,
    latestReading: { value: Number(latestValue), unit: latestUnit, label: latestLabel, time: latestTime },
    chartLabels: rawChartLabels,
    chartValues: rawChartData,
    chartType,
    warningLevels: { siaga1, siaga2, siaga3 },
    validation: { status, message }
  };
}