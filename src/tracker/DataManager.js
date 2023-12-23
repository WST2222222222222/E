import axios from "axios"
import fireEvent from "../utils/fireEvent"

class DataManager {
    // Maybe we'll have some extra props in the future.
    constructor (settingsMgr) {
        this.lastStopId = -1
        this.nextStopId = 0
        this.lastStopDepTime = -1
        this.nextStopArrTime = -1
        this.nextStopDepTime = -1
        // State = -1: not configured, 0: en route, 1: stopped at the next stop
        this.nextStopState = -1
        this.ptEnds = -1
        this.routeLength = -1
        this.route = null
        // This is to configure the settings manager for the watchdog timer
        this.settingsMgr = settingsMgr
        this.watchDogTimer = null
        this.watchDogLastRun = -1
        this.watchDogRunId = 0
        // State = -1: not configured, 0: pre-pt, 1: pt, 2: tracking, 3: end of tracking
        this.routeState = -1
        this.lastRouteState = -1

        this.pt_starts_unix = -1
        this.t_starts_unix = -1
        this.t_ends_unix = -1
        this.routeFetchTime = -1

        this.willBeRefreshed = 0
        this.willBeRefreshedTimer = 16

        this.dataSyncTime = -1
    }

    async fetchRoute() {
        await axios.get(process.env.REACT_APP_ROUTE_URL, {
            timeout: 60000,
            onDownloadProgress: (progressEvent) => {
                fireEvent("scafProgressUpdate", {loadProgress: Math.floor(progressEvent.loaded / progressEvent.total * 100)})
            }
        })
        .then((response => {this.route = response.data}))
        .catch((error) => {
            fireEvent("scafFailed", {message: `Failed to load tracker data - ${error.message}`})
        })

        this.dataSyncTime = this.route['generated']
        this.route = this.route['destinations']

        return true
    }

    fireRescafAlert() {
        this.willBeRefreshedTimer = this.willBeRefreshedTimer - 1
        fireEvent("alertShow", {message: `Tracker refreshing in ${this.willBeRefreshedTimer} seconds to ensure data accuracy.`, timeout: 15, nonblocking: false, severity: "danger"})
    }

    routeStateRefresh() {
        let workingTs = (new Date().getTime() / 1000);
        this.lastRouteState = this.routeState
        if (this.nextStopId === 1) {
            this.routeState = 0
        } else if (this.lastStopId <= this.ptEnds) {
            this.routeState = 1
        } else if (this.nextStopId < this.route.length) {
            this.routeState = 2
        } else {
            this.lastStopId = this.route.length - 1
            this.nextStopId = this.route.length - 1
            this.routeState = 3
        }

        if (this.lastRouteState !== this.routeState) {
            fireEvent("routeStateChange", {state: this.routeState, ts: workingTs})
        }


        // Determines if we're en-route to a stop or departing it
        this.lastStopDepTime = this.route[this.lastStopId]['unixdeparture']
        this.nextStopArrTime = this.route[this.nextStopId]['unixarrival_v2']
        this.nextStopDepTime = this.route[this.nextStopId]['unixdeparture']

        if (workingTs > this.nextStopArrTime && this.routeState < 3) {
            this.nextStopState = 1
        } else {
            this.nextStopState = 0
        }

        if (this.routeState === 3) {
            clearInterval(this.watchDogTimer)
        }
    }

    // This function is meant to be called after constructing the data manager
    async dataMgrScaffold() {
        await this.fetchRoute()
        let workingTs = (new Date().getTime() / 1000);
        this.routeFetchTime = workingTs
        this.routeLength = this.route.length
        this.lastStopId = -1
        this.nextStopId = 0
        // This is sadly designed to have to loop through everything.
        for (let i = 0; i < this.route.length; i++) {
            if (this.route[i]['region'] === "pt") {
                this.ptEnds = i
            }

            if (this.route[i]['unixdeparture'] < workingTs) {
                this.lastStopId++;
                this.nextStopId++;
            }
        }

        this.pt_starts_unix = this.route[1]['unixarrival']
        this.t_starts_unix = this.route[this.ptEnds + 1]['unixarrival']
        this.t_ends_unix = this.route[this.route.length - 1]['unixarrival']

        this.routeStateRefresh()
        // On scaffold set the last route state to the current route state
        this.lastRouteState = this.routeState
        if (this.routeState < 3) {
            this.watchDogTimer = setInterval(this.watchDog.bind(this), 50)
        }
        this.watchDogLastRun = workingTs
        fireEvent("dataMgrScaffolded", {})
    }

