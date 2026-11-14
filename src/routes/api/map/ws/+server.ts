import { json, type RequestHandler } from '@sveltejs/kit';
import wsData from '$lib/assets/ws-msbl.json';

export const GET: RequestHandler = async () => {
    return json(wsData, {
        headers: {
            'Cache-Control': 'public, max-age=3600'
        }
    });
};