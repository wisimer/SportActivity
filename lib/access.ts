export function setToken(
    access_token: string | undefined
    // , refresh_token: string | undefined
    // , expireTime: number
): void {
    if (access_token) {
        localStorage.setItem('access_token', access_token);
    } else {
        localStorage.removeItem('access_token');
    }
    // if (refresh_token) {
    //     localStorage.setItem('refresh_token', refresh_token);
    // } else {
    //     localStorage.removeItem('refresh_token');
    // }
    // localStorage.setItem('expireTime', `${expireTime}`);
}

export function getAccessToken() {
    return localStorage.getItem('access_token');
}

// export function getRefreshToken() {
//     return localStorage.getItem('refresh_token');
// }
//
// export function getTokenExpireTime() {
//     return localStorage.getItem('expireTime');
// }

export function clearSessionToken() {
    // sessionStorage.removeItem('user');
    localStorage.removeItem('access_token');
    // localStorage.removeItem('refresh_token');
    // localStorage.removeItem('expireTime');
}