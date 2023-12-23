# TEBCC Route Compiler (v3)
This is the series of scripts that does our route compilation.

# Route compilation? What's that?
Yes, the Easter Bunny Tracker uses a route. We do not have satellites orbiting the earth and use whatever I explain in the FAQ. It is just a .json file telling the tracker where the bunny needs to go next.

However, this route lives in Google Sheets so it's much easier for me to edit and work on it. This compiler takes a .tsv output from sheets (.csv has hurt me before so I swear by .tsv) and then converts it into a JSON file the tracker can read.

# Backwards compatibility note
v3 of the route compiler generates routes that are backwards compatibile with v5.5 with one exception - you have to slightly change the weather icon class prefixes so it's `wi wi-{the value in the route}` rather than `wi wi-darksky-` or whatever it was. Just keep that in mind.

# Setup
The compiler requires Python 3.8 or higher with pip.

To setup, run `pip3 install -r requirements.txt`. You will also need to do this with the WeatherKitProvider, do the same command in there as well.

## A note about WeatherKitProvider
WKP is an internal library I built as a lot of my projects had to migrate from Dark Sky to WeatherKit, and this library helps make interacting with WeatherKit easier.

This library is NOT meant to be used in other projects and you really shouldn't use it anyway. It's purely designed for internal use and as such there's almost zero error catching in the library and I don't know what happens when you put it in edge cases. One day I might open-source it, but that day is not here

In short: don't use the WKP library because you will get hurt trying to use it.

# Keys keys keys
The compiler requires a Google Maps Timezone API key, WeatherKit access, and a GeoNames account. GeoNames is free.

With WeatherKit, you'll want to generate an App ID that has access to WeatherKit in both the App and Service ID. You also need to generate a signing key with a .p8 file.

Make sure you put that .p8 file in the base directory of the compiler, and specify necessary options in config.ini.

## Don't want to use WeatherKit?
You don't have to and it's understandable - a dev membership is $99/yr. But you have two options here.

First, you can run the tracker strictly with dry runs which avoids any WKP calls. you'll probably need to modify the WKP so that the __init__ in WKP doesn't read the .p8 file and then you're fine.

Second, you could switch to a different weather provider. Just make sure of a few things:
* You need to be able to cleanly get a weather conditions string
* You need to get a temperature
* You need to somehow translate whatever iconography your weather provider does into some weather icons class.

# The route file
v3 of the compiler depends on v6 of the TEBCC route format. v5 route formats are NOT compatible.

For more information, please read ROUTE.md to get a sense of how routes are structured. There are a lot of rows. If you are too lazy to make a route file, I've included 2023's route file in the repository (`route.tsv`).

Just note that I used custom formulas to get the baskets delivered/carrots eaten and that didn't carry over to the TSV file. Baskets delivered is calculated by multiplying population by like 4.3 (+/- a bit) in addition to an always present baskets value (like 60-80 w/ variation) so stops with super low populations still have some action, then the previous row is summed up so it's VERY hard to go backwards.

Carrots eaten is baskets delivered divided by 125 with some variation (but not too much). too much variation = sometimes the count can go backwards.

# The config file
Most of the operation occurs in `config.ini`. Therefore you need to carefully read what all the sections and options do.

The `config.ini` file has example values that you can use to get started.

## COMPILER section

### starttime
This is the reference time that the compiler uses for when the route actually starts, so make sure this is equal to row 1 of the route. UNIX timestamp.

### actualruntime
If you'd like a run to occur at an offset, set the starttime here. Again, this corresponds to what you want it to be at row 1 of the route. UNIX timestamp.

