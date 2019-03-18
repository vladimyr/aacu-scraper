# aacu-scraper [![build status](https://badgen.net/travis/vladimyr/aacu-scraper/master)](https://travis-ci.com/vladimyr/aacu-scraper) [![github license](https://badgen.net/github/license/vladimyr/aacu-scraper)](https://github.com/vladimyr/aacu-scraper/blob/master/LICENSE) [![js semistandard style](https://badgen.net/badge/code%20style/semistandard/pink)](https://github.com/Flet/semistandard)

>Scrape [AACU member list](https://secure.aacu.org/iMIS/AACUR/Membership/MemberListAACU.aspx) 🎉

## Run
```
$ npx vladimyr/aacu-scraper
```

## Usage
```
aacu-scraper v1.0.0 - Scrape AACU member list

Usage:
  $ aacu-scraper > data.json        # print data to file
  $ aacu-scraper -c 24 > data.json  # set maximum number of concurrent
                                    # http requests

Options:
  -c, --concurrency  Set number of concurrent http requests
  -h, --help         Show help
  -v, --version      Show version number

Homepage:     https://github.com/vladimyr/aacu-scraper
Report issue: https://github.com/vladimyr/aacu-scraper/issues
```


