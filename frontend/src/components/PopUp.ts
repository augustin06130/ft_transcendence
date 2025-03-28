import { div, h2, p, button } from '@framework/tags';

export type PopUpElement = HTMLDivElement & { show: (callBack: (response: boolean) => void) => void, }

export default function popUp(title: string, message: string): PopUpElement {
	const buttonClassName = 'px-4 py-1 border border-green-500 rounded';
	const titleLabel: HTMLElement = h2({ className: 'text-2xl font-bold mb-3' }, title);
	const messageLabel: HTMLParagraphElement = p({ className: 'mb-4' }, message);
	const buttonConfirm: HTMLButtonElement = button({ className: buttonClassName }, 'Confirm');
	const buttonCancel: HTMLButtonElement = button({ className: buttonClassName }, 'Cancel');

	let result: any = div(
		{
			className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/20',
			id: 'popup-id',
		},
		div(
			{
				className:
					'flex flex-col items-center text-center border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10  -translate-y-3/4',
			},
			titleLabel,
			messageLabel,
			div({ className: 'flex space-x-4' },
				buttonConfirm,
				buttonCancel,
			)
		)
	);
	result.style.visibility = "hidden";

	type cal = (result: Boolean) => void;
	result.show = (callBack: cal) => {
		buttonConfirm.onclick = () => callBack(true);
		buttonCancel.onclick = () => callBack(false);
		result.style.visibility = "visible";
	};

	result.hide = () => {
		result.style.visibility = "hidden";
	};

	return result
}
