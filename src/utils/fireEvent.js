function fireEvent(eventName, data) {
    let event = new CustomEvent(eventName, {'detail': data})
    document.dispatchEvent(event)
}

export default fireEvent