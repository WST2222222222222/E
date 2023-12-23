export default function renderLSUnavailable(lsavail) {
    if (!lsavail) {
        return (
            <>
            <b>Warning: </b>Local Storage is unavailable, settings won't persist. To fix this, enable site storage in your browser settings.
            <hr></hr>
            </>
        )
    } else {
        return (<></>)
    }
}