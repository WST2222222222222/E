import React from "react"

// MBC is intended to be a standalone component that really relies on its parent to send it data about metrics and render it when appropriate
// this is to avoid registering duplicate event listeners b/c the parent will register appropriate metric listeners
class MetricBoxCounter extends React.Component {
    constructor(props) {
        super(props)
        this.settingsMgr = props.settingsMgr
        this.state = {
            context: props.context,
        }
        // We locally cache the speed metric to prevent it from going above 10 FPS. Even though two instances are getting made of MBC this will be fine.
        this.speedMetricMph = "0 mph"
        this.speedMetricKph = "0 kph"
        this.speedMetricLastUpdated = 0;
    }

    renderBoxTitle(metricVisible) {
        if (metricVisible === "gifts") {
            return "Gifts Delivered"
        } else if (metricVisible === "cookies") {
            return "Cookies Eaten"
        } else if (metricVisible === "stockings") {
            return "Stockings Stuffed"
        } else if (metricVisible === "milk") {
            return "Milk Drank"
        } else if (metricVisible === "carrots") {
            return "Carrots Eaten"
        } else if (metricVisible === "distance") {
            return this.settingsMgr.traveled_ls === 1 ? "Distance traveled" : "Distance travelled"
        } else if (metricVisible === "speed") {
            return "Speed"
        } else if (metricVisible === "distancefromyou") {
            return "Distance from you"
        }
    }

    renderMetricBoxPrefix(metric) {
        return this.state.context === "mm" ? this.renderBoxTitle(metric) + ": " : ""
    }

    renderSpeedMetric(metricsdata) {
        // If we are over 100ms since the last update - go ahead and use the metrics data, OR if the speed is 0 (in which we should switch immediately)
        // Otherwise use our cached speed metric
        // We use 95ms for the timing because otherwise it'll not update as frequently as we want it to
        if (new Date().getTime() - this.speedMetricLastUpdated >= 95 || metricsdata.speedMph === 0) {
            this.speedMetricKph = metricsdata.speedKph.toLocaleString() + " kph"
            this.speedMetricMph = metricsdata.speedMph.toLocaleString() + " mph"
            this.speedMetricLastUpdated = new Date().getTime()
        }

        if (this.settingsMgr.get("units_actual") === "imperial") {
            return this.speedMetricMph
        } else if (this.settingsMgr.get("units_actual") === "metric") {
            return this.speedMetricKph
        }
    }

    renderMetrics(metricVisible, metricsdata, dfydata) {
        if (metricVisible === "gifts") {
            return metricsdata.gifts.toLocaleString()
        } else if (metricVisible === "cookies") {
            return metricsdata.cookies.toLocaleString()
        } else if (metricVisible === "stockings") {
            return metricsdata.stockings.toLocaleString()
        } else if (metricVisible === "milk") {
            return metricsdata.milk.toLocaleString()
        } else if (metricVisible === "carrots") {
            return metricsdata.carrots.toLocaleString()
        } else if (metricVisible === "speed") {
            return this.renderSpeedMetric(metricsdata)
        } else if (metricVisible === "distance") {
            if (this.settingsMgr.get("units_actual") === "imperial") {
                return metricsdata.distanceMi.toLocaleString() + " mi"
            } else if (this.settingsMgr.get("units_actual") === "metric") {
                return metricsdata.distanceKm.toLocaleString() + " km"
            }
        } else if (metricVisible === "distancefromyou") {
            return dfydata
        }
    }

    render(metric, metricsInfo, dfyMetric) {
        return (
            <span>
                {this.renderMetricBoxPrefix(metric)}{this.renderMetrics(metric, metricsInfo, dfyMetric)}
            </span>
        )
    }
}

export default MetricBoxCounter