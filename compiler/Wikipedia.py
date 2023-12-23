import requests
import errno
import signal
from functools import wraps
import os
import regex as re


# Base class for Wikipedia compilation

def timeout(seconds=10, error_message=os.strerror(errno.ETIME)):
    def decorator(func):
        def _handle_timeout(signum, frame):
            raise TimeoutError(error_message)

        def wrapper(*args, **kwargs):
            signal.signal(signal.SIGALRM, _handle_timeout)
            signal.setitimer(signal.ITIMER_REAL, seconds)  # used timer instead of alarm
            try:
                result = func(*args, **kwargs)
            finally:
                signal.alarm(0)
            return result

        return wraps(func)(wrapper)

    return decorator


class Wikipedia:
    def __init__(self, regex_timeout=1, fetch_timeout=10, sentences=4):
        self.regex_timeout = regex_timeout
        self.fetch_timeout = fetch_timeout
        self.sentences = sentences

        self.replacelist = [" (listen)", " [note 1]", " [note 2]", " [note 3]", " [note 4]",
                       " [note 5]", " [note 6]", " [note 7]", " [note 8]", " [note 9]",
                       " [note 10]", "[note 1]", "[note 2]", "[note 3]", "[note 4]",
                       "[note 5]", "[note 6]", "[note 7]", "[note 8]", "[note 9]", "[note 10]",
                       "[Note 1]", "[Note 2]", "[Note 3]", "[1]", "[2]", "[3]", "[4]", "[5]",
                       "[6]", "[7]", "[8]", "[9]", "[10]", "[11]", "[12]", "[13]", "[14]",
                       "[15]", "[16]", "[17]", "[18]", "[19]", "[20]", "[21]", "[22]", "[23]",
                       "[24]", "[25]", "[26]", "[27]", "[28]", "[29]", "[30]", "[a]", "[b]",
                       "[c]", "[d]", "[e]", "[f]", "[g]", "[h]", "[i]", "[j]", "[k]", "[l]",
                       "[m]", "[n]", "[o]", "[p]", "[q]", "[r]", "[s]", "[t]", "[u]", "[v]",
                       "[w]", "[x]", "[y]", "[z]", "[citation needed]", "listen"]

    def fetch(self, title):
        r = requests.get(
            f"https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles={title}&formatversion=2&exsentences={self.sentences}&exlimit=1&exintro=1&explaintext=1")
        r_json = r.json()
        try:
            return r_json['query']['pages'][0]['extract']
        except KeyError:
            print("Failed to query Wikipedia for this title.")
            return ""

    @timeout(2)
    def regex_parse(self, description):
        '''
        Specialized Regex parsing method due to the slim chances of regex timeouts
        :param description: Wikipedia description
        :return: (hopefully) regex'd filtered description
        '''
        regex_lookfor = [":", ";", "[", "]", "listen", "pronounced", "pronunciation", "( ", "ə"]
        try:
            matches = re.findall('\((?<=\()(?:[^()]*|\([^)]*\))*\)', description, timeout=1)
            try:
                for match in matches:
                    for lookfor in regex_lookfor:
                        if match.find(lookfor) != -1:
                            description = description.replace(match, "")
                            break
            except TypeError:
                print("Error with regex matches.")
        except TimeoutError:
            print("Regex failure for this city.")

        return description

    def general_parse(self, description):
        '''
        General get rid of crud in Wikipedia descriptions to make it look nicer method
        :param description: Wikipedia description
        :return: Filtered description
        '''
        # At some point we should have a dictionary that lists the key then value, then just start inline replacing it in a loop
        description = description.replace("\n", "")
        description = description.replace("(listen)", "listen")
        description = re.sub(r"([.])([A-Z])", r"\1 \2", description)
        description = description.replace("listen", "")
        description = description.replace("U. S.", "U.S.")
        description = description.replace("D. C.", "D.C.")
        description = description.replace("A. C.", "A.C.")
        description = description.replace("  ", " ")
        description = description.replace(" , ", ", ")
        description = description.replace(" . ", ". ")
        description = description.replace(" ", "")
        description = description.replace("()", "")
        description = description.replace("( )", "")
        description = description.replace(" .", ".")
        description = description.replace("  ", " ")
        description = description.replace(" ,", ",")
        description = description.replace("( ", "(")
        description = description.replace("(,", "(")

        for item in self.replacelist:
            description = description.replace(item, "")

        description = description.replace("km2", "km²")
        description = description.replace("km^2", "km²")
        description = description.replace("mi2", "mi²")
        description = description.replace("mi^2", "mi²")
        description = description.replace("square miles", "mi²")
        description = description.replace("square kilometers", "km²")
        description = description.replace("square kilometres", "km²")
        description = description.replace("sq mi", "mi²")

        if description.endswith(".") is False:
            description = description + "."
        description = description.replace(". .", ".")
        description = description.replace(" , ", ", ")
        description = description.replace("  ", " ")
        description = description.replace(" .", ".")
        if description == ".":
            description = ""

        description = description.replace("..", ".")
        return description
