import { DateTime } from "luxon"

let timeformat_info = DateTime.DATETIME_FULL
let timeformat_esd = {...DateTime.DATE_FULL, ...DateTime.TIME_SIMPLE, timeZoneName: 'short'}
let timeformat_esd_precision = {...DateTime.DATE_FULL, ...DateTime.TIME_WITH_SECONDS, timeZoneName: "short"}
let timeformat_esd_local = {...DateTime.DATE_FULL, ...DateTime.TIME_SIMPLE}
let timeformat_esd_local_precision = {...DateTime.DATE_FULL, ...DateTime.TIME_WITH_SECONDS}

let filtering_strings = ["GMT+", "GMT-", "UTC+", "UTC-"]

// MAKE SURE BEFORE & AFTER ARE 0 IF YOU WANT ONE TIME FORMATTED.
export default function timeFormat(before, time, after, context, tzcontext, tzlocale, settingsMgr) {
    let workingformat = timeformat_info;

    if (context === "info") {
        workingformat = timeformat_info
    } else if (context === "esd" || context === "esd_local" || context === "marker") {
        if (before % 60 !== 0 || time % 60 !== 0 || after % 60 !== 0) {
            if (context === "esd_local") {
                workingformat = timeformat_esd_local_precision
            } else {
                workingformat = timeformat_esd_precision
            }
        } else {
            if (context === "esd_local") {
                workingformat = timeformat_esd_local
            } else {
                workingformat = timeformat_esd
            }
        }
    }


    let timestr;

    if (tzcontext !== undefined) {
        // For now we can assume the tzcontext is just for ESD
        timestr = DateTime.fromSeconds(time, {zone: tzcontext}).toLocaleString({...workingformat, "hourCycle": settingsMgr.get_actual_clockstyle()}) + " " + DateTime.fromSeconds(time, {zone: tzcontext}).setLocale(tzlocale).toFormat("ZZZZ")
    } else {
        timestr = DateTime.fromSeconds(time).toLocaleString({...workingformat, "hourCycle": settingsMgr.get_actual_clockstyle()})
    }

    // If browsers return -3, -7, etc for an offset, this won't work. But we won't query for that.
    // We also ignore straight GMT (because some places really have GMT for their timezone). Rather we look for GMT+/GMT-.
    if (context !== "esd_local") {
        for (let filter_string of filtering_strings) {
            if (timestr.includes(filter_string)) {
                let splitted = timestr.split(filter_string)
                return splitted[0].substring(0, splitted[0].length - 1)
            }
        }
    }
    return timestr
}