import { div, p } from "@framework/tags"

export default function Loader() {
	return div(
		{
			className:
				'mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10',
		},
		div(
			{ className: 'text-center py-8' },
			p({ className: 'text-xl text-green-500' }, 'Loading profile data...'),
			div(
				{ className: 'mt-4 flex justify-center' },
				div({ className: 'h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1' }),
				div({ className: 'h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1' }),
				div({ className: 'h-2 w-2 bg-green-500 rounded-full animate-pulse' })
			)
		)
	)

}
