import { env } from '$env/dynamic/private';

const BASE_URL = env.ATAB_API_BASE_URL || 'https://atab-api.blitztechnology.tech';
const USERNAME = env.ATAB_API_USERNAME || 'userSumateraviii';
const PASSWORD = env.ATAB_API_PASSWORD || 'userSumateraviii';

// In-memory token cache
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export interface AtabStation {
	id: number;
	station_name: string;
	location: string;
	sungai: string;
	longitude: number;
	latitude: number;
	elevasi: number;
	delta_mdpl: number | null;
	station_type: number; // 1 = ARR (Rain), 2 = AWLR (Water level), 3 = AWS (Weather), 4 = CCTV
	provinsi: number;
	balai: number;
	siaga: number | null;
	maintenance: boolean;
	hide: boolean;
	created_at: string;
}

export interface AtabTimeSeriesResponse {
	table_data?: {
		array_table_header?: string[];
		array_table_data?: string[];
		array_table_label?: string[];
	};
	chart?: {
		chart_date?: string;
		chart_data?: number[][][];
		chart_label?: string[][][];
		array_act_symbol?: string[][][];
	};
}

/**
 * Authenticate with ATAB API Gateway and return Bearer token.
 * Token is cached in memory until expiration.
 */
export async function getAtabToken(): Promise<string> {
	const now = Date.now();
	// If token exists and is valid for at least 5 more minutes, use cached token
	if (cachedToken && tokenExpiresAt > now + 300000) {
		return cachedToken;
	}

	try {
		const res = await fetch(`${BASE_URL}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: USERNAME,
				password: PASSWORD
			})
		});

		if (!res.ok) {
			throw new Error(`Login ATAB API gagal with status ${res.status}`);
		}

		const data = await res.json();
		if (!data.token) {
			throw new Error('Token tidak ditemukan dalam respon login ATAB');
		}

		const tokenStr: string = data.token;
		cachedToken = tokenStr;
		// Default token valid for 2 hours unless refreshed
		tokenExpiresAt = now + 2 * 60 * 60 * 1000;
		return tokenStr;
	} catch (err) {
		console.error('Error authenticating with ATAB API:', err);
		throw err;
	}
}

/**
 * Fetch all hydrology stations from BBWS Sumatera VIII ATAB API Gateway.
 */
export async function getAtabStations(): Promise<AtabStation[]> {
	try {
		const token = await getAtabToken();
		const res = await fetch(`${BASE_URL}/station/`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (res.status === 401) {
			// Token might be expired, reset token & retry once
			cachedToken = null;
			const newToken = await getAtabToken();
			const retryRes = await fetch(`${BASE_URL}/station/`, {
				headers: {
					Authorization: `Bearer ${newToken}`
				}
			});
			return await retryRes.json();
		}

		if (!res.ok) {
			throw new Error(`Error fetching stations: ${res.statusText}`);
		}

		return await res.json();
	} catch (err) {
		console.error('Failed to fetch ATAB stations:', err);
		return [];
	}
}

/**
 * Fetch detail for a specific hydrology station.
 */
export async function getAtabStationDetail(stationId: number): Promise<AtabStation | null> {
	try {
		const token = await getAtabToken();
		const res = await fetch(`${BASE_URL}/station/${stationId}/`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) return null;
		return await res.json();
	} catch (err) {
		console.error(`Failed to fetch station detail for ID ${stationId}:`, err);
		return null;
	}
}

/**
 * Fetch real-time time-series data for a station.
 */
export async function getAtabTimeSeries(
	stationId: number,
	firstDate?: string,
	lastDate?: string
): Promise<AtabTimeSeriesResponse | null> {
	try {
		const token = await getAtabToken();
		let url = `${BASE_URL}/data/${stationId}/`;
		if (firstDate && lastDate) {
			url += `?first_date=${firstDate}&last_date=${lastDate}`;
		}

		const res = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) return null;
		return await res.json();
	} catch (err) {
		console.error(`Failed to fetch time-series data for station ${stationId}:`, err);
		return null;
	}
}

/**
 * Fetch home dashboard overview data from ATAB API.
 */
export async function getAtabDashboard(): Promise<any> {
	try {
		const token = await getAtabToken();
		const res = await fetch(`${BASE_URL}/dashboard/`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) return null;
		return await res.json();
	} catch (err) {
		console.error('Failed to fetch ATAB dashboard data:', err);
		return null;
	}
}