    dataMgrUnscaffold() {
        clearInterval(this.watchDogTimer)
    }

    dataMgrRescaffold() {
        this.dataMgrUnscaffold()
        this.dataMgrScaffold()
    }

    speedMultiplier() {
        return Math.random() * (1.001 - 0.999) + 0.999
    }

    getLastStopDetails() {
        return {
            countrycode: this.route[this.lastStopId]["countrycode"],
            city: this.route[this.lastStopId]["city"],
            region: this.route[this.lastStopId]["region"]
        }
    }
    getPresentsLoaded(ts) {
        let enroute_duration = this.nextStopArrTime - this.lastStopDepTime
        let arrival_duration = this.nextStopDepTime - this.nextStopArrTime

        
        let enroute_diff = this.nextStopArrTime - ts
        if (enroute_diff < 0) {
            enroute_diff = 0
        }

        let arrival_diff = this.nextStopDepTime - ts
        if (arrival_diff < 0) {
            arrival_diff = 0
        } else if (arrival_diff > arrival_duration) {
            arrival_diff = arrival_duration
        }
        
        let startLoaded = this.route[this.lastStopId]['presentsloaded']
        let endLoaded = this.route[this.nextStopId]['presentsloaded']
        let loadedDiff = endLoaded - startLoaded
        let loaded = startLoaded;
        // if (arrival_duration > 0) {
        //     loaded = Math.round(startLoaded + (loadedDiff * 0.6 * ((enroute_duration - enroute_diff) / enroute_duration)) + (loadedDiff * 0.4 * ((arrival_duration - arrival_diff) / arrival_duration)))
        // } else if (enroute_duration > 0) {
        //     loaded = Math.round(startLoaded + (loadedDiff * ((enroute_duration - enroute_diff) / enroute_duration)))
        // }
        return {
            loaded: loaded
        }
    }

    getStopInfo(id) {
        return this.route[id]
    }

    getNextStopDetails() {
        return {
            stopState: this.nextStopState,
            city: this.route[this.nextStopId]["city"],
            region: this.route[this.nextStopId]["region"],
            unixarrival: this.route[this.nextStopId]["unixarrival_v2"],
            unixdeparture: this.route[this.nextStopId]["unixdeparture"],
            countrycode: this.route[this.nextStopId]["countrycode"]
        }
    }

