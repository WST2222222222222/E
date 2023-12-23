import fireEvent from "../utils/fireEvent"
import frowser from "frowser"

class SettingsManager {
    constructor (props) {
        this.imperial_locales = ["en-us", "en-gb", "en"]
        this.traveled_locales = ["en-us", "en"]
        this.traveled_ls = 2
        this.chromium_browsers = ["Chrome", "Chromium", "Vivaldi", "Brave", "Opera", "Samsung Internet for Android", "Silk", "Puffin"]

        this.browser = frowser.parse(window.navigator.userAgent)
        if (this.browser.os.name === "iPadOS") {
            this.browser.platform.type = "tablet"
        }
        this.ls_available = true
        this.smoothMovement_regupdate_intv = 2
        this.smoothMovement_mapupdate_intv = 4
        this.map_centered = true
        // Ads Flag is unused code in-place for v7 when we eventually figure out ads.
        this.settings = {
            adsFlag: true,
            appearance: "dark",
            arrivalFlags: true,
            santaMagic: false,
            chromeMapFix: false,
            defaultZL: "default",
            ebArrivalVisible: true,
            esdLocalTimeVisible: false,
            mapMode: "street",
            mobileMetricsVisible: true,
            smoothMovement: "default",
            thirdBox: "gifts",
            units: "automatic",
            esdWeatherSummaryVisible: false,
            zoomOnStopArrival: true,
            shownDonateBanner: false,
            clockStyle: "automatic",
            arrivalMethod: "geoapi",
            curLocLat: 0,
            curLocLng: 0,
            curLocLocation: "",
            curLocLastChange: 0,
            safariFsNudgeDown: false,
            shownPreciseLocationNudge: false,
            haveShownShutdownBanner: false
        }

        this.default_settings = JSON.parse(JSON.stringify(this.settings))

        this.streamer_settings = {
            appearance: "dark",
            arrivalFlags: true,
            santaMagic: false,
            chromeMapFix: false,
            defaultZL: "default",
            ebArrivalVisible: false,
            esdLocalTimeVisible: false,
            mapMode: "street",
            mobileMetricsVisible: true,
            smoothMovement: "smoothest",
            thirdBox: "gifts",
            units: "imperial",
            esdWeatherSummaryVisible: true,
            zoomOnStopArrival: true,
            arrivalMethod: "geoapi"
        }

        this.lowperf_settings = {
            santaMagic: false,
            mapMode: "street",
            zoomOnStopArrival: false,
            smoothMovement: "slowest"
        }

        this.classic_settings = {
            appearance: "dark",
            arrivalFlags: false,
            santaMagic: false,
            ebArrivalVisible: false,
            mapMode: "street",
            mobileMetricsVisible: false,
            smoothMovement: "slowest",
            thirdBox: "gifts",
            zoomOnStopArrival: false,
            arrivalMethod: "geoapi"
        }

        this.v5_to_v6_mapping = {
            "appearance": "appearance",
            "arrivalFlags": "arrivalflags",
            "santaMagic": "santamagic",
            "chromeMapFix": "chromemap_fix",
            "defaultZL": "defaultzl",
            "santaArrivalVisible": "santaarival",
            "esdLocalTimeVisible": "localtime",
            "mapMode": "mapmode",
            "mobileMetricsVisible": "mobilemetrics",
            "smoothMovement": "smoothmovement",
            "thirdBox": "thirdbox",
            "units": "units",
            "esdWeatherSummaryVisible": "weathersummary"
        }

        try {
            localStorage.setItem("ls-test", "ls-test")
            localStorage.removeItem("ls-test")
        } catch (e) {
            this.ls_available = false
        }

        if (this.ls_available) {
            this.loadSettings()
        }

        this.pcs_listener = window.matchMedia("(prefers-color-scheme: dark)")
        document.addEventListener("v5repop", this.populate_v5_settings.bind(this))
        // We're mostly concerned about appearance changing here.
        window.addEventListener("visibilitychange", this.onFocusHandler.bind(this))
        this.pcs_listener.addListener(this.on_pcs_change.bind(this))

        if (this.traveled_locales.indexOf(navigator.language.toLowerCase()) !== -1) {
            this.traveled_ls = 1
        }
    }

