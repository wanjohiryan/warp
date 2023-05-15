export default function getUrl(path: string) {
    const baseUrl = new URL(window.location.href);
    if (baseUrl.pathname.endsWith("/")) {
        baseUrl.pathname += path; // append path to the existing path
    } else {
        baseUrl.pathname += `/${path}`; // append /path to the existing path
    }

    return baseUrl.href;
}