## Instagram module

The Instagram module allows the bot to return the most recent post by an Instagram user, along with the caption and post details (if applicable). If the post is an image, the bot will directly attach the image to its reply. Otherwise, the bot will provide a direct link to the video.

The bot scrapes the provided user's Instagram profile page for `<script>` tags containing public account info, then maps them in an array. After singling out the `<script>` containing the `window._sharedData` object, the bot can determine whether or not the given user has posted to Instagram as well as if the user's profile is viewable to the public. If the user has posted media and does not have a private profile, the bot will extract the details of the user's most recent post.

### To use the Instagram module:

Arguments enclosed in angle brackets (**`< >`**) are **required**, while arguments enclosed in square brackets (**`[ ]`**) are optional. A bar (**`|`**) denotes a multiple choice argument. Any argument with an at sign (**`@`**) must be a Discord user mention.

```
.ig <Instagram username>
```

Returns the most recent public post by an Instagram user.

**Arguments:**

* `<Instagram username>` the username of an Instagram user for the bot to look up