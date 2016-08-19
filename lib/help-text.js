
module.exports = ` *What is the Demo Bot*
:robot_face: The Demo Bot is an easy to script bot - you simply talk to the bot and teach it what to answer when you say something. The Demo bot supports multiple scripts (personalities) alongside the ability to change it’s name and icon for each.

*How to use the Demo Bot*
> The bot can learn to reply to any text you send, either in DM or in channel in which the bot was invited to.

*Working with your bot*
 * Add the bot to your team and invite it to the appropriate channels (https://beepboophq.com/bots/1d563b4601d44aeca2bda92547894460).
 * Use \`/new-persona [persona name]\` to start a new script (this will automatically switch to the newly created persona)
 * Use \`/set-persona-name [display name]\` to set the name the bot will use to display in this script
 * Use \`/set-persona-icon-url [URL]\` to set the icon the bot will use in this script.
 * Use \`/list-personas\` list known personas.
 * Use \`/load-persona [persona name]\` to switch between scripts
 * :new: Use \`/pin-personas\` to pin the current persona to a channel
 * :new: Use \`/unpin-persona\` to unpin a persona in a channel (defaults back to current)
 * :new: Say \`hello\` to the bot to get the bot name
 * Use \`/learn [you say] \\n [bot say]\` to teach the bot new tricks, see _Training  your bot_ for more details.
 * Run the script by just saying your part of the script the let the bot follow

*Training  your bot*
Use the \`/learn [you say] \\n [bot say]\` slash command to teach the bot what to say. Note the new-line between what you say and what the bot say (Use \`shift\`+\`enter\`)
Here are a few examples:

* Human say “wazzap?” the bot will say ":wave: all good" -
\`\`\`/learn wazzap?
:wave: all good
\`\`\`

* Human say “/report xyz” the bot will say “:dollar: 500K made this week" -
\`\`\`/learn /report xyz
:dollar: 500K made this week
\`\`\`

* Human say “complex” the bot will say _something complex with attachments_ -
\`\`\`/learn complex
{JSON with attachments}
\`\`\`

> Best way to train the demo bot is DMing it. When the bot does not know what to say in DM, it will give you feedback, the bot will say nothing if it does not know what to say in a channel.

`