    tearDown() {
        window.removeEventListener("visibilitychange", this.onFocusHandler.bind(this))
        this.pcs_listener.removeListener(this.on_pcs_change.bind(this))
        document.removeEventListener("v5repop", this.populate_v5_settings.bind(this))
    }

    updateMovementIntvs() {
        // Movement timings
        // Slowest: 200ms (% 4) reg update, 1000ms (% 20) map
        // Slower: 100ms (% 2) reg update, 500ms (% 10) map
        // Default: 100ms (% 2) reg update, 200ms (% 4) map
        // Smoother: 50ms (% 1) reg update, 100ms (% 2) map
        // Smoothest: 50ms (% 1) reg update, 50ms (% 1) map

        if (this.settings.smoothMovement === "slowest") {
            this.smoothMovement_regupdate_intv = 4
            this.smoothMovement_mapupdate_intv = 20
        } else if (this.settings.smoothMovement === "slower") {
            this.smoothMovement_regupdate_intv = 2
            this.smoothMovement_mapupdate_intv = 10
        } else if (this.settings.smoothMovement === "default") {
            this.smoothMovement_regupdate_intv = 2
            this.smoothMovement_mapupdate_intv = 4
        } else if (this.settings.smoothMovement === "smoother") {
            this.smoothMovement_regupdate_intv = 1
            this.smoothMovement_mapupdate_intv = 2
        } else if (this.settings.smoothMovement === "smoothest") {
            this.smoothMovement_regupdate_intv = 1
            this.smoothMovement_mapupdate_intv = 1
        }
    }

    // Debug method to populate v5 settings
    populate_v5_settings(e) {
        localStorage.setItem("appearance", "light")
        localStorage.setItem("arrivalflags", "on")
        localStorage.setItem("santamagic", "on")
        localStorage.setItem("chromemap_fix", "off")
        localStorage.setItem("defaultzl", "default")
        localStorage.setItem("ebarrival", "off")
        localStorage.setItem("localtime", "off")
        localStorage.setItem("mapmode", "hybrid")
        localStorage.setItem("mobilemetrics", "off")
        localStorage.setItem("smoothmovement", "none")
        localStorage.setItem("thirdbox", "gifts")
        localStorage.setItem("units", "automatic")
        localStorage.setItem("weathersummary", "on")
        console.log("Repopulated v5 settings!")
    }

    // THIS METHOD SHOULD NOT HAVE TO CHANGE PERIOD. DO NOT EDIT. KEEP AS IS.
    // Update - 1/19/23: It had to change.
    migrate_v5_to_v6() {
        // New method that loops through a known map of v5->v6 to also allow for partial migrations.
        // It also protects against when something went wrong and if a setting value is undefined.
        for (const [key, value] of Object.entries(this.v5_to_v6_mapping)) {
            if (localStorage.getItem(value) !== null) {
                this.set(key, localStorage.getItem(value))
                if (key === "defaultZL") {
                    if (this.settings.defaultZL > 11) {
                        this.settings.defaultZL = 11
                    }
                } else if (key === "smoothMovement") {
                    // We just have to remap none to slowest and smooth to the new default.
                    // smoother and smoothest retain the same name and settings.
                    if (this.settings.smoothMovement === "none") {
                        this.settings.smoothMovement = "slowest"
                    } else if (this.settings.smoothMovement === "smooth") {
                        this.settings.smoothMovement = "default"
                    }
                }
                // Remove old v5 setting from local storage now that it's migrated
                localStorage.removeItem(value)
            } else if (this.settings.key === undefined) {
                this.settings.key = this.default_settings.key
            }
        }
        // Rewrite settings
        localStorage.setItem("settings", JSON.stringify(this.settings))
    }