### basestop_cityname
The name of the first and last stop of tracking. By default, it's `Easter Bunny's Workshop`. Your first and last stop of tracking MUST match this for the tracker to work properly, I couldn't tell you what happens if this is wrong (probably the tracker gets stuck in a bad state).

### override_auto_devstart
Boolean to indicate whether or not if you're running the compiler in CI/CD that the automatic dev start time (for the current day) is overriden or not.

### override_auto_mainstart
Boolean to indicate whether or not if you're running the compiler in CI/CD that the automatic main start time (which is...starttime) is overriden or not.

## WEATHERKIT section
This entire section controls how WeatherKit is used.

### keyfile
The name of the keyfile in the base of the compiler directory. Include the extension as well.

### expiry_time
The amount of time in seconds for how long the auth token expires when the compiler is fired up. 3600 seconds is usually plenty long enough.

### iss
This is your Apple Developer's account Team ID.

### sub
This is the identifier for the App ID that you made earlier for WeatherKit.

### kid
This is your auth key's ID. For example, a file with AuthKey_1234ABCD.p8 would have a kid of `1234ABCD`.

### dryrun
Whether or not you're doing a dryrun of weather data. Because depending on your route any compilation can throw up a ton of WK calls, you can make the compiler not request data and make the weather 70 degrees and clear for ESD with this on.

## TZ section
This entire section controls how TZ fetching is done in the compiler

### use
Whether or not the compiler will use the Google Timezone API to fetch a timezone for any timezone data fields that are not populated.

### force_fetch
Whether or not to forcibly fetch timezone data even if timezone data is present in fields.

### apikey
Self explanatory.

### processingtime
UNIX timestamp for the reference for the timezone data. Should be the start time of the route.

## WIKIPEDIA section
This section controls how Wikipedia is used within the compiler

### use
Whether or not the compiler will automatically fetch Wikipedia descriptions for stops that do not have a Wikipedia description field.

### force_fetch
Whether or not the compiler will fetch Wikipedia descriptions for all stops, including ones that already have a Wikipedia description field filled out.

### cleanup
Whether or not to clean up the data returned from Wikipedia. It is strongly recommended to turn this on as we automatically clean up any reference tags, remove pronunciation (with a 99% success rate), in addition to any random crap we've seen before.

## GEONAMES section
This section controls how GeoNames is used within the compiler (which is used to get locales for each stop).

### use
Whether or not the compiler will automatically fetch GeoNames locale data for stops that do not have a locale field filled out.

### force_fetch
Whether or not the compiler will fetch GeoNames locale data for all stops, including ones that already have a GeoNames locale field filled out.

Note that if you enable this and have a long route with over 1,000 stops that you will run into GeoNames rate limits, so BE CAREFUL enabling this field. More info in the next section.

### username
Your account username for GeoNames.

## TOBCC
This section controls specific controls for our sister site, track.orthodoxbunny.cc

### tobcc_mode
Boolean to control if TOBCC mode is enabled in the compiler. In short, this lowers basket delivered and carrot eaten counts by 5x for TOBCC.

# Using the compiler
First, make sure your route is in a file called `route.tsv` and that this route follows the v6 route spec. You can modify the filename in `compile.py` if you'd like.

Simply run `python3 compile.py`. Checks are automatically done at startup. If you have errors in your data, the compiler will let you know and not compile for you. The compiler checks for errors like fields missing, or the baskets/carrots count going backwards. If you just have warnings in your data, the compiler will also let you know but it'll keep compiling for you. Warnings include things like population year for stops being 0 (which disables population year), very high latitude/longitude variations (which you can expect when you cross 180 degrees longitude because the compiler is dumb)

Give the compiler time. For dryrun routes, compilation takes about a second. When you start enabling online services, compilation runs can take anywhere from 5-20 minutes.

At the end of the process, two files are outputted. `route.json` is the file the tracker will use to read the route, make sure you put that in the right directory (`/static/routes`). `route_compiled.tsv` is a TSV file that, if the compiler needed to request timezone/wikipedia/locale data, includes those fields filled out.

You need to watch out when using GeoNames locale data. GeoNames will rate limit you to 1,000 requests in a time period (i think an hour or so?), so if your route goes past 1,000 rows and needs locales the compiler will fail. Thankfully `route_compiled.tsv` is written to after every row, so if you transplant the locales column from compiled into the route.tsv file then you'll be all good and the next compilation will start where it left off. DONT RENAME IT HOWEVER - as it'll only be partially filled out and then you lose the remaining rows in your route!

This is the case for almost all online services (timezone/wikipedia) assuming force fetch is off - data is only fetched if there's nothing there.

# How the whole thing works
In short:

```commandline
run compile.py -> checks if TSV is valid -> fetches DS/Wikipedia/TZ for each line -> compiles into JSON -> outputs modified TSV for back to Google Sheets
```

The GitLab CI pipeline takes care of uploading to prod/nonprod depending on which branch is used.

# Next steps
I've included the route for 2023 inside this folder that I used. I recommend you use this as a starting point for your route. Additionally - read up on the `ROUTE.md` file, as this describes in detail how the route table needs to be formatted.