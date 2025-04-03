export type Getter<T> = () => T;
export type Setter<T> = (value: T) => void;

export type UseStateType<T> = {
	get: Getter<T>;
	set: Setter<T>;
}
type Callback<T> = (newValue: T, oldValue: T) => void;

let currentComponent: (() => void) | null = null;

export default function UseState<T>(initialValue: T, callback?: Callback<T>): UseStateType<T> {
	let value = initialValue;

	const subscribers = new Set<() => void>();
	const handler: ProxyHandler<{ value: T }> = {
		set(target, property: keyof { value: T }, newValue: T) {
			const oldValue = target[property];
			if (oldValue !== newValue) {
				target[property] = newValue;
				if (callback) callback(newValue, oldValue);
				subscribers.forEach((subscriber) => subscriber());
			}
			return true;
		},
		get(target, property: keyof { value: T }) {
			if (currentComponent) {
				subscribers.add(currentComponent);
			}
			return target[property];
		},
	};

	const proxy = new Proxy<{ value: T }>({ value }, handler);

	return {
		get() {
			return proxy.value;
		},
		set(newValue: T) {
			proxy.value = newValue;
		},
	};
}

export function render(component: () => void) {
	currentComponent = component;
	const result = component();
	currentComponent = null;
	return result;
}
