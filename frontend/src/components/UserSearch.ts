import { datalist, div, input, option } from '@framework/tags';
import { switchPage } from '@framework/Router';

export default class UserSearch {
    private list: HTMLDataListElement = datalist({
        id: 'user_search',
        role: 'listbox',
        className:
            'absolute bg-black border border-green-600 border-t-0 rounded-b rounded-t-none w-64 p-1 overflow-y-auto',
    });
    private input: HTMLInputElement;
    constructor() {
        this.inputHandle = this.inputHandle.bind(this);
        this.getList = this.getList.bind(this);
        this.focusHandle = this.focusHandle.bind(this);
        this.onkeydownHandle = this.onkeydownHandle.bind(this);
        this.onclickHandle = this.onclickHandle.bind(this);
        this.blurHandle = this.blurHandle.bind(this);
        this.input = input({
            id: 'user_search_id',
            role: 'combobox',
            name: 'user_search',
            className:
                'h-8 w-64 bg-black border border-green-600 p-2 pr-10  font-mono placeholder-green-500/50 focus:outline-none rounded',
            placeholder: 'search...',
            autocomplete: 'off',
            onfocus: this.focusHandle,
            oninput: this.inputHandle,
            onkeydown: this.onkeydownHandle,
            onblur: this.blurHandle,
        });
        this.input.setAttribute('list', '');
    }
    getList(name: string) {
        const url = new URL('/api/profile/list', window.location.href);
        url.searchParams.set('username', name);
        fetch(url)
            .then(resp => {
                if (!resp.ok) throw 'error fetching user list';
                return resp.json();
            })
            .then((data: any) => {
                this.list.replaceChildren(
                    ...data.map((user: any) =>
                        option(
                            {
                                value: user.username,
                                className: 'bg-black cursor-pointer hover:bg-green-900',
                            },
                            user.username
                        )
                    )
                );
                for (let option of this.list.options as any) {
                    option.onclick = () => this.onclickHandle(option);
                }
            })
            .catch(err => console.error(err));
    }
    private onclickHandle(option: any) {
        this.input.value = option.value;
        switchPage('/profile', option.value);
        this.list.style.display = 'none';
    }

    private focusHandle() {
        this.list.style.display = 'block';
    }

    private blurHandle(e: any) {
        if (e.explicitOriginalTarget.parentNode === this.list) {
            e.explicitOriginalTarget.click();
        } else if (e.explicitOriginalTarget.parentNode.parentNode === this.list) {
            e.explicitOriginalTarget.parentNode.click();
        } else {
            this.list.style.display = 'none';
        }
    }

    private inputHandle(_: Event) {
        this.getList(this.input.value);
        for (let option of this.list.options as any) {
            if (option.value.indexOf(this.input.value) > -1) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        }
    }
    private onkeydownHandle(e: any) {
        if (e.keyCode == 13) {
            e.preventDefault();
            const url = new URL('/api/user', window.location.href);
            url.searchParams.set('username', this.input.value);
            fetch(url)
                .then(resp => {
                    if (!resp.ok) throw 'Error getting isUser';
                    return resp.json();
                })
                .then(data => {
                    if (data) {
                        switchPage('/profile', this.input.value);
                    }
                })
                .catch(err => console.warn(err));
        } else if (e.keyCode == 27) {
            this.list.style.display = 'none';
        }
    }

    public render() {
        return div({}, this.input, this.list);
    }
}
