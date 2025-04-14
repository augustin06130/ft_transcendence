import { div, textarea, label, input, span } from '@framework/tags';
import { UseStateType } from '@framework/UseState';

export function InputL(
    id: string,
    type: string,
    state: UseStateType<string>,
    placeholder: string,
    icon: SVGSVGElement,
    disabled: boolean = false
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
            maxLength: 100,
            disabled,
            event: {
                input: e => state.set((e.target as any)?.value),
            },
        })
    );
}

export function TextareaL(
    id: string,
    state: UseStateType<string>,
    placeholder: string,
    icon: SVGSVGElement,
    disabled: boolean = false
): HTMLDivElement {
    return div(
        { className: 'space-y-1' },
        label(
            { htmlFor: id, className: 'text-sm flex items-center gap-2' },
            icon,
            span({}, `${id.toUpperCase()}:`)
        ),
        textarea({
            id,
            name: id,
            className:
                'w-full bg-black border border-green-500/30 p-2 text-green-500 resize-none h-24',
            placeholder,
            value: state.get(),
			maxLength: 1000,
            disabled,
            event: {
                input: e => state.set((e.target as any)?.value),
            },
        })
    );
}