    loadSettings() {
        // Load settings is now about ten million times different.
        // We run the v5 to v6 migrate on every load for two purposes.
        // If we're at a clean slate, running that method does nothing. Everything is undefined so we stick with the default settings.
        // If we have a partial migration - then that's great, we only migrate what new setting comes about. Fantastic.
        // IF we have a full migration - same dealio, now just everything is defined.
        // If we also have undefined values in settings - this also protects against it.
        // I think this should work don't ask me tho
        if (localStorage.getItem("settings") !== null) {
            let loading_settings = JSON.parse(localStorage.getItem("settings"))
            for (const [key, value] of Object.entries(loading_settings)) {
                this.settings[key] = value
            }
        }

        this.migrate_v5_to_v6()
        this.updateMovementIntvs()
    }

    onFocusHandler(e) {
        // When we regain focus we mostly care about if the apperance has actually changed.
        // We don't care if other settings changed, this is the exact same behavior from v5
        if (this.ls_available) {
            let loading_settings = JSON.parse(localStorage.getItem("settings"))
            for (const [key, value] of Object.entries(loading_settings)) {
                if (key === "appearance") {
                    this.settings[key] = value
                    this.change_body_darkmode()
                    fireEvent("settingChanged", {key: "appearance", value: this.settings[key]})
                    fireEvent("appearanceChanged", {appearance: this.get_actual_appearance()})
                } 
            }
        }
    }

