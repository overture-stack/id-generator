

/// ego-KC switch
export async function egoAuthHandler(){

}


export function isJwt(tokenString: string) {
    const jwtSplitted = tokenString.split('.');
    if (jwtSplitted.length != 3) {
        return false;
    }
    const jwtHeader = Buffer.from(jwtSplitted[0], 'base64').toString('binary');
    if (!jwtHeader.includes('alg') && !JSON.parse(jwtHeader)['typ'].includes('JWT')) {
        return false;
    }
    return true;
}
