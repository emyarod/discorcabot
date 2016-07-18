## Last.fm module

The Last.fm module allows the bot to retrieve statistics and information on artists and users in Last.fm's database. When retrieving user info, the bot checks its local database to see if any stored usernames or unique Discord IDs match up with known Last.fm handles before making a request to the Last.fm API.

### To use the Last.fm module:

Arguments enclosed in angle brackets (**`< >`**) are **required**, while arguments enclosed in square brackets (**`[ ]`**) are optional. A bar (**`|`**) denotes a multiple choice argument. Any argument with an at sign (**`@`**) must be a Discord user mention.

#### Similar artists

```
.similar <artist>
```

Returns a list of similar artists as well as a percentage value of how closely the artists match, according to Last.fm.

**Arguments:**

* `<artist>` an artist to compare on Last.fm

#### Artist description

```
.getinfo <artist>
```

Returns Last.fm's biography on the given artist.

**Arguments:**

* `<artist>` an artist to look up on Last.fm

#### Add to local database

```
.addlfm <Last.fm username>
```

Adds an entry in discorcabot's database, linking your unique Discord ID to the provided Last.fm accounts.

**Arguments:**

* `<Last.fm username>` The Last.fm account to be linked to a Discord account

#### Now playing

```
.np [@Discord user | Last.fm handle]
```

Returns the currently playing or most recently scrobbled track on the associated Last.fm account. If no argument is provided, discorcabot will look up its local database to see if the command caller is linked to a Last.fm account, and then fetch the data from Last.fm.

**Arguments:**

* `[@Discord user]` (optional) Check the currently playing or most recently played track of another Discord user who has a Last.fm account connected via Discorcabot

* `[Last.fm handle]` (optional) Check the currently playing or most recently played track of a Last.fm user

#### Weekly charts

```
.charts [@Discord user | Last.fm handle]
```

Returns the given user's top five most played artists in the last seven days on Last.fm. If no argument is provided, discorcabot will look up its local database to see if the command caller is linked to a Last.fm account, and then fetch the data from Last.fm.

**Arguments:**

* `[@Discord user]` (optional) Check the currently playing or most recently played track of another Discord user who has a Last.fm account connected via Discorcabot

* `[Last.fm handle]` (optional) Check the currently playing or most recently played track of a Last.fm user