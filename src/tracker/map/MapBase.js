import React from "react"
import "./Map.css"
import fireEvent from "../../utils/fireEvent"

// Probably the rowdiest method of them all because everything here directly interfaces with the GMap. Sorry.

class MapBase extends React.Component {
    constructor(props) {
        super(props)
        this.map = null;
        this.mapov = null;
        this.dataMgr = props.dataMgr;
        this.settingsMgr = props.settingsMgr;
        this.santa_position = null;
        this.scaffolded = 0
        this.scaffold_in_progress = false;
        this.map_mode = "street"
        this.gMapsLoaded = props.gMapsLoaded
        this.lastStopStateChange = -1
        this.lastMapUpdate = -1

        this.markers = {}

        this.old_iw = window.innerWidth
        this.old_ih = window.innerHeight
        this.old_window_orienation = window.orientation

        this.gmap_styles_satellite = [{"elementType":"geometry","stylers":[{"color":"#E5E3DF"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#202124"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#"}]},{"featureType":"administrative.country","elementType":"geometry","stylers":[{"color":"#8f8f8f"}]},{"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"color":"#191A1C"}]},{"featureType":"administrative.land_parcel","stylers":[{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"administrative.province","elementType":"geometry","stylers":[{"color":"#585858"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"color":"#8b8e8f"}]},{"featureType":"landscape.natural.terrain","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#181818"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"poi.park","elementType":"labels.text.stroke","stylers":[{"color":"#1b1b1b"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#E5E3DF"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#8a8a8a"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#373737"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc/related?hl=en-US"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"transit","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"labels.icon","stylers":[{"color":"#cdcdcd"},{"visibility":"off"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#393939"}]},{"featureType":"transit.station.airport","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.airport","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.airport","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#8ACCE1"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#8ACCE1"}]}]
        this.gmap_styles_light = [{"elementType":"geometry","stylers":[{"color":"#E5E3DF"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#202124"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#"}]},{"featureType":"administrative.country","elementType":"geometry","stylers":[{"color":"#8f8f8f"}]},{"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"color":"#191A1C"}]},{"featureType":"administrative.land_parcel","stylers":[{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"administrative.province","elementType":"geometry","stylers":[{"color":"#585858"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"color":"#8b8e8f"}]},{"featureType":"landscape.natural.terrain","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#181818"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"poi.park","elementType":"labels.text.stroke","stylers":[{"color":"#1b1b1b"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#E5E3DF"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#8a8a8a"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#373737"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc/related?hl=en-US"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"transit","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"labels.icon","stylers":[{"color":"#cdcdcd"},{"visibility":"off"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#393939"}]},{"featureType":"transit.station.airport","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.airport","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.airport","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#8ACCE1"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#8ACCE1"}]}]
        this.gmap_styles_dark = [{"elementType":"geometry","stylers":[{"color":"#E5E3DF"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#000"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#"}]},{"featureType":"administrative.country","elementType":"geometry","stylers":[{"color":"#8f8f8f"}]},{"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"color":"#191A1C"}]},{"featureType":"administrative.land_parcel","stylers":[{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#000"}]},{"featureType":"administrative.province","elementType":"geometry","stylers":[{"color":"#585858"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.natural.terrain","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"poi.park","elementType":"labels.text.stroke","stylers":[{"color":"#1b1b1b"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc/related?hl=en-US"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"transit","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"labels.icon","stylers":[{"color":"#cdcdcd"},{"visibility":"off"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#393939"}]},{"featureType":"transit.station.airport","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.airport","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"transit.station.airport","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#8ACCE1"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#8ACCE1"}]}]
    }

    lowheight_shift(bypass_oldih) {
        if (window.innerHeight === this.old_ih && !bypass_oldih) {
            return
        }

        if (window.innerHeight >= 550 && this.old_ih < 550) {
            this.map.panBy(0, this.pxoffset)
            this.oldpxoffset = this.pxoffset
            this.pxoffset = 0
        } else if (window.innerHeight < 550) {
            this.oldpxoffset = this.pxoffset
            if (window.innerHeight >= 500) {
                // 500px - 549px
                this.pxoffset = window.innerHeight * 0.15
            } else if (window.innerHeight >= 400) {
                // 400px - 499px
                this.pxoffset = window.innerHeight * 0.20
            } else if (window.innerHeight >= 350) {
                // 350px - 400px
                this.pxoffset = window.innerHeight * 0.25
            } else if (window.innerHeight >= 300) {
                // 300px - 350px
                this.pxoffset = window.innerHeight * 0.33
            } else {
                // 299px or less
                this.pxoffset = window.innerHeight * 0.40
            }

            if (this.old_ih < 550) {
                this.map.panBy(0, -(this.pxoffset - this.oldpxoffset))
            } else {
                this.map.panBy(0, -this.pxoffset)
            }
        } else {
            // Don't do anything
        }

        // We have to scrollTo on safari when the orientation changes.
        if ((this.old_window_orienation === 0 && (window.orientation === -90 || window.orientation === 90) && window.innerHeight < 520) || ((this.old_window_orienation === -90 || this.old_window_orienation === 90) && window.orientation === 0)) {
            if (this.settingsMgr.browser.browser.name === "Safari" || this.settingsMgr.browser.os.name === "iOS") {
                setTimeout(function () {
                    window.scrollTo(0, 1)
                }, 50)
            }
        }

        this.old_ih = window.innerHeight
        this.old_iw = window.innerWidth
        this.old_window_orienation = window.orientation
    }

    renderGiftTitle(index) {
        let stopdata = this.dataMgr.getStopInfo(index)
        return `${stopdata['city']}, ${stopdata['region']}\nFor more info, click on this gift!`
    }

    // This is async so that we can render markers to the map MUCH faster.
    renderGiftIcon(index) {
        // If we already have a marker at the destination, return undefined
        try {
            if (this.markers[index] !== undefined) {
                return
            }
        } catch (e) {
            // Do nothing if we catch an error.
        }

        // If this is a PT stop (or end of route), set the marker to null and call it a day
        if (index === this.dataMgr.route.length - 1 || index <= this.dataMgr.ptEnds + 1) {
            this.markers[index] = null
            return
        }
        let stopdata = this.dataMgr.getStopInfo(index)
        let marker = new window.google.maps.Marker({
            position: {lat: stopdata['lat'], lng: stopdata['lng']},
            map: this.map,
            title: this.renderGiftTitle(index),
            icon: this.gift_icon,
            zIndex: index,
        })

        window.google.maps.event.addListener(marker, 'click', (function (marker, datarow) {
            return function() {
                fireEvent("esdLaunch_tap", {index: datarow})
            }
        })(marker, index))

        this.markers[index] = marker
    }

    onRouteStateChange(e) {
        if (e.detail.state === 2) {
            this.map.setZoom(this.settingsMgr.get("defaultZL_actual"))
        } else if (e.detail.state === 3) {
            this.onMapUpdate(e, "stopDep")
            setTimeout(() => {
                this.onMapUpdate(e, "stopDep")
            }, 750)
            this.santaMarker.setAnimation()
        }
    }

    onRouteStateChange(e) {
        if (e.detail.state === 1) {
            this.map.setZoom(this.settingsMgr.get("defaultZL_actual"))
        } else if (e.detail.state === 3) {
            this.onMapUpdate(e, "stopDep")
            setTimeout(() => {
                this.onMapUpdate(e, "stopDep")
            }, 750)
            this.santaMarker.setAnimation()
        }
    }

    onStopArrival(e) {
        this.lastStopStateChange = e.detail.ts
        this.santaMarker.setIcon(this.santa_icon_deliver)
        this.santaMarker.setAnimation()
        this.onMapUpdate(e)
        if (this.settingsMgr.map_centered && this.settingsMgr.settings.zoomOnStopArrival) {
            this.map.setZoom(this.settingsMgr.get("defaultZL_actual") + 3)
        }
    }

    onPT(e) {
        this.lastStopStateChange = e.detail.ts
        if (this.dataMgr.routeState === 1) {
            this.santaMarker.setIcon(this.santa_icon)
        }
        this.santaMarker.setIcon(this.santa_icon)
    }

    onStopDeparture(e) {
        this.lastStopStateChange = e.detail.ts
        this.renderGiftIcon(e.detail.id)
        this.onMapUpdate(e, "stopDep")
        // Because we can now receive on stop departure async, just completely tune out the rest of this if we're actually on Next Stop 1
        // Leaving this line in. I don't know why this is here. But it is.
        if (this.dataMgr.nextStopState === 2) {
            return
        }
        
        if (this.dataMgr.routeState === 1) {
            this.santaMarker.setIcon(this.santa_icon)
        }
        this.santaMarker.setIcon(this.santa_icon)
        // There's a new condition here for this to only fire when routeState is 2
        // That else MAY cause some issues but we'll see...?
        if (this.settingsMgr.get("santaMagic") && this.dataMgr.routeState === 2) {
            this.santaMarker.setAnimation(window.google.maps.Animation.BOUNCE)
        } else {
            this.santaMarker.setAnimation()
        }

        if (this.settingsMgr.map_centered && this.dataMgr.routeState === 2 && this.settingsMgr.settings.zoomOnStopArrival) {
            this.map.setZoom(this.settingsMgr.get("defaultZL_actual"))
        }
    }

    onMapUpdate(e, context) {
        if (e.detail.ts - this.lastStopStateChange < 1) {
            if (e.detail.ts - this.lastMapUpdate < 0.2 && this.settingsMgr.settings.zoomOnStopArrival && this.settingsMgr.map_centered) {
                return
            } else {
                this.lastMapUpdate = e.detail.ts
            }
        }

        this.santa_position = this.dataMgr.getSantaPosition(e.detail.ts)
        let santaLatLng = new window.google.maps.LatLng(this.santa_position.lat, this.santa_position.lng)
        let offpoint;
        try {
            offpoint = this.mapov.getProjection().fromLatLngToContainerPixel(santaLatLng)
        } catch (e) {
            return
        }
        offpoint.y = offpoint.y - this.pxoffset;
        this.santaMarker.setPosition(santaLatLng)
        if (this.dataMgr.routeState === 1 || ((this.dataMgr.routeState === 2 || context === "stopDep") && this.settingsMgr.map_centered) || this.dataMgr.routeState === 3) {
            if (this.dataMgr.routeState === 1 || this.dataMgr.routeState === 3) {
                this.map.setZoom(3)
            }
            this.map.setCenter(this.mapov.getProjection().fromContainerPixelToLatLng(offpoint))
        }
    }

    changeMapStyle() {
        let appearance = this.settingsMgr.get("appearance_actual")
        let map_mode = this.settingsMgr.get("mapMode")
        if (map_mode === "street") {
            if (appearance === "dark") {
                this.map.setOptions({
                    mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                    styles: this.gmap_styles_dark
                })
            } else if (appearance === "light") {
                this.map.setOptions({
                    mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                    styles: this.gmap_styles_light
                })
            }
        } else if (map_mode === "hybrid") {
            this.map.setOptions({
                mapTypeId: window.google.maps.MapTypeId.HYBRID,
                styles: this.gmap_styles_satellite
            })
        } else if (map_mode === "satellite") {
            this.map.setOptions({
                mapTypeId: window.google.maps.MapTypeId.SATELLITE,
                styles: this.gmap_styles_satellite
            })
        }
    }

    changeDefaultZL() {
        if (this.settingsMgr.map_centered && this.dataMgr.routeState === 2 && this.dataMgr.nextStopState === 0) {
            this.map.setZoom(this.settingsMgr.get("defaultZL_actual"))
        } else if (this.settingsMgr.map_centered && this.dataMgr.routeState === 2 && this.dataMgr.nextStopState === 1) {
            if (this.settingsMgr.settings.zoomOnStopArrival) {
                this.map.setZoom(this.settingsMgr.get("defaultZL_actual") + 3)
            } else {
                this.map.setZoom(this.settingsMgr.get("defaultZL_actual"))
            }
        }
    }

    changeSantaMagic() {
        if (this.dataMgr.routeState === 2) {
            if (this.dataMgr.nextStopState === 0) {
                if (this.settingsMgr.get("santaMagic")) {
                    this.santaMarker.setAnimation(window.google.maps.Animation.BOUNCE)
                } else {
                    this.santaMarker.setAnimation()
                }
            } else {
                this.santaMarker.setAnimation()
            }
        } else {
            this.santaMarker.setAnimation()
        }
    }

    changeChromeMapFix() {
        let elems = document.getElementsByClassName("gm-style")
        for (const elem of elems) {
            if (this.settingsMgr.settings.chromeMapFix) {
                elem.dataset.chromemapfix = "true"
            } else {
                elem.dataset.chromemapfix = "false"
            }
        }
    }

    changeStopArrivalZoom() {
        // Ah yes, if the zoom on stop arrival is on, and the route state is 2, AND we're at a stop, AND if the map is centered, yes, zoom in the map you goon.
        if (this.settingsMgr.settings.zoomOnStopArrival && this.dataMgr.routeState === 2 && this.dataMgr.nextStopState === 1 && this.settingsMgr.map_centered) {
            this.map.setZoom(this.settingsMgr.get("defaultZL_actual") + 3)
        } else if (!this.settingsMgr.settings.zoomOnStopArrival && this.dataMgr.routeState === 2 && this.dataMgr.nextStopState === 1 && this.settingsMgr.map_centered) {
            this.map.setZoom(this.settingsMgr.get("defaultZL_actual"))
        }
        // Fire on map update so shifting can occur
        this.onMapUpdate({detail: {ts: new Date().getTime() / 1000}})
    }

    onSettingChange(e) {
        if (e.detail.setting === "mapMode") {
            this.changeMapStyle()
        } else if (e.detail.setting === "santaMagic") {
            this.changeSantaMagic()
        } else if (e.detail.setting === "defaultZL") {
            this.changeDefaultZL()
        } else if (e.detail.setting === "chromeMapFix") {
            this.changeChromeMapFix()
        } else if (e.detail.setting === "zoomOnStopArrival") {
            this.changeStopArrivalZoom()
        }
    }

    onBulkStopUpdate(e) {
        for (let i = e.detail.start; i <= e.detail.end; i++) {
            this.renderSantaIcon(i)
        }
    }

    onMapCenterStateChange(e) {
        if (e.detail.state) {
            e.detail['ts'] = new Date().getTime() / 1000
            this.onMapUpdate(e)
            if (this.dataMgr.nextStopState === 1) {
                this.map.setZoom(this.settingsMgr.get("defaultZL_actual") + 3)
            } else {
                this.map.setZoom(this.settingsMgr.get("defaultZL_actual"))
            }
        }
    }

    onESDLaunch(e) {
        if (this.dataMgr.routeState === 3 || !this.settingsMgr.map_centered) {
            let stopdata = this.dataMgr.getStopInfo(e.detail.index)
            let stopLatLng = new window.google.maps.LatLng(stopdata.lat, stopdata.lng)
            let offpoint = this.mapov.getProjection().fromLatLngToContainerPixel(stopLatLng)
            offpoint.y = offpoint.y - this.pxoffset;
            this.map.panTo(this.mapov.getProjection().fromContainerPixelToLatLng(offpoint))
        }
    }

    onAppearanceChange(e) {
        this.changeMapStyle()
    }

    IconChange() {
        if(this.dataMgr.routeState === 1) {
        this.santaMarker = this.santa_icon_pt
        } else if(this.dataMgr.routeState === 2) {
            this.santaMarker = this.santa_icon
        } else if(this.dataMgr.routeState === 3) {
            this.santaMarker = this.santa_icon_deliver
        }
    }
    
    scaffoldMapBase() {
        this.map_settings = {
            center: {lat: 0, lng: 0},
            zoomControl: true,
            zoomControlOptions: {
                position: window.google.maps.ControlPosition.LEFT_RIGHT,
            },
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            tilt: 0,
            rotateControl: false
        }

        this.santa_icon = {
            url: "https://www.santatracker.live/icons/santa-fly.gif",
            scaledSize: new window.google.maps.Size(85, 85)
        }

        this.santa_icon_pt = {
            url: "https://www.santatracker.live/icons/santa-fly.gif",
            scaledSize: new window.google.maps.Size(100, 100)
        }

        this.santa_icon_deliver = {
            url: "https://www.santatracker.live/icons/santa-unload.gif",
            scaledSize: new window.google.maps.Size(100, 100)
        }

        this.gift_icon = {
            url: "https://www.santatracker.live/icons/stops.png",
            scaledSize: new window.google.maps.Size(24, 24)
        }

        this.santaMarker = null;
        
        this.pxoffset = 0;
        this.oldpxoffset = 0;

        // Just temporarily here we need to update the position. Otherwise we call the appearance change/route state change
        // to ensure everything is good with the map
        this.santa_position = this.dataMgr.getSantaPosition(new Date().getTime() / 1000)
        this.map_settings.center = {lat: this.santa_position.lat, lng: this.santa_position.lng}
        if (this.dataMgr.routeState === 1 || this.dataMgr.routeState === 3) {
            this.map_settings.zoom = 3
        } else if (this.dataMgr.routeState === 2) {
            this.map_settings.zoom = (this.dataMgr.nextStopState === 1 && this.settingsMgr.get("zoomOnStopArrival")) ? this.settingsMgr.get("defaultZL_actual") + 3 : this.settingsMgr.get("defaultZL_actual")
        }
        this.map = new window.google.maps.Map(document.getElementById("map"), this.map_settings)
        this.changeMapStyle()
        this.mapov = new window.google.maps.OverlayView()
        this.mapov.onAdd = function () {}
        this.mapov.draw = function () {}
        this.mapov.setMap(this.map)
        

        let marker_settings = {
            position: {lat: this.santa_position.lat, lng: this.santa_position.lng},
            map: this.map,
            icon: this.dataMgr.nextStopState === 1 ? this.santa_icon_deliver : this.santa_icon_pt,
            clickable: false,
            zIndex: 2000,
            optimized: false,
            animation: (this.settingsMgr.settings.santaMagic && this.dataMgr.routeState === 2 && this.dataMgr.nextStopState === 0) ? window.google.maps.Animation.BOUNCE : null
        }

        this.santaMarker = new window.google.maps.Marker(marker_settings)

        document.addEventListener("mapUpdate", this.onMapUpdate.bind(this))
        document.addEventListener("routeStateChange", this.onRouteStateChange.bind(this))
        document.addEventListener("stopArrival", this.onStopArrival.bind(this))
        document.addEventListener("stopPT", this.onPT.bind(this))
        document.addEventListener("stopDeparture", this.onStopDeparture.bind(this))
        document.addEventListener("settingChanged", this.onSettingChange.bind(this))
        document.addEventListener("appearanceChanged", this.onAppearanceChange.bind(this))
        document.addEventListener("centeredStateChanged", this.onMapCenterStateChange.bind(this))
        document.addEventListener("esdLaunch", this.onESDLaunch.bind(this))
        document.addEventListener("bulkStopUpdate", this.onBulkStopUpdate.bind(this))
        window.addEventListener("resize", function() {
            setTimeout(this.lowheight_shift.bind(this), 600)
        }.bind(this))

        for (let i = 0; i <= this.dataMgr.lastStopId; i++) {
            this.renderGiftIcon(i)
        }

        // Call low height shift on map load to hopefully fix a bug
        this.lowheight_shift(true)

        // Mutation observer to wait for gm-style elements to roll in to set chrome map fix to true onload
        let observer = new MutationObserver((mutations, mutationInstance) => {
            let gm_style = document.getElementsByClassName("gm-style")
            if (gm_style.length > 0) {
                this.changeChromeMapFix()
                mutationInstance.disconnect()
            }
        })

        observer.observe(document, {
            childList: true,
            subtree: true
        })
        

        this.scaffolded = 1
        this.scaffold_in_progress = false
    }

    onGMapsLoaded(e) {
        document.removeEventListener("gMapsLoaded", this.onGMapsLoaded.bind(this))
        this.gMapsLoaded = true
        this.componentDidMount()
    }

    componentDidMount() {
        // If gmapsloaded is false do not mount the component.
        if (this.scaffolded !== 0 || this.scaffold_in_progress) {
            // If we already scaffolded and we're remounting do nothing.
            return
        } else if (!this.gMapsLoaded) {
            // If if we haven't scaffolded but GMaps isn't ready, listen for when it is
            document.addEventListener("gMapsLoaded", this.onGMapsLoaded.bind(this))
        } else {
            // If we mounted and GMaps is ready (or componentDidMount was called again from onGMapsLoaded), scaffold
            this.scaffold_in_progress = true
            this.scaffoldMapBase()
        }
    }

    render() {
        return (
            <div id="map"></div>
        )
    }
}

export default MapBase