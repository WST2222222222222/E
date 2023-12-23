# TEBCC v6 GitLab CI Pipeline Documentation
This document describes how the GitLab CI pipelines work for TEBCC v6, including variables used to run them.

# What is the GitLab CI pipeline?
TEBCC v6's source code is hosted on GitLab, and CI pipelines are an easy way to distribute the code when pushing to GitLab.

# Before you run CI pipelines
I've intentionally made it such that the gitlab-ci file doesn't have the right name. You'll want to rename it to `.gitlab-ci.yml`.

I did this so it would avoid triggering pipelines.

# Note!
In the final LFTP step of most deploys - you'll see a directory called `/builds/tebcc/repo-name`. This is where gitlab stores the code on the runners. You'll have to adjust whatever comes after `/builds/` to the path of your repository.

# The Five Stages
The five stages of the pipeline are:
* Check for MaxMind updates (prod only)
* Compile the route
* Build the website
* Deploy the website to the server
* Post deploy (which triggers a pipeline in the Twitter Bot)

## Route Compile
In short, this stage runs the compile script, however, a few adjustments are made.

First, the `tzdata` package is installed. Then, the local time is set to America/New_York for timezone related purposes (this is mostly for figuring out when to do a day's dry run and isn't necessary for prod runs), before reconfiguring dpkg.

This is the only way I could figure out how to get changing the timezone to work.

If you want to skip compilation, you can put `skip compile` somewhere in your commit message and this stage is skipped.

## MaxMind Check Update (prod only)
This stage runs a quick script in the maxmind folder called update.py. It checks the database date on the Geo API and MaxMind's servers and sees if we need to update it. If this is the case, the file is downloaded.

## MaxMind Upload (prod only)
This stage runs if we hav an outdated maxmind file on the server and basically just uploads it.

## Build Development/Staging/Prod
Basically runs add git/npm install/npm run build. I coded the package script such that you can run build:development, build:staging, build:production to get the different env files.

You can skip building by appending `skip build` to a commit message.

## Deploy Development/Staging/Prod
Uploads all the files from the compile and build stages to the server. Dev/Staging pipelines are identical. Prod only has an upload to an uncached endpoint for the twitter bot that doesn't sit behind CloudFlare.

## Post Deploy (prod only)
This stage runs on prod runs to trigger the deployment in the Twitter Bot repository, which in turn fetches the latest route for the tracker.

# GitLab CI variables
These are the variables you need to configure to make the pipelines run successfully.

When making these variables in GitLab settings, you can use the default values (unless otherwise noted)

You will find through these variables that security for these pipelines are awful, and you are more than welcome to try and improve it.

## GEOAPI_PATH
The path to the Geo API folder on the remote server to deploy to. The path must have a trailing right slash at the end.

## HOST
The remote host for where to send the files to.

## PASSWORD
The password for a user that has access to the folder(s) that TEBCC is getting deployed to (since SFTP uploading is used to get the files up to the remote server).

## USERNAME
The username of the remote user that has access to the folder(s) that TEBCC is getting deployed to.

## SERVER_PATH
The path of where to deploy the TEBCC files to, with a trailing right slash at the end.

You must have three of these variables - each scoped to the production, staging, and nonprod environments in GitLab (you'll need to make these environments in the environments tab of GL).

## SERVER_PORT
The SSH port of the remote server.

## SSH_PRIVATE_KEY
A SSH private key that can be used to login to the remote server. Secure, right!

## UNCACHED_ROUTE
The path to where the route should be stored in its uncached endpoint (to something that isn't behind cloudflare).

This can be a directory inside of the TEBCC deployment folder if you're going that route. Personally for TEBCC prod, it's in a different vhost folder that I don't proxy behind Cloudflare.
