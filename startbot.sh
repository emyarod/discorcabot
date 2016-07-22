#!/bin/bash
# 
# shoutouts to https://gist.github.com/JamieMason/4761049
# check for dependencies, build, then run discorcabot

# check for global command line program
function program_is_installed {
  # set to 1 initially
  local return_=1
  # set to 0 if not found
  type $1 >/dev/null 2>&1 || { local return_=0; }
  # return value
  echo "$return_"
}

# check for local npm package
function npm_package_is_installed {
  # set to 1 initially
  local return_=1
  # set to 0 if not found
  ls node_modules | grep $1 >/dev/null 2>&1 || { local return_=0; }
  # return value
  echo "$return_"
}

# display a failure message
function echo_fail {
  printf "Not installed ${1}"
}

# display a success message
function echo_pass {
  printf "OK ${1}"
}

# echo pass or fail
# example
# echo echo_if 1 "Passed"
# echo echo_if 0 "Failed"
function echo_if {
  if [ $1 == 1 ]; then
    echo_pass $2
  else
    echo_fail $2
  fi
}

# command line programs
clineprograms[0]="node"
clineprograms[1]="gulp"

for program in ${clineprograms}; do
  echo "$program -- $(echo_if $(program_is_installed $program))"
done

# local npm packages
nodepackages[0]="gulp"
nodepackages[1]="cheerio"
nodepackages[2]="discord.js"
nodepackages[3]="googleapis"
nodepackages[4]="html-entities"
nodepackages[5]="lastfmapi"
nodepackages[6]="lodash"
nodepackages[7]="moment"
nodepackages[8]="mstranslator"
nodepackages[9]="request"
nodepackages[10]="twit"
nodepackages[11]="url-regex"
nodepackages[12]="youtube-dl"
nodepackages[13]="babel-core"
nodepackages[14]="babel-loader"
nodepackages[15]="babel-preset-es2015"
nodepackages[16]="del"
nodepackages[17]="eslint"
nodepackages[18]="eslint-config-airbnb"
nodepackages[19]="eslint-plugin-import"
nodepackages[20]="eslint-plugin-jsx-a11y"
nodepackages[21]="eslint-plugin-react"
nodepackages[22]="gulp"
nodepackages[23]="webpack-node-externals"
nodepackages[24]="webpack-stream"

for pkg in ${nodepackages}; do
  echo "$pkg -- $(echo_if $(program_is_installed $pkg))"
done

# gulp webpack
# node ./discorcabot.js