# Turntable module

The turntable module allows everyone in a given voice channel to interactively share and listen to music. Users can listen to the same tracks at the same time, while voting on tracks that are loved or unloved.

## To use the turntable module:

Arguments enclosed in angle brackets (**`< >`**) are **required**, while arguments enclosed in square brackets (**`[ ]`**) are optional. A bar (**`|`**) denotes a multiple choice argument.

### Join channel

```
.dj join
```

Calls the bot to enter yout voice channel

---

### Leave channel

```
.dj part
```

Removes the bot from your voice channel

---

### Print queue

```
.dj list
```

Prints the current queue

---

### Clear queue

```
.dj clear
```

Empties the current queue

---

### Now playing

```
.dj np
```

Prints the currently playing track

---

### Pause

```
.dj pause
```

Pauses audio playback

---

### Resume

```
.dj resume
```

Resumes audio playback

---

### Skip track

```
.dj skip
```

Casts a vote to skip the current track

---

### Play media

```
.dj play <URL | search query>
```

**Arguments:**

* `<URL>` A URL to media for the bot to play back. The bot supports playback from sites listed [here](http://rg3.github.io/youtube-dl/supportedsites.html)

***OR***

* `<search query>` A query to YouTube for the bot to play back the top result

---

### Search for media

```
.dj search [platform] <search query>
```

**Arguments:**

* `[platform]` The platform from which the bot can search. Either `SoundCloud` (or `sc`) or `YouTube` (or `yt`) supported currently. Defaults to YouTube search if no platform is explicitly mentioned

* `<search query>` A query to the chosen platform for the bot to display the top results for you to choose