import { a } from '@framework/tags';
import { Args, HTMLElementProperties } from '@framework/types';
import { switchPage } from './Router';

export default function Link(
    attributes: HTMLElementProperties<'a'>,
    to: string,
    ...children: Args[]
) {
    const linkElement = a(
        {
            ...attributes,
            href: to,
        },
        ...children
    );

    linkElement.addEventListener('click', event => {
        event.preventDefault();
        switchPage(to);
    });

    return linkElement;
}
