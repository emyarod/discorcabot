# Twitter module

The Twitter module allows the bot to return the most recent tweet by a Twitter user. The bot users Twitter's API to retrieve tweet details for the given Twitter handle, provided that the user is not

## To use the turntable module:

Arguments enclosed in angle brackets (**`< >`**) are **required**, while arguments enclosed in square brackets (**`[ ]`**) are optional. A bar (**`|`**) denotes a multiple choice argument.

### Recent tweet lookup

```
.tw <Twitter handle>
```

Returns the most recent tweet by the given user if the account is not protected.

**Arguments:**

* `<Twitter handle>` the username of the Twitter account to look up