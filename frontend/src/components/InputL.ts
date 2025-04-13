import { div, label, input, span } from "@framework/tags";
import { UseStateType } from "@framework/UseState";

export default function InputL(
	id: string,
	type: string,
	state: UseStateType<string>,
	placeholder: string,
	icon: SVGSVGElement,
	disabled: boolean
): HTMLDivElement {
	return div(
		{ className: 'space-y-1' },
		label(
			{ htmlFor: id, className: 'text-sm flex items-center gap-2' },
			icon,
			span({}, `${id.toUpperCase()}:`)
		),
		input({
			id: id,
			type: type,
			name: id,
			className: 'w-full bg-black border border-green-500/30 p-2 text-green-500',
			placeholder: placeholder,
			value: state.get(),
			disabled,
			event: {
				input: e => state.set((e.target as any)?.value),
			},
		})
	);
}


