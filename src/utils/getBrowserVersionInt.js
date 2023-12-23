export default function getBrowserVersionInt(settingsMgr) {
    try {
        return parseInt(settingsMgr.browser.browser.version.split(".")[0])
    } catch (e) {
        return 0
    }
}