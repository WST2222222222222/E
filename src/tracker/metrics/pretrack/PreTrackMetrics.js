import { MDBCard, MDBCardBody, MDBCardText, MDBCardTitle } from "mdb-react-ui-kit"
import React from "react"
import PreTrackCounter from "./PreTrackCounter"

class PreTrackMetrics extends React.Component {
    constructor (props) {
        super(props);
        this.dataMgr = props.dataMgr;
        this.settingsMgr = props.settingsMgr;
        this.geoMetrics = props.geoMetrics;
        this.metricOrder = ["baskets", "carrots", "distance", "speed", "distancefromyou"]
        this.metricOrderByName = {
            "baskets": 0,
            "carrots": 1,
            "distance": 2,
            "speed": 3,
            "distancefromyou": 4
        }
        this.metricButtonTitleById = {
            0: {
                "left": "Click to change the metric shown to Distance from you",
                "right": "Click to change the metric shown to Carrots eaten"
            },
            1: {
                "left": "Click to change the metric shown to Baskets delivered",
                "right": `Click to change the metric shown to Distance ${this.settingsMgr.traveled_ls === 1 ? "traveled" : "travelled"}`
            },
            2: {
                "left": "Click to change the metric shown to Carrots eaten",
                "right": `Click to change the metric shown to Speed`
            },
            3: {
                "left": `Click to change the metric shown to Distance ${this.settingsMgr.traveled_ls === 1 ? "traveled" : "travelled"}`,
                "right": "Click to change the metric shown to Distance from you"
            },
            4: {
                "left": `Click to change the metric shown to Speed`,
                "right": "Click to change the metric shown to Baskets delivered"
            }
        }
        this.state = {
            metricVisible: this.settingsMgr.settings.thirdBox,
            metricVisibleId: this.metricOrderByName[this.settingsMgr.settings.thirdBox],
            metricsInfo: this.dataMgr.getMetrics(new Date().getTime() / 1000),
            dfyMetric: this.geoMetrics.render_distancefromyou(new Date().getTime() / 1000)
        }
        this.mbc = new PreTrackCounter({settingsMgr: this.settingsMgr, context: "notmm"})
    }

    renderBoxTitle() {
        if (this.state.metricVisible === "baskets") {
            return "Gifts Delivered"
        } else if (this.state.metricVisible === "carrots") {
            return "Cookies Eaten"
        } else if (this.state.metricVisible === "distance") {
            return this.settingsMgr.traveled_ls === 1 ? "Distance traveled" : "Distance travelled"
        } else if (this.state.metricVisible === "speed") {
            return "Speed"
        } else if (this.state.metricVisible === "distancefromyou") {
            return "Distance from you"
        }
    }

    renderBoxImage() {
        if (this.state.metricVisible === "baskets") {
            return <img src="https://www.santatracker.live/icons/present.png" className="MetricIcon"/>
        } else if (this.state.metricVisible === "carrots") {
            return <img src="https://www.santatracker.live/icons/cookies.png" className="MetricIcon"/>
        } else if (this.state.metricVisible === "distance") {
            return <img src="https://www.santatracker.live/icons/stops.png" className="MetricIcon"/>
        } else if (this.state.metricVisible === "speed") {
            return <img src="https://www.santatracker.live/icons/speed.png" className="MetricIcon"/>
        } else if (this.state.metricVisible === "distancefromyou") {
            return <img src="https://www.santatracker.live/icons/stops.png" className="MetricIcon"/>
        }
    }

    changeVisibleMetric(way) {
        let temp_metricVisibleId = this.state.metricVisibleId + way
        if (temp_metricVisibleId >= this.metricOrder.length) {
            temp_metricVisibleId = 0
        } else if (temp_metricVisibleId <= -1) {
            temp_metricVisibleId = 4
        }

        this.settingsMgr.set("thirdBox", this.metricOrder[temp_metricVisibleId])
    }

    onSettingChange(e) {
        if (e.detail.setting === "thirdBox") {
            this.setState({metricVisible: this.settingsMgr.settings.thirdBox, metricVisibleId: this.metricOrderByName[this.settingsMgr.settings.thirdBox]})
        }
    }

    onRegularUpdate(e) {
        this.setState({workingTs: e.detail.ts, metricsInfo: this.dataMgr.getMetrics(e.detail.ts)})
    }