    getMetrics(ts) {
        // TODO: Let's get all of this as part of the stop increment process
        let enroute_duration = this.nextStopArrTime - this.lastStopDepTime
        let arrival_duration = this.nextStopDepTime - this.nextStopArrTime

        
        let enroute_diff = this.nextStopArrTime - ts
        if (enroute_diff < 0) {
            enroute_diff = 0
        }

        let arrival_diff = this.nextStopDepTime - ts
        if (arrival_diff < 0) {
            arrival_diff = 0
        } else if (arrival_diff > arrival_duration) {
            arrival_diff = arrival_duration
        }

        let startGifts = this.route[this.lastStopId]['giftsdelivered']
        let endGifts = this.route[this.nextStopId]['giftsdelivered']
        let giftsDiff = endGifts - startGifts
        // This does a 70/30 split on gifts/carrots being delivered enroute/stopped
        let gifts = startGifts;
        if (arrival_duration > 0) {
            gifts = Math.round(startGifts + (giftsDiff * 0.6 * ((enroute_duration - enroute_diff) / enroute_duration)) + (giftsDiff * 0.4 * ((arrival_duration - arrival_diff) / arrival_duration)))
        } else if (enroute_duration > 0) {
            gifts = Math.round(startGifts + (giftsDiff * ((enroute_duration - enroute_diff) / enroute_duration)))
        }

        let startCookies = this.route[this.lastStopId]['cookieseaten']
        let endCookies = this.route[this.nextStopId]['cookieseaten']
        let cookiesDiff = endCookies - startCookies
        let cookies = startCookies;
        if (arrival_duration > 0) {
            cookies = Math.round(startCookies + (cookiesDiff * 0.6 * ((enroute_duration - enroute_diff) / enroute_duration)) + (cookiesDiff * 0.4 * ((arrival_duration - arrival_diff) / arrival_duration)))
        } else if (enroute_duration > 0) {
            cookies = Math.round(startCookies + (cookiesDiff * ((enroute_duration - enroute_diff) / enroute_duration)))
        }

        let startStockings = this.route[this.lastStopId]['stockingsstuffed']
        let endStockings = this.route[this.nextStopId]['stockingsstuffed']
        let stockingsDiff = endStockings - startStockings
        let stockings = startStockings;
        if (arrival_duration > 0) {
            stockings = Math.round(startStockings + (stockingsDiff * 0.6 * ((enroute_duration - enroute_diff) / enroute_duration)) + (stockingsDiff * 0.4 * ((arrival_duration - arrival_diff) / arrival_duration)))
        } else if (enroute_duration > 0) {
            stockings = Math.round(startStockings + (stockingsDiff * ((enroute_duration - enroute_diff) / enroute_duration)))
        }

        let startMilk = this.route[this.lastStopId]['milkdrank']
        let endMilk = this.route[this.nextStopId]['milkdrank']
        let milkDiff = endMilk - startMilk
        let milk = startMilk;
        if (arrival_duration > 0) {
            milk = Math.round(startMilk + (milkDiff * 0.6 * ((enroute_duration - enroute_diff) / enroute_duration)) + (milkDiff * 0.4 * ((arrival_duration - arrival_diff) / arrival_duration)))
        } else if (enroute_duration > 0) {
            milk = Math.round(startMilk + (milkDiff * ((enroute_duration - enroute_diff) / enroute_duration)))
        }

        let startCarrots = this.route[this.lastStopId]['carrotseaten']
        let endCarrots = this.route[this.nextStopId]['carrotseaten']
        let carrotsDiff = endCarrots - startCarrots
        let carrots = startCarrots;
        if (arrival_duration > 0) {
            carrots = Math.round(startCarrots + (carrotsDiff * 0.6 * ((enroute_duration - enroute_diff) / enroute_duration)) + (carrotsDiff * 0.4 * ((arrival_duration - arrival_diff) / arrival_duration)))
        } else if (enroute_duration > 0) {
            carrots = Math.round(startCarrots + (carrotsDiff * ((enroute_duration - enroute_diff) / enroute_duration)))
        }

        // Conditional metrics
        let distanceTravelledMi = Math.round(this.route[this.nextStopId]['distance-mi'])
        let distanceTravelledKm = Math.round(this.route[this.nextStopId]['distance-km'])
        let speedKph = 0
        let speedMph = 0
        if (this.nextStopState === 0 && this.routeState === 2) {
            let distanceTravelledMiDiff = this.route[this.nextStopId]['distance-mi'] - this.route[this.lastStopId]['distance-mi']
            let distanceTravelledKmDiff = this.route[this.nextStopId]['distance-km'] - this.route[this.lastStopId]['distance-km']

            distanceTravelledMi = Math.round(this.route[this.lastStopId]['distance-mi'] + (distanceTravelledMiDiff * ((enroute_duration - enroute_diff) / enroute_duration)))
            distanceTravelledKm = Math.round(this.route[this.lastStopId]['distance-km'] + (distanceTravelledKmDiff * ((enroute_duration - enroute_diff) / enroute_duration)))
            speedMph = Math.round(this.route[this.lastStopId]['speed-mph'] * this.speedMultiplier())
            speedKph = Math.round(this.route[this.lastStopId]['speed-kph'] * this.speedMultiplier())
        }

        // The Geo API module handles the distance from you metric, which coordinates updates separately.
        return {
            gifts: gifts,
            cookies: cookies,
            stockings: stockings,
            milk: milk,
            carrots: carrots,
            distanceMi: distanceTravelledMi,
            distanceKm: distanceTravelledKm,
            speedMph: speedMph,
            speedKph: speedKph
        }
    }

    getSantaPosition(ts) {
        let enroute_duration = this.nextStopArrTime - this.lastStopDepTime
        if (enroute_duration === 0) {
            enroute_duration = 0.001
        }
        let enroute_diff = this.nextStopArrTime - ts

        if (enroute_diff < 0) {
            enroute_diff = 0
        } else if (enroute_diff > enroute_duration) {
            enroute_diff = enroute_duration
        }

        let startLat = this.route[this.lastStopId]['lat']
        let startLng = this.route[this.lastStopId]['lng']
        let endLat = this.route[this.nextStopId]['lat']
        let endLng = this.route[this.nextStopId]['lng']
        let diffLat = endLat - startLat
        let diffLng = endLng - startLng

        if (diffLng > 200) {
            diffLng = diffLng - 360
        } else if (diffLng < -200) {
            diffLng = diffLng + 360
        }
        
        let santaLat = startLat + (diffLat * ((enroute_duration - enroute_diff) / enroute_duration))
        let santaLng = startLng + (diffLng * ((enroute_duration - enroute_diff) / enroute_duration))

        return {
            lat: santaLat,
            lng: santaLng
        }
    }

