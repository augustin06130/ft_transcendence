import { Args, HTMLElementProperties } from '@framework/types';
import { el } from '@framework/el';

const tags = [
    'div',
    'h1',
    'h2',
    'h3',
    'p',
    'a',
    'span',
    'select',
    'canvas',
    'button',
    'form',
    'input',
    'br',
    'nav',
    'li',
    'ul',
    'pre',
    'label',
    'img',
    'table',
    'tr',
    'th',
    'td',
    'textarea',
    'datalist',
	'option',
	'fieldset',
	'title',
	'script',
] as const;

export const elements = Object.fromEntries(
    tags.map(tag => [
        tag,
        (attributes: HTMLElementProperties<typeof tag>, ...children: Args[]) =>
            el(tag, attributes, ...children),
    ])
) as {
    [K in (typeof tags)[number]]: (
        attributes: HTMLElementProperties<K>,
        ...children: Args[]
    ) => HTMLElementTagNameMap[K];
};

Object.assign(globalThis, elements);

export const {
    div,
    h1,
    h2,
    h3,
    p,
    a,
    span,
    select,
    canvas,
    button,
    form,
    input,
    br,
    nav,
    li,
    ul,
    pre,
    label,
    img,
    table,
    tr,
    th,
    td,
    textarea,
	datalist,
	option,
	fieldset,
	title,
	script,
} = elements;
