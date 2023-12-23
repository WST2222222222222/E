# TEBCC Events Document
track.easterbunny.cc v6 is largely an event-based tracker where individual components need to listen for events in order to do something.

This is not the right way to code React but we need more precise control than a simple setState can give us so DOM events let us achieve that.

# Data Manager Events
This is where you're going to find most of the business logic for how the tracker actually handles the route.

## routeStateChange
Fires when the route state has changed.

Data: 
```
{
    state: (the state of the route), 
    ts: (the working UNIX timestamp used to determine this state change)
}
```

## dataMgrScaffolded
Fires when the data manager has completed the scaffolding process (route fetched & processed nicely)

This WILL NOT fire if there was an error during fetch/processing.

Data: none

## stopDeparture
Fires when the Easter Bunny is departing a stop and the next stop state is switching back to `0`. This will always fire (even when tabbed back in after the tracker is suspended) for each stop, but won't fire to "catch up" with previous stops when the tracker is loaded during tracking.

Data: 
```
{
    id: (the ID of the now last stop), 
    ts: (the watchdog TS being used when this event was sent)
}
```

## stopArrival
Fires when the Easter Bunny is arriving at a stop. It's important to note that this only fires when the tracker is alive and goes from en-route -> arrived, or that when a catch-up happens that the current stop happens to be in the arrived state.

Data: 
```
{
    id: (the ID of the stop that is being arrived at), 
    ts: (the watchdog TS being used when this event was sent)
}
```

## regularUpdate
A general purpose update that is synced to the metric update rate as determined by the settings manager.

Data: 
```
{
    ts: (the watchdog TS being used when this event was sent)
}
```

## mapUpdate
A separate update just for the map that runs at a slower rate compared to the regular update, and is generally intended for updates to the map marker (and as a result, any components that have updates linked to it).

Data: 
```
{
    ts: (the watchdog TS being used when this event was sent)
}
```

## scafProgressUpdate
An event indicating a progress update in the loading of the route.

Data: 
```
{
    loadProgress: (percentage of load progress from 0-100)
}
```

## scafFailed
An event indicating that the scaffolding has failed. This can only be fired when the tracker is in the scaffolding stage.

Data: 
```
{
    message: (the message indicating the scaffold has failed, to be reported on the error screen)
}
```

## bulkStopUpdate
An event indicating that 2 or more stops have been departed from. This is mainly used for MapBase so that it can handle putting basket icons on the map without the need to listen for a ton of stop departure events.

As an example. let's presume the tracker was at a state where last stop ID was 89, next stop ID was 90. Then, the tracker is suspended or something and we skip ahead to a point where the last stop ID is 99 and the next stop ID is 100.

ID 90 gets a normal stopDeparture fire.
We bulkStopUpdate from 91-99 (start 91, end 99)
Now the last stop ID is 99, next stop 100. Doesn't matter if we're en-route to 100 or arrived at 100.

Data:
```
{
    start: (the starting ID of the bulk update),
    end: (the ending ID of the bulk update)
}
```

Note that under normal tracker operation where it's alive for the entire time, this event will not be fired. Even still, if we have to catch up by one stop only (say LSI/NSI was 89/90 and now LSI/NSI is 90/91), this event won't fire. It only happens when 2+ stops have to be caught up.

# Settings Manager Events

## settingChanged
Fires when a setting has been changed. Good to listen for if your component needs to do something when something happens.

Data: 
```
{
    setting: (the key value), 
    value: (the value of the setting)
}
```

## appearanceChanged
Fires when a user has made a change to the appearance setting, OR prefers-color-scheme has changed and the user has the appearance set to automatic.

This can and probably will fire unnecessarily when a user changes their appearance setting from say, automatic (but in light mode) to light and vice versa, so keep this in mind.

Listen in if your component has to make changes in appearance outside of the normal realm of top-level CSS.

Data: 
```
{
    color: (the color of the appearance, either light or dark)
}
```

## centeredStateChanged
Fires when the state of the Easter Bunny being uncentered/recentered on the map has changed.

Data: 
```
{
    state: (true/false indicating if the map is centered/uncentered on the EB)
}
```

## unitsChanged
Fires when the units setting has changed.

Similar to appearanceChanged this will probably fire unnecessarily sometimes, e.g. when a user changes their units from automatic (but imperial) to imperial and vice versa.

Listen in if your component has to change depending on what the current unit selection is.

Data: 
```
{
    units: (the actual unit selection, either imperial or metric)
}
```

## v5repop
For debugging purposes, if you'd like to put v5 settings into local storage for testing migration, fire off this event. A console.log message will appear confirming that v5 settings were set.

No data with this event - it is meant to be fired by devs.

# Alert Box Events

## alertShow
Fire when you want to show an alert globally in the tracker at z-index 6. Pass in this data to customize the message.

Data: 
```
{
    message: (The message for the alert), 
    timeout: (How long in seconds the alert should be visible for), 
    severity: (the severity of the alert - possible values are success and danger), 
    nonblocking: (whether or not to pop ahead of the current alert (false) or if an alert is up, don't display this alert (true))
}
```

# Map Events

## esdLaunch
Fires when the user has requested an esdLaunch. In the MapBase, it's tuned so that on `esdLaunch`, it pans to the stop that's being requested for an ESD Launch.

Data: 
```
{
    index: (the ID of the stop to be launched in ESD)
}
```

## esdLaunch_tap
Fires when the user has requested an esdLaunch in the context of tapping on a basket icon on the map. In the MapBase, it's tuned so that on `esdLaunch_tap`, it doesn't pan to the stop that's being requested for an ESD launch.

Data: 
```
{
    index: (the ID of the stop to be launched in ESD)
}
```

# fireEvent API
There is a custom function at `utils/fireEvent.js` that allows you to easily fire events in the tracker. The API for the function is as follows:

```
fireEvent(eventName: str, data: dict)
```

The eventName is any of the event names listed above and is case sensitive. The data is just a standard JavaScript dictionary, with all the data values filled in.