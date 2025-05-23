export function getCookie(name: string): string | undefined {
    return document.cookie
        .split('; ')
        .find(val => val.startsWith(name + '='))
        ?.slice(name.length + 1);
}

export const isLogged = () => !!getCookie('username') && !!getCookie('tfa');
