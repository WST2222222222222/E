/*  Easter Bunny Tracker (track.easterbunny.cc) Global Appearance Switch v6.1.2
    Copyright (C) 2023  track.easterbunny.cc 
    
    track.easterbunny.cc is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    track.easterbunny.cc is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with track.easterbunny.cc.  If not, see <https://www.gnu.org/licenses/>.
*/

/*
    Source code is available at https://gitlab.com/track-easterbunny-cc/tebcc
    License is available at https://track.easterbunny.cc/license
*/

// JS to do the button switch in the infra pages.
// For some great reason this is indented in 4 spaces, rather than 2 in every other file.
// Don't ask why.

// brightness_auto - auto - e1ab
// brightness_4 - dark - e3a9
// brightness_5 - light - e3aa

// Cycle: Auto -> dark -> Light
/* global appearance:writable ls_avail old_browser:writable */

// START ENVIRONMENT VARIABLES
var ptstart_ts = 1650088800
// END ENVIRONMENT VARIABLES

function initButton(style) {

    if (style == "light") {
        $("#appearance_button").html("&#xE3AA;")
    } else if (style == "dark") {
        $("#appearance_button").html("&#xE3A9;")
    } else if (style == "automatic") {
        $("#appearance_button").html("&#xE1AB;")
    }
}

function initLink() {
    var ts = new Date().getTime() / 1000
    if (ts < ptstart_ts) {
        $("#bottom-href").prop("href", "/countdown/")
        $("#bottom-href-2").prop("href", "/countdown/")
    } else if (ts >= ptstart_ts) {
        $("#bottom-href").prop("href", "/")
        $("#bottom-href").prop("href", "/")
    }
}

function styleSwitch() {
    if (appearance == "automatic") {
        $('link[rel="stylesheet"][href="/assets/stylesheets/light.css"]').prop('disabled', true);
        $('link[rel="stylesheet"][href="/assets/stylesheets/dark.css"]').prop('disabled', false);
        $('link[rel="stylesheet"][href="/assets/stylesheets/light-faq.css"]').prop('disabled', true);
        $('link[rel="stylesheet"][href="/assets/stylesheets/dark-faq.css"]').prop('disabled', false);
        if (ls_avail) {
            var local_settings = JSON.parse(localStorage.getItem("settings"))
            local_settings['appearance'] = "dark"
            localStorage.setItem("settings", JSON.stringify(local_settings))
        }
        $("#appearance_button").html("&#xE3A9;")
        appearance = "dark"
    } else if (appearance == "dark") {
        $('link[rel="stylesheet"][href="/assets/stylesheets/light.css"]').prop('disabled', false);
        $('link[rel="stylesheet"][href="/assets/stylesheets/dark.css"]').prop('disabled', true);
        $('link[rel="stylesheet"][href="/assets/stylesheets/light-faq.css"]').prop('disabled', false);
        $('link[rel="stylesheet"][href="/assets/stylesheets/dark-faq.css"]').prop('disabled', true);
        if (ls_avail) {
            var local_settings = JSON.parse(localStorage.getItem("settings"))
            local_settings['appearance'] = "light"
            localStorage.setItem("settings", JSON.stringify(local_settings))
        }
        $("#appearance_button").html("&#xE3AA;")
        appearance = "light"
    } else if (appearance == "light") {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            $('link[rel="stylesheet"][href="/assets/stylesheets/light.css"]').prop('disabled', true);
            $('link[rel="stylesheet"][href="/assets/stylesheets/dark.css"]').prop('disabled', false);
            $('link[rel="stylesheet"][href="/assets/stylesheets/light-faq.css"]').prop('disabled', true);
            $('link[rel="stylesheet"][href="/assets/stylesheets/dark-faq.css"]').prop('disabled', false);
        } else {
            $('link[rel="stylesheet"][href="/assets/stylesheets/light.css"]').prop('disabled', false);
            $('link[rel="stylesheet"][href="/assets/stylesheets/dark.css"]').prop('disabled', true);
            $('link[rel="stylesheet"][href="/assets/stylesheets/light-faq.css"]').prop('disabled', false);
            $('link[rel="stylesheet"][href="/assets/stylesheets/dark-faq.css"]').prop('disabled', true);
        }
        if (ls_avail) {
            var local_settings = JSON.parse(localStorage.getItem("settings"))
            local_settings['appearance'] = "automatic"
            localStorage.setItem("settings", JSON.stringify(local_settings))
        }
        $("#appearance_button").html("&#xE1AB;")
        appearance = "automatic"
    }
}

function vischange_button() {
    if (ls_avail) {
        var local_settings = JSON.parse(localStorage.getItem("settings"))
        var local_appearance = local_settings['appearance']
    } else {
        var local_appearance = "automatic"
    }

    if (local_appearance.match("automatic|light|dark") && local_appearance != appearance) {
        if (local_appearance == "automatic") {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    $('link[rel="stylesheet"][href="/assets/stylesheets/light.css"]').prop('disabled', true);
                    $('link[rel="stylesheet"][href="/assets/stylesheets/dark.css"]').prop('disabled', false);
                    $('link[rel="stylesheet"][href="/assets/stylesheets/light-faq.css"]').prop('disabled', true);
                    $('link[rel="stylesheet"][href="/assets/stylesheets/dark-faq.css"]').prop('disabled', false);
                } else {
                    $('link[rel="stylesheet"][href="/assets/stylesheets/light.css"]').prop('disabled', false);
                    $('link[rel="stylesheet"][href="/assets/stylesheets/dark.css"]').prop('disabled', true);
                    $('link[rel="stylesheet"][href="/assets/stylesheets/light-faq.css"]').prop('disabled', false);
                    $('link[rel="stylesheet"][href="/assets/stylesheets/dark-faq.css"]').prop('disabled', true);
                }

            $("#appearance_button").html("&#xE1AB;")
        } else if (local_appearance == "light") {
            $('link[rel="stylesheet"][href="/assets/stylesheets/light.css"]').prop('disabled', false);
            $('link[rel="stylesheet"][href="/assets/stylesheets/dark.css"]').prop('disabled', true);
            $('link[rel="stylesheet"][href="/assets/stylesheets/light-faq.css"]').prop('disabled', false);
            $('link[rel="stylesheet"][href="/assets/stylesheets/dark-faq.css"]').prop('disabled', true);
            $("#appearance_button").html("&#xE3AA;")
        } else if (local_appearance == "dark") {
            $('link[rel="stylesheet"][href="/assets/stylesheets/light.css"]').prop('disabled', true);
            $('link[rel="stylesheet"][href="/assets/stylesheets/dark.css"]').prop('disabled', false);
            $('link[rel="stylesheet"][href="/assets/stylesheets/light-faq.css"]').prop('disabled', true);
            $('link[rel="stylesheet"][href="/assets/stylesheets/dark-faq.css"]').prop('disabled', false);
            $("#appearance_button").html("&#xE3A9;")
        }
        appearance = local_appearance
        
    }

    var ts = new Date().getTime() / 1000;
    if (ts < ptstart_ts) {
        $("#bottom-href").prop("href", "/countdown/")
        $("#bottom-href").prop("href", "/countdown/")
    } else if (ts >= ptstart_ts) {
        $("#bottom-href").prop("href", "/")
        $("#bottom-href").prop("href", "/")
    }
}