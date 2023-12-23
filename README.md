# STL v1, TEBCC v6
This is the codebase for santatracker.live v1, based off of track.easterbunny.cc Version 6.

# Heads up!
This codebase is the same as used in production, except our icons and music that we hold rights to have been removed. Everything else is as is.

# PLEASE READ THIS SECTION.
TEBCC is a complex tracker with a lot of moving parts. While Version 6 is MUCH better compared to v5.x code, it's still complex and has a lot of moving parts. You NEED to have a solid understanding of JavaScript, React, and Python in addition to general software engineering knowledge to get TEBCC to work properly.

If you're reading these docs to try and get a TEBCC copy up in 20 minutes, **THIS WILL NOT HAPPEN**. These docs **WILL NOT** hold your hand and tell you step-by-step how to make the tracker work. There will be instructions that say you need a key from this service. You NEED to be familiar with these services to know what I'm talking about.

There are a lot of tools and techniques that you'll need to learn about when working with the codebase. I have tried to describe these processes as much as possible in the docs, however, they are not comprehensive.

This is not meant to gatekeep from people trying to start their own tracker, it's just that TEBCC is not a simple project and it really isn't designed to bootstrap itself.

Additionally, I accidentally put in the 2024 shutdown notice into the OSS repo (the code is pretty up-to-date), so if you can remove this shutdown notice from the tracker, then you can definitely work with the codebase.

# What you'll need to get started
Here's a non-comprehensive list of what you'll need to get going:
* Apple developer account with WeatherKit API access
    * For the compiler (more instructions are there), you'll need App ID information, your .p8 cert, key id, etc etc.
* GeoNames account
* Google Maps API key with access to the following APIs
    * Google Maps JS API v3
    * Google Timezone API
* node.js 18 & a recent version of npm on your system
* Python 3.8 or higher with pip installed
* A GitLab server for automatic deployments
* Somewhere to host the tracker. In our stack, the web server is just an Ubuntu VPS running Apache2. TEBCC spits itself out technically as a static site. You can theoretically run TEBCC v6 on GitHub pages if you are crazy enough to do it.

## TEBCC Environments
TEBCC comes with three environments you can use - nonprod (dev), staging, and production.

nonprod (dev) is used for daily route runs with dry weather data. You should use this environment as using `npm run start` will 

# Directory Map
Before starting you should familiarize yourself with how the tracker is laid out.

```
/public -- Public HTML that goes on the server. A lot of the structuring here is files taken from v5.6, and is basically legacy code until I migrate the supporting pages over to react. Couple important files to know about though.
    index.html - Root of the tracker DOM. This includes some extra code to check for browser incompatibility without the need for React, also specifies all the meta tags and such.
    manifest.json - Manifest for browsers to install the tracker as an "app" on a device (note that TEBCC is not a PWA and doesn't have a service worker)
/src -- Main React directry
    /images -- Icons
    /SettingsManager -- Where the global settings manager lives. The settings manager is mostly in control of dealing with settings and usually gets passed down to every single class, also does auto dark mode switching too.
    /tracker -- Where the tracker frontend lives (map, tracker boxes, pre-tracker boxes). Intended to be this way for when we eventually move to all pages in React
        /alerts - Where the code for the bottom left alert box lives
            AlertBox.js - Main class for the alert box
            Alerts.css - CSS needed for the alert box
        /buttons - Where the buttons live
            /settings - Where individual settings panes live
            Buttons.css - CSS file for buttons
            ButtonsBase.js - Base file for the buttons
            DonateButton/InfoButton/SettingsButton/UncenterButton.js - Base classes for each button
        /countdown - Where the countdown lives
        /map - All code related to the map + ESD (extended stop data)
            ESD.js - Base code for the ESD modal
            ESD.css - CSS for the ESD modal
            Map.css - Any CSS needed for the map, mostly this is for Chrome Map fix
            MapBase.js - This class runs the entire show with the map.
        /metrics - All code related to the top boxes that display metrics
            /pretrack - All code related to pre-tracking metrics
            GeoMetrics.js - Class used to deal with the Geo API, also has code to update the estimated arrival time & distance from you meric.
            LastStopMetric.js - Class for the last stop metric
            MetricBoxBase.js - The base class for the metrics box (with arrows)
            MetricBoxCounter.js - Separated code for the actual metric counter because it's used in both the next stop and metrics box. This is not a react class, you are meant to call its render function inside a higher level class, take that output & put it in the DOM.
            Metrics.css - Any CSS related to metrics.
            MetricsBase.js - The top level base class that is used in TrackerBase for rendering the metrics.
            NextStopMetric.js - Class for the next stop metric. Needs to inherit GeoMetrics to work properly.
        DataManager.js - Global data manager for parsing the JSON file. Also usually gets passed down to every class and does work with the bootstrapping of the tracker.
        DonateBanner.js - Class that controls how the donation banner shows up in the tracker
        TrackerBase.js - Base file where the tracker is loaded in from. Also deals with some scaffolding/bootstraping to get the tracker loaded in.
    /utils - Any utility methods used across the tracker
    App.js - Main entry point for the tracker (eventually will be the router)
    App.css - Any high level CSS in the tracker
    dark.css - Specific dark mode CSS for the tracker. Dark mode is controlled by appending data-dark="true" to the body tag.
    index.js/css - Mostly CRA-bootstrapped files, index.css has some top-level CSS used across the tracker
/compiler -- Main directory for the compiler
    /WeatherKitProvider - WKP is a custom library I made that wraps Apple's WeatherKit API 
    compile.py - Base script called by the compiler function
    Compiler.py - High level compiler class that does validation/compilation
    config.ini - Holds the API keys for Dark Sky/Google Maps API plus configuration for when the route starts, base stop, etc
    constants.py - Constants for the compiler
    DarkSkyProvider.py - Wraps Dark Sky APIs (deprecated)
    TEBCCWeatherKitProvider.py - Wraps the internal WeatherKitProvider library that we use
    TZData.py - Wraps the Google Maps API's Timezone method
    Wikipedia.py - Wraps Wikipedia description fetching w/ filtering methods
/maxmind -- Folder for a little fun script.
    update.py - Script to check if we need an update to MaxMind's API, designed to be used in the GitLab CI pipelines.
/ -- Base directory. There's some important files in here to be aware of.
    .env.development - Environment varibles for development. Do not append REACT_APP_VERSION and REACT_APP_COMMIT, the compiler fills this in.
    .env.development.local - Env variables for local development.
    .env.production & .env.staging - Env variables for prod & stg. Do not append REACT_APP_COMMIT, the compiler fills this in.
    .gitlab-ci.yml - The configuration file for the CI pipelines.
    package.json - NPM package. Update the version number whenever there's a new release.
```

