import { div } from "@framework/tags"

export type TournamentElement = HTMLDivElement & { change: (html: string) => void }

export default function Tournament() {
	const main = div({});
	const result: any = div({}, 'salut', main);

	result.change = (html: string) => {
		main.innerHTML = html;
	}

	return result;
}
