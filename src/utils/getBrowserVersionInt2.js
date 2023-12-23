export default function getBrowserVersionInt2(settingsMgr) {
    try {
        return parseInt(settingsMgr.browser.browser.version.split(".")[1])
    } catch (e) {
        return 0
    }
}