# Setting up the tracker
There's a couple steps to get going. Again, this is non-comprehensive.

* Run `npm install` in the base directory to get things up and running.
* Run `pip3 install -r requirements.txt` in the compiler directory AND the WeatherKitProvider directory.
* Set up the compiler following the instructions in its specific README
* Set up the environment variables in the tracker (.env.development.local and all other files) by putting in your Google Maps API key

# Build & serve the tracker
If you are serving locally, run `npm run start` to make the tracker run locally. Please note that this will cause some timeouts to spawn twice so the tracker will run twice as fast as a static version.

If you're serving non-locally, generally speaking these are the steps you have to follow:
* Run `python3 compile.py` to get a `route.json` file. Routes go at `/static/routes/`.
* Run `npm run build` to build the tracker. Builds take about a minute or two.
    * By default this command builds for a prod tracker. If you want to build for a dev/staging version of the tracker, run `npm run build:<env>`. All applicable commands are in `package.json`.
* In the build folder, make sure `route.json` is in `/static/routes/route.json`
* Upload the build/ directory anywhere that can serve static files
* You should be able to access the tracker.

You will likely encounter CORS issues with the Geo API failing to load (which in turn disables arrival estimates if you're not using precise location). You will have to set up your own instance of the Geo API, and instructions can be found in that repository.

## Note about local environments and environments in general
Running `npm run start` doesn't exactly emulate how the tracker actually works in prod. This is because React for some ungodly reason decides to scaffold everything twice, which means twice the event listeners are running. I have tried to fix this issue and I can't.
s
Make sure you do final testing in a static build.

Additionally TEBCC has 3 environments - nonprod (dev), staging, and prod.

By default, when deploying to dev, the compiler makes a dry run route for the current day. staging is basically a wet-rehersal for prod, including a full route generation with weather. prod is prod.se

I highly recommend you use all three environments to ensure anything going to production is ready to use.

# Further reading
At this point, you should read the README in the compiler directory so you know how to set it up, in addition to details on the v6 route format and how to set it up.

You can also read `ENV_VARS.md` to see how the environment variables work in the tracker.

Lastly, because TEBCC v6 communicates with components via DOM events, you definitely should read `EVENTS.md` to learn about how the tracker controls itself with events.

Also familiarize yourself with the codebase. This README doc is the tip of the iceberg and I cannot cleanly document how the entire tracker works from start to finish. I hope the code is readable enough that it's self-explanatory what's going on.

# Additional repositories
There's two other repositories to take a peek at - the Geo API (which powers arrival time estimations, reverse geocoding, and the insights system), along with the Twitter Bot repository (for automatic tweets).fd

These repositories are all under the track.easterbunny.cc group on GitLab.

# License
track.easterbunny.cc Version 6, the route compiler, and the included WeatherKitProvider library are licensed under the GNU GPL v3 license. This is a strong copyleft license that, if you so choose to distribute your modified copy of the tracker, makes it such that you must distribute the source code with it. This ensures that the TEBCC codebase, and any improvements made to it, are kept open-source forever.

I have downgraded TEBCC from AGPL to GPL as TEBCC is technically not a networked application (such as the Geo API), and you receive a copy of the source code when it is run inside your browser, meaning the GPL license applies.

## Why not LGPL?
I debated making the tracker LGPL so folks could incorporate it into a proprietary website and not have to deal with open-sourcing the rest of their website (as is required under the GPL license). However, the entire codebase is basically a turnkey tracker if you set it up correctly, and I thought GPL could provide the necessary protections for the tracker to remain in an open-source format.