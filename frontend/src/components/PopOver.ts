import { div } from '@framework/tags';

type PopOverElement = HTMLDivElement & { show: (msg: string) => void; hide: () => void };

function PopOver(): PopOverElement {
	let message: string = '';

	let result: any = div(
		{
			className:
				'fixed top-4 inset-x-0 mx-auto max-w-fit flex justify-center items-center text-center bg-black border border-green-500/30 shadow-xl shadow-green-500/15 p-3 rounded',
		},
		message
	);
	result.style.visibility = 'hidden';

	result.show = (msg: string) => {
		result.innerText = msg;
		result.style.visibility = 'visible';
		window.addEventListener('click', result.hide);
	};

	result.hide = () => {
		result.style.visibility = 'hidden';
		window.removeEventListener('click', result.hide);
	};

	return result;
}

const popOver: PopOverElement = PopOver();
export default popOver;