    // santaFlip(){
    //     let startLat = this.route[this.lastStopId]['lat']
    //     let endLat = this.route[this.nextStopId]['lat']

    //     if (startLat > endLat){
    //         console.log('Santa is currently heading west')
    //     } else if (startLat < endLat){
    //         console.log('Santa is currently heading east')
    //     }
    // }

    // santaFlip

    // If you are looking at the tracker source code, this is the function that practically runs the entire show. It is on a permanent 50ms interval
    // to fire off appropriate tracker events. This is the central source of timing.
    // To ensure that all timings are in sync throughout the tracker, all events are passed a timestamp from the WD timestamp.
    // Also I know this really shouldn't be called a watchdog because that looks for hardware faults. This just keeps the tracker running.
    // But I came up with this name a long time ago.
    watchDog() {
        let watchDogTs = (new Date().getTime() / 1000)
        // Protection against running the dog when RS3
        if (this.routeState === 3) {
            return
        }

        if (watchDogTs > this.nextStopDepTime) {
            // Code runs when the watchdog is ahead of the next stop departure time (i.e. it's time to leave...)
            // This for loop ensures that we can play catch up to the latest stop if we haven't had the watchdog run in a while.
            let firedStopDep = false
            let firstBulkId = -1
            let lastBulkId = -1
            let isFiringStopDep = false
            let stopDepId = -1
            for (let i = this.nextStopId; i < this.route.length; i++) {
                if (this.route[i]['unixdeparture'] < watchDogTs) {
                    this.lastStopId++;
                    this.nextStopId++;
                    if (!firedStopDep) {
                        isFiringStopDep = true
                        stopDepId = i
                        firedStopDep = true
                    } else {
                        // If we are updating 2+ stops, we bulk these updates so the MapBase can handle all the stuff needed to catch up
                        if (firstBulkId === -1) {
                            firstBulkId = i
                        }
                        lastBulkId = i
                    }
                    //fireEvent("stopDeparture", {id: i, ts: watchDogTs})
                }
            }

            if (firstBulkId !== -1) {
                fireEvent("bulkStopUpdate", {start: firstBulkId, end: lastBulkId})
            }

            this.routeStateRefresh()
            if (isFiringStopDep) {
                fireEvent("stopDeparture", {id: stopDepId, ts: watchDogTs})
            }

            // If the stop we're skipping to is at arrival now, go ahead and fire the arrival event
            if (this.nextStopState === 1) {
                fireEvent("stopArrival", {id: this.nextStopId, ts: watchDogTs})
            }

        } else if (watchDogTs > this.nextStopArrTime) {
            if (this.nextStopState === 0) {
                this.nextStopState = 1
                fireEvent("stopArrival", {id: this.nextStopId, ts: watchDogTs})
            }
        }

        if (this.watchDogRunId % this.settingsMgr.smoothMovement_regupdate_intv === 0) {
            fireEvent("regularUpdate", {ts: watchDogTs})
        }

        if (this.watchDogRunId % this.settingsMgr.smoothMovement_mapupdate_intv === 0) {
            fireEvent("mapUpdate", {ts: watchDogTs})
        }

        // Version 2 of the route rescaffolding algorithm
        // Version 2.1 of the route rescaf algorithm
        // Up to the tracker lifting off, the route is uploaded each day at 6 PM.
        // Then on the day of tracking, it's uploaded at 6 PM, 9 PM, then 1 AM (+ 20 mins to account for WeatherKit fetching)
        // We don't want out of date rout einfo. If the route was fetched before 6:20 PM and it's after 1:20 AM, then refresh the tracker so the latest route
        // is fetched (cause at that point it's stale.)
        // While we could rescaffold, we do a hard refresh just to be on the safe side and alert the user what's going on.
        if (this.routeFetchTime < this.pt_starts_unix - 27600 && watchDogTs > this.pt_starts_unix - 2400 && this.willBeRefreshed === 0) {
            setInterval(() => {
                this.fireRescafAlert()
            }, 1000)
            this.fireRescafAlert()
            setTimeout(() => {
                window.location.replace("/")
            }, 15000)
            this.willBeRefreshed = 1
        }

        this.watchDogRunId = this.watchDogRunId + 1
        if (this.watchDogRunId >= 100000) {
            this.watchDogRunId = 0
        }
        this.watchDogLastRun = new Date().getTime() / 1000
        this.watchDogLastRun = watchDogTs

    }
}

export default DataManager;