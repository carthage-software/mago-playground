
export function replaceHash(newHash) {
    window.location.hash = '#' + newHash;
}

export function replaceSearchParams(newParams)  {
    const queryParams = new URLSearchParams(window.location.search);

    Object.entries(newParams).forEach(([key, value]) => {
        value ? queryParams.set(key, value) : queryParams.delete(key);
    });

    const newURL = new URL(window.location.href);
    newURL.search = '?' + queryParams.toString();
    window.history.pushState({path: newURL.href}, '', newURL.href);
}

export function grabHash() {
    return window.location.hash;
}

export function grabSearchParams() {
    return new URLSearchParams(window.location.search);
}
