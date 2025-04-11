import { Status } from "./types";

export const onlineUserStatus: Status = {
    Computer: { time: Number.MAX_SAFE_INTEGER, status: 'online' },
    Guest: { time: Number.MAX_SAFE_INTEGER, status: 'online' },
};

export function startOnlineUserTracking() {
    setInterval(() => {
        const now = Date.now();
        Object.entries(onlineUserStatus).forEach(([key, value]) => {
            if (value.time + 60000 * 5 > now && value.status === 'online') delete onlineUserStatus[key];
        });
    }, 60000);
}
