# TEBCC Environment Variables Documentation
This document describes the environment variables used in the tracker. For any non-sensitive 

# Environment Variable Files
There are four environment variable files to pay attention to.

`env.development.local` - Used for `npm run start`

`env.development` - Used on the dev environment (`nonprod.easterbunny.cc`)

`env.staging` - Used on the staging environment (`staging.easterbunny.cc`)

`env.production` - Used on the production environment (`track.easterbunny.cc`)


# Environment Variables List
Please note that unless explicitly noted, all these environment variables should be present in all files. Not including them could cause the tracker or parts of the tracker to break.

## REACT_APP_GMAPS_API_KEY
The key for the Google Maps API. Ensure that this key has proper permissions to run on the intended environment.

Intended format: `String without end quotes`


## REACT_APP_ROUTE_URL
The URL for the route file. If this URL is incorrect, the tracker will not load.

Intended format: `String without end quotes`

## REACT_APP_VERSION
The version of the tracker. This must include the `v` prefix, the tracker does not automatically append this.

This environment variable must not be present in `env.development`. The compiler will automatically append the version upon compilation to `vYYYYMMDD` in the GitLab CI pipeline.

Intended format: `String without end quotes`

## REACT_APP_COMMIT
The Git commit that the tracker is running on (ideally the 8-character short hash).

This environment variable must not be present in `env.development`, `env.staging`, and `env.production`, as the tracker will automatically append the commit that's being used upon compilation in the CI pipeline. However, you need to manually specify this in `env.development.local`.

Intended format: `String without end quotes`

## REACT_APP_GEO_API_ENDPOINT
The URL for the Geo API. Must include https:// at the start. Trailing slash is optional, but in the code `?key=REACT_APP_GEO_API_KEY` is appended so just be mindful of what you put here.

Intended format: `String without end quotes`

## REACT_APP_GEO_API_KEY
The 32 character API key for the Geo API to be used when making calls to the Geo API.

Intended format: `String without end quotes`

## REACT_APP_DONATE_BANNER_CHANCE
A floating point from 0 to 1 (inclusive) representing the chance that the donate banner will appear when the tracker loads.

For instance, setting this to 0.2 means there is a 20% chance the tracker will show the banner on load.

Intended format: `float`

## REACT_APP_DONATE_BANNER_TIMEOUT
An intenger representing the milliseconds of timeout between when the tracker initially loads and the donation banner will appear to the user.

For instance, setting this to 60000 means a 60 second delay will be applied to showing the donation banner, if the random number generated meets the threshold for showing the banner.

Intended format: `int`

## REACT_APP_DONATE_BANNER_BYPASS
Bypass checks to see if the banner has already been displayed (from local storage) and rather runs the RNG to see if the banner should appear every time the tracker is loaded.

This should be false in production. You can probably not include this in most environment variables and the tracker should ignore the undefined value, but this is untested.

Intended format: `JavaScript style boolean (true/false)`

## REACT_APP_REDIRECT_TO_PROD
TBD

## REACT_APP_PROD_URL
TBD

## REACT_APP_SHOW_GIT_COMMIT
TBD