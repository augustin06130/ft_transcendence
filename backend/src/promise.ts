import { db } from "./main";

export async function getPromise(sql: string, params: any[]) {
	return new Promise<any>((resolve, reject) => {
		db.get(sql, params, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

export async function runPromise(sql: string, params: any[]) {
	return new Promise<void>((resolve, reject) => {
		db.run(sql, params, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

export async function allPromise(sql: string, params: any[]) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}