    // Gets the actual appearance mode to be in (light/dark)
    get_actual_appearance() {
        if (this.settings.appearance !== "automatic") {
            return this.settings.appearance
        } else {
            if ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                return "dark"
            } else if ((!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches))) {
                return "light"
            }
        }
    }

    get_actual_units() {
        if (this.settings.units !== "automatic") {
            return this.settings.units
        } else {
            if (this.imperial_locales.indexOf(navigator.language.toLowerCase()) !== -1) {
                return "imperial"
            } else {
                return "metric"
            }
        }
    }

    // Again, mostly for settings
    get_auto_units() {
        if (this.imperial_locales.indexOf(navigator.language.toLowerCase()) !== -1) {
            return "Imperial"
        } else {
            return "Metric"
        }
    }

    get_auto_clockstyle() {
        try {
            let locale = new Intl.Locale(navigator.language)
            let hourcycle = locale.hourCycle
            if (hourcycle === undefined) {
                // If hourcycles is undefined here it doesn't matter just return 12 hour
                hourcycle = locale.hourCycles[0]
            }
            
            if (hourcycle === "h11") {
                return "12 hour (- 1)"
            } else if (hourcycle === "h12") {
                return "12 hour"
            // This is a *tad* confusing because most countries default to a 23 hour clock cycle.
            // For our purposes we will call it 24 hour, then h24 with 24 hour + 1
            } else if (hourcycle === "h23") {
                return "24 hour"
            } else if (hourcycle === "h24") {
                return "24 hour (+ 1)"
            }
        } catch {
            return "12 hour"
        }
    }

    get_actual_clockstyle() {
        if (this.settings.clockStyle === "automatic") {
            if (this.get_auto_clockstyle() === "12 hour (- 1)") {
                return "h11"
            } else if (this.get_auto_clockstyle() === "12 hour") {
                return "h12"
            } else if (this.get_auto_clockstyle() === "24 hour") {
                return "h23"
            } else if (this.get_auto_clockstyle() === "24 hour (+ 1)") {
                return "h24"
            }
        } else {
            return this.settings.clockStyle
        }
    }

    // Method to change the body data attribute to dark or not
    change_body_darkmode() {
        if (this.get_actual_appearance() === "dark") {
            document.body.dataset.dark = "true"
        } else if (this.get_actual_appearance() === "light") {
            document.body.dataset.dark = "false"
        }
    }

    // Method to change the body data attribute to show ads or not
    change_body_adsflag() {
        if (this.get("adsFlag")) {
            document.body.dataset.ads = "true"
        } else {
            document.body.dataset.ads = "false"
        }
    }

    // Mostly for settings
    get_pcs_appearance() {
        if ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return "Dark"
        } else if ((!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches))) {
            return "Light"
        }
    }

    on_pcs_change() {
        if (this.settings.appearance === "automatic") {
            this.change_body_darkmode()
            fireEvent("appearanceChanged", {color: this.get_actual_appearance()})
        }
    }
    
    get(key) {
        if (key === "appearance_actual") {
            return this.get_actual_appearance()
        } else if (key === "defaultZL_actual") {
            if (this.settings.defaultZL === "default") {
                if (this.browser.platform.type === "mobile") {
                    return 5
                } else {
                    return 6
                }
            } else {
                return this.settings.defaultZL
            }
        } else if (key === "units_actual") {
            return this.get_actual_units()
        } else {
            return this.settings[key]
        }
    }

    // All setting should get passed through this method, as it wraps localstorage and such.
    set(key, value) {
        // Convert on/off into true/false
        if (value === "on" || value === "true") {
            value = true
        } else if (value === "off" || value === "false") {
            value = false
        }

        if (key === "defaultZL") {
            if (this.browser.platform.type === "mobile" && value === 5) {
                value = "default"
            } else if (this.browser.platform.type !== "mobile" && value === 6) {
                value = "default"
            }
        }


        if (this.settings[key] !== value) {
            this.settings[key] = value
            if (key === "smoothMovement") {
                this.updateMovementIntvs()
            } else if (key === "appearance") {
                this.change_body_darkmode()
                fireEvent("appearanceChanged", {color: this.get_actual_appearance()})
            } else if (key === "units") {
                fireEvent("unitsChanged", {units: this.get_actual_units()})
            } else if (key === "adsFlag") {
                this.change_body_adsflag()
            }

            fireEvent("settingChanged", {setting: key, value: value})
            if (this.ls_available) {
                localStorage.setItem("settings", JSON.stringify(this.settings))
            }
        } else {
            // for arrival method, we fire the setting change anyway for recalc purposes
            if (key === "arrivalMethod") {
                fireEvent("settingChanged", {setting: key, value: value})
            }
        }
    }

    set_defaults() {
        for (const [key, value] of Object.entries(this.default_settings)) {
            this.set(key, value)
        }
        fireEvent("alertShow", {message: "Successfully set default settings.", timeout: 5, severity: "success", nonblocking: false})
    }

    set_streamer() {
        for (const [key, value] of Object.entries(this.streamer_settings)) {
            if (key === "chromeMapFix" && !this.is_chromium_browser()) {
                continue
            }

            this.set(key, value)
        }
        fireEvent("alertShow", {message: "Successfully set optimal livestreaming settings.", timeout: 5, severity: "success", nonblocking: false})
    }

    set_lowperf() {
        for (const [key, value] of Object.entries(this.lowperf_settings)) {
            this.set(key, value)
        }

        fireEvent("alertShow", {message: "Successfully set optimal low performance settings.", timeout: 5, severity: "success", nonblocking: false})
    }

    set_classic() {
        for (const [key, value] of Object.entries(this.classic_settings)) {
            this.set(key, value)
        }

        fireEvent("alertShow", {message: "Time machine activated...we're back in 2019!", timeout: 5, severity: "success", nonblocking: false})
    }

    set_map_centered_state(value) {
        this.map_centered = value
        fireEvent("centeredStateChanged", {state: this.map_centered})
    }

    is_chromium_browser() {
        // All Chrome browsers use Blink therefore just detect Blink why didn't we think of this before?!
        // Except for Microsoft Edge, Bowser still thinks its engine is EdgeHTML so we filter by its name for the new edge (and it's so unlikely someone is using old edge)
        // Except for iOS Edge, because that's WebKit
        if (this.browser.engine.name === "Blink" || (this.browser.browser.name === "Microsoft Edge" && this.browser.os.name !== "iOS")) {
            return true
        } else {
            return false
        }
    }
}

export default SettingsManager