import { request } from "https";

export function checkServer(url: string) {
    return new Promise<boolean>((resolve, reject) => {
        request({
            host: 'api.mcsrvstat.us',
            path: `/2/${url}`,
            method: 'GET',
        }, response => {
            let body = '';
            response.on('data', (chunk: Buffer) => body += chunk);
            response.on('end', () => {

                try {
                    const data = JSON.parse(body);

                    resolve(data.online);
                }
                catch (e) {
                    resolve(false);
                }
            })
            response.on('error', reject);
            response.on('timeout', reject);
        }).end()
    })
}