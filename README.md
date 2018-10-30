# discdiscorcabot

node.js discord bot :whale: :whale2:

## Setup & Installation

### Install [node.js and npm](http://nodejs.org/)

### Clone discorcabot

### Install dependencies

```
cd discorcabot
npm install
npm install -g gulp
```

### Bot configuration

Rename `opendoors.example.json` to `opendoors.json` and add in your API keys and tokens.

### Last.fm database setup

Rename `lastfmdb.example.json` to `lastfmdb.json`. For information on how to store handles and user info, refer to the relevant section [in the wiki](https://github.com/emyarod/discorcabot/wiki/Commands#add-to-local-database)

### Running the bot

#### Linux

```
bash startbot.sh
```

#### Windows

Double click `startbot.sh`

## Usage

Refer to the [full commands list](https://github.com/emyarod/discorcabot/wiki/Commands) or the [module directories](https://github.com/emyarod/discorcabot/tree/master/src/modules) for more information.

## Modules

### Google search module

### Instagram module

The Instagram module allows the bot to return the most recent post by an Instagram user, along with the caption and post details (if applicable). If the post is an image or album, the bot will embed the image or the first image of the album to its response. Otherwise, the bot will attach the video post.

The bot scrapes the provided user's Instagram profile page for `<script>` tags containing public account info, then maps them in an array. After singling out the `<script>` containing the `window._sharedData` object, the bot can determine whether or not the given user has posted to Instagram as well as if the user's profile is viewable to the public. If the user has posted media and does not have a private profile, the bot will extract the details of the user's most recent post.
