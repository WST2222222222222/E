export default function renderGeoAPIUnavailable(errorState) {
    if (errorState === 1) {
        return (
            <>
            <b>Warning: </b>Failed to query the Geo API. Unless precise location is enabled, Santa's arrival time and distance from you metric are unavailable.
            <hr></hr>
            </>
        )
    } else {
        return (<></>)
    }
}