    onMapUpdate(e) {
        let workingTs = e.detail.ts
        let positiondata = this.dataMgr.getSantaPosition(workingTs)
        this.setState({dfyMetric: this.geoMetrics.render_distancefromyou(positiondata)})
    }

    componentDidMount() {
        document.addEventListener("regularUpdate", this.onRegularUpdate.bind(this))
        document.addEventListener("stopArrival", this.onRegularUpdate.bind(this))
        document.addEventListener("stopArrival", this.onMapUpdate.bind(this))
        document.addEventListener("stopDeparture", this.onRegularUpdate.bind(this))
        document.addEventListener("stopDeparture", this.onMapUpdate.bind(this))
        document.addEventListener("settingChanged", this.onSettingChange.bind(this))
        document.addEventListener("mapUpdate", this.onMapUpdate.bind(this))
    }

    componentWillUnmount() {
        document.removeEventListener("regularUpdate", this.onRegularUpdate.bind(this))
        document.removeEventListener("stopArrival", this.onRegularUpdate.bind(this))
        document.removeEventListener("stopArrival", this.onMapUpdate.bind(this))
        document.removeEventListener("stopDeparture", this.onRegularUpdate.bind(this))
        document.removeEventListener("stopDeparture", this.onMapUpdate.bind(this))
        document.removeEventListener("settingChanged", this.onSettingChange.bind(this))
        document.removeEventListener("mapUpdate", this.onMapUpdate.bind(this))
    }

    render() {
        return (
            <>
            {/* <MDBCard className='shadow-3' style={{ pointerEvents: "auto" }}>
                <MDBCardBody>
                    <MDBCardTitle>
                        {this.renderBoxTitle()}
                        <div style={{ float: "right", display: "inline"}}>
                            <MDBBtn className='metricNav-left' color='secondary' onClick={() => {this.changeVisibleMetric(-1)}} title={this.metricButtonTitleById[this.state.metricVisibleId]['left']}>
                                <KeyboardArrowLeft fontSize="small"></KeyboardArrowLeft>
                            </MDBBtn>
                            <MDBBtn className='metricNav-right' color='secondary' onClick={() => {this.changeVisibleMetric(1)}} title={this.metricButtonTitleById[this.state.metricVisibleId]['right']}>
                                <KeyboardArrowRight fontSize="small"></KeyboardArrowRight>
                            </MDBBtn>
                        </div>
                    </MDBCardTitle>
                    <MDBCardText>
                        {this.mbc.render(this.state.metricVisible, this.state.metricsInfo, this.state.dfyMetric)}
                    </MDBCardText>
                </MDBCardBody>
            </MDBCard> */}
            {/* <div className="MetricBox">
                <div className="MetricTitle">
                    {this.renderBoxTitle()}
                </div>
                <div className="MetricStats">
                    {this.mbc.render(this.state.metricVisible, this.state.metricsInfo, this.state.dfyMetric)}
                </div>
            </div> */}
            {/* <div className="MBox">
                    <div className="Mbox1">
                        <h3 className="Text">{this.renderBoxTitle()}</h3>
                    </div>
            </div>
                <div className="Stop">
                {this.mbc.render(this.state.metricVisible, this.state.metricsInfo, this.state.dfyMetric)}
                </div> */}
                <div className="MBox">
                    <div className="MBoxTitle" style={{ pointerEvents: "auto" }}>
                    <button id="MetricButton" className='metricNav-left' color='secondary' onClick={() => {this.changeVisibleMetric(-1)}} title={this.metricButtonTitleById[this.state.metricVisibleId]['left']}>
                        left
                    </button>
                    <h3 className="Text">{this.renderBoxTitle()}</h3>
                    <button id="MetricButton" className="metricNav-right" onClick={() => {this.changeVisibleMetric(1)}} title={this.metricButtonTitleById[this.state.metricVisibleId]['right']}>
                        right
                    </button>
                    </div>
                        
                    <div className="MboxStats">
                        {this.renderBoxImage()}
                        <div className="MBoxStatName">
                            {this.mbc.render(this.state.metricVisible, this.state.metricsInfo, this.state.dfyMetric)}
                        </div>
                        
                    </div>
                </div>
            </>
        )
    }


}

export default PreTrackMetrics