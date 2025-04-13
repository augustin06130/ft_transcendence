import { db } from "./main";

export async function getPromise(sql: string, params: any[] = []) {
	return new Promise<any>((resolve, reject) => {
		db.get(sql, params, function(err, data) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

export async function runPromise(sql: string, params: any[] = []) {
	return new Promise<number>((resolve, reject) => {
		db.run(sql, params, function(err) {
			if (err) {
				reject(err);
			} else {
				resolve(this.lastID);
			}
		});
	});
}

export async function allPromise(sql: string, params: any[] = []) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, function(err, data) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